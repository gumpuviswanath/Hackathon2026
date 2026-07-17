#!/usr/bin/env python3
"""
Reads Playwright-Testing/target/cucumber-reports/cucumber.json, finds
locator-class failures (Playwright TimeoutError waiting for a selector),
gathers context for each (DOM snapshot at the moment of failure, most recent
PR diff / Jira acceptance criteria from the hosted database), drives Aider to
propose a fix scoped to the relevant Page Object class, and verifies the fix
by re-running just that scenario. Writes self-heal-summary.md either way, for
the PR body.

Run from the repo root with the full app stack (backends + portal) already up
- verification re-runs the suite against it.
"""
import json
import os
import re
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
PLAYWRIGHT_DIR = REPO_ROOT / "Playwright-Testing"
CUCUMBER_JSON = PLAYWRIGHT_DIR / "target" / "cucumber-reports" / "cucumber.json"
DOM_SNAPSHOT_DIR = PLAYWRIGHT_DIR / "target" / "dom-snapshots"
PAGE_OBJECT_DIR = PLAYWRIGHT_DIR / "src" / "test" / "java" / "pageObjects"

LOCATOR_ERROR_PATTERNS = ["TimeoutError", "waiting for locator", "waiting for selector"]
# GitHub Models' free/rate-limited tier caps requests at ~8000 tokens total,
# which also has to cover Aider's own prompt scaffolding and the two Java
# files added to the chat - keep these tight.
MAX_DOM_CHARS = 4000
MAX_DIFF_CHARS = 1500
SUMMARY_PATH = REPO_ROOT / "self-heal-summary.md"


def find_locator_failures():
    if not CUCUMBER_JSON.exists():
        print(f"No cucumber.json at {CUCUMBER_JSON}")
        return []

    with open(CUCUMBER_JSON) as f:
        features = json.load(f)

    failures = []
    for feature in features:
        feature_uri = feature.get("uri", "")
        for element in feature.get("elements", []):
            scenario_name = element.get("name", "")
            for step in element.get("steps", []):
                result = step.get("result", {})
                if result.get("status") != "failed":
                    continue
                error_message = result.get("error_message", "") or ""
                if not any(p in error_message for p in LOCATOR_ERROR_PATTERNS):
                    continue
                failures.append({
                    "feature_uri": feature_uri,
                    "scenario_name": scenario_name,
                    "step_text": step.get("name", ""),
                    "error_message": error_message,
                    "step_def_class": extract_step_def_class(error_message),
                })
    return failures


def extract_step_def_class(error_message):
    # e.g. "at stepdefinitions.KycSteps.decide(KycSteps.java:51)"
    match = re.search(r"at stepdefinitions\.(\w+)\.", error_message)
    return match.group(1) if match else None


def infer_page_object(step_def_class):
    if not step_def_class:
        return None
    # Naming convention already used throughout this suite: XSteps -> XPage.
    candidate = PAGE_OBJECT_DIR / f"{step_def_class.replace('Steps', 'Page')}.java"
    return candidate if candidate.exists() else None


def dom_snapshot_for(scenario_name):
    path = DOM_SNAPSHOT_DIR / f"{scenario_name.replace(' ', '_')}.html"
    if not path.exists():
        return None
    content = path.read_text(errors="ignore")
    # Inline SVG icon markup (MUI apps embed a lot of it) is pure visual noise
    # for locator diagnosis but expensive in tokens - strip it before truncating.
    content = re.sub(r"<svg\b.*?</svg>", "<svg/>", content, flags=re.DOTALL)
    if len(content) > MAX_DOM_CHARS:
        content = content[:MAX_DOM_CHARS] + "\n<!-- truncated -->"
    return content


def query_db(sql):
    database_url = os.environ.get("DATABASE_URL")
    if not database_url:
        return None
    try:
        result = subprocess.run(
            ["psql", database_url, "-t", "-A", "-F", "\x1f", "-c", sql],
            capture_output=True, text=True, timeout=30, check=True,
        )
        return result.stdout.strip() or None
    except Exception as e:
        print(f"DB query failed: {e}")
        return None


def recent_pr_context():
    # Best-effort: the most recent row on record, not a guaranteed match to
    # whichever PR actually caused this specific failure - e2e-extent-report.yml
    # runs per-branch, not per-PR, so there's no strict linkage. Still useful
    # signal for "what changed recently."
    row = query_db("SELECT pr_number, title, diff FROM pr_reviews ORDER BY id DESC LIMIT 1;")
    if not row:
        return None
    parts = row.split("\x1f")
    if len(parts) < 3:
        return None
    diff = parts[2]
    if len(diff) > MAX_DIFF_CHARS:
        diff = diff[:MAX_DIFF_CHARS] + "\n... (truncated)"
    return {"pr_number": parts[0], "title": parts[1], "diff": diff}


def recent_jira_context():
    row = query_db(
        "SELECT jira_key, summary, description, acceptance_criteria "
        "FROM jira_pr_details ORDER BY id DESC LIMIT 1;"
    )
    if not row:
        return None
    parts = row.split("\x1f")
    if len(parts) < 4:
        return None
    return {"jira_key": parts[0], "summary": parts[1], "description": parts[2], "acceptance_criteria": parts[3]}


def build_prompt(failure, dom_html, pr_ctx, jira_ctx):
    lines = [
        "A Playwright/Cucumber test step is failing because a locator can no "
        "longer find the element it's looking for. Diagnose the correct locator "
        "from the live DOM snapshot below and fix the Page Object method that "
        "builds it. Only change locator logic - do not change unrelated "
        "behavior. If the DOM snapshot shows the element genuinely no longer "
        "exists or the flow has materially changed (not just a renamed "
        "attribute/selector), say so instead of guessing a fix.",
        "",
        f"Feature file: {failure['feature_uri']}",
        f"Scenario: {failure['scenario_name']}",
        f"Failing step: {failure['step_text']}",
        "",
        "Error:",
        failure["error_message"][:3000],
        "",
    ]
    if pr_ctx:
        lines += [
            f"Most recent PR on record (#{pr_ctx['pr_number']}: {pr_ctx['title']}) - "
            "may or may not be what caused this specific breakage, but is the most "
            "recent known code change:",
            "```diff",
            pr_ctx["diff"],
            "```",
            "",
        ]
    if jira_ctx:
        lines += [
            f"Most recent linked Jira ticket ({jira_ctx['jira_key']}): {jira_ctx['summary']}",
            f"Description: {jira_ctx['description']}",
            f"Acceptance criteria: {jira_ctx['acceptance_criteria']}",
            "",
        ]
    if dom_html:
        lines += ["Live DOM snapshot captured at the moment of failure:", "```html", dom_html, "```"]
    return "\n".join(lines)


def run_aider(prompt_text, files_to_edit):
    prompt_file = Path("/tmp/self-heal-prompt.txt")
    prompt_file.write_text(prompt_text)

    model = os.environ.get("AIDER_MODEL", "github/gpt-4o")
    cmd = [
        "aider", "--model", model, "--message-file", str(prompt_file),
        "--yes-always", "--no-check-update", "--no-detect-urls",
        # The repo-map (a survey of all 113 files) is unnecessary for a fix
        # scoped to two known files, and GitHub Models' free tier has an
        # ~8000 token request cap that doesn't leave room for it.
        "--map-tokens", "0",
    ]
    cmd += [str(f) for f in files_to_edit]

    print("Running:", " ".join(cmd))
    result = subprocess.run(cmd, cwd=REPO_ROOT, capture_output=True, text=True, timeout=600)
    print(result.stdout[-4000:])
    print(result.stderr[-2000:])
    return result.returncode == 0


def has_any_failed_steps():
    if not CUCUMBER_JSON.exists():
        return True
    with open(CUCUMBER_JSON) as f:
        features = json.load(f)
    return any(
        step.get("result", {}).get("status") == "failed"
        for feature in features
        for element in feature.get("elements", [])
        for step in element.get("steps", [])
    )


def verify_scenario(scenario_name):
    cmd = [
        "mvn", "-B", "-q", "test",
        f"-Dcucumber.filter.name={re.escape(scenario_name)}",
        "-Dheadless=true",
    ]
    subprocess.run(cmd, cwd=PLAYWRIGHT_DIR, capture_output=True, text=True, timeout=300)
    return not has_any_failed_steps()


def main():
    failures = find_locator_failures()
    if not failures:
        SUMMARY_PATH.write_text("No locator-class failures found in this run.\n")
        print("No locator-class failures found - nothing to self-heal.")
        return 0

    print(f"Found {len(failures)} locator-class failure(s).")
    pr_ctx = recent_pr_context()
    jira_ctx = recent_jira_context()

    summary_lines = ["# Self-Heal Locators - Summary", ""]

    for failure in failures:
        page_object = infer_page_object(failure["step_def_class"])
        common_page = PAGE_OBJECT_DIR / "CommonPage.java"
        files_to_edit = [f for f in [page_object, common_page] if f]

        if not files_to_edit:
            summary_lines.append(
                f"- **{failure['scenario_name']}**: could not infer a Page Object "
                f"class from step definition `{failure['step_def_class']}`; skipped."
            )
            continue

        dom_html = dom_snapshot_for(failure["scenario_name"])
        prompt = build_prompt(failure, dom_html, pr_ctx, jira_ctx)

        print(f"\n=== Healing: {failure['scenario_name']} ===")
        if not run_aider(prompt, files_to_edit):
            summary_lines.append(f"- **{failure['scenario_name']}**: Aider run errored; no fix applied.")
            continue

        verified = verify_scenario(failure["scenario_name"])
        status = "VERIFIED - scenario now passes" if verified else "UNVERIFIED - still failing after the attempted fix"
        edited = ", ".join(f.name for f in files_to_edit)
        summary_lines.append(f"- **{failure['scenario_name']}** ({status}): edited {edited}")

    SUMMARY_PATH.write_text("\n".join(summary_lines) + "\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
