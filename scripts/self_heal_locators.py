#!/usr/bin/env python3
"""
Reads Playwright-Testing/target/cucumber-reports/cucumber.json, finds
locator-class failures (Playwright TimeoutError waiting for a selector), and
for each one asks Aider to pick exactly one of three outcomes:

  1. Stale locator - element still means the same thing, just found
     differently now. Fix scoped to the Page Object method only.
  2. Documented requirement change - the DOM snapshot plus an EXACT-matched
     Jira ticket's acceptance criteria justify a genuinely new requirement
     (e.g. a new mandatory field). Fix may span the feature file, step
     definition, and Page Object.
  3. Unclear / possible regression - neither of the above applies. No file
     changes; flagged as a GitHub issue for human triage instead of a PR.

Every attempted fix (paths 1 and 2) is verified by re-running the whole
feature file it belongs to; anything that doesn't verify is reverted and
flagged as an issue too, so the resulting PR only ever contains fixes that
are actually confirmed working. Writes self-heal-summary.md either way, for
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
STEP_DEF_DIR = PLAYWRIGHT_DIR / "src" / "test" / "java" / "stepdefinitions"

LOCATOR_ERROR_PATTERNS = ["TimeoutError", "waiting for locator", "waiting for selector"]
# GitHub Models' free/rate-limited tier caps requests at ~8000 tokens total,
# which also has to cover Aider's own prompt scaffolding and the files added
# to the chat - keep these tight.
MAX_DOM_CHARS = 6000
MAX_DIFF_CHARS = 1500
NO_FIX_MARKER = "NO_FIX_NO_EVIDENCE"
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


def step_def_file(step_def_class):
    if not step_def_class:
        return None
    candidate = STEP_DEF_DIR / f"{step_def_class}.java"
    return candidate if candidate.exists() else None


def feature_file_path(feature_uri):
    rel = feature_uri[len("file:"):] if feature_uri.startswith("file:") else feature_uri
    path = PLAYWRIGHT_DIR / rel
    return path if path.exists() else None


def dom_snapshot_for(scenario_name):
    path = DOM_SNAPSHOT_DIR / f"{scenario_name.replace(' ', '_')}.html"
    if not path.exists():
        return None
    content = path.read_text(errors="ignore")
    # <head> (styles/scripts/meta) has zero locator signal but eats into the
    # truncation budget before <body> is even reached - drop it.
    content = re.sub(r"<head\b.*?</head>", "", content, flags=re.DOTALL)
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


def _most_recent_pr_row():
    return query_db("SELECT pr_number, title, diff FROM pr_reviews ORDER BY id DESC LIMIT 1;")


def pr_context(pr_number):
    """Returns (context_dict_or_None, is_exact_match_for_the_pr_under_test)."""
    row = None
    exact = False
    if pr_number:
        row = query_db(
            f"SELECT pr_number, title, diff FROM pr_reviews "
            f"WHERE pr_number = {int(pr_number)} ORDER BY id DESC LIMIT 1;"
        )
        exact = row is not None
    if not row:
        row = _most_recent_pr_row()
    if not row:
        return None, False
    parts = row.split("\x1f")
    if len(parts) < 3:
        return None, False
    diff = parts[2]
    if len(diff) > MAX_DIFF_CHARS:
        diff = diff[:MAX_DIFF_CHARS] + "\n... (truncated)"
    return {"pr_number": parts[0], "title": parts[1], "diff": diff}, exact


def _most_recent_jira_row():
    return query_db(
        "SELECT jira_key, summary, description, acceptance_criteria "
        "FROM jira_pr_details ORDER BY id DESC LIMIT 1;"
    )


def jira_context(pr_number):
    """Returns (context_dict_or_None, is_exact_match_for_the_pr_under_test)."""
    row = None
    exact = False
    if pr_number:
        row = query_db(
            f"SELECT jira_key, summary, description, acceptance_criteria "
            f"FROM jira_pr_details WHERE pr_number = {int(pr_number)} ORDER BY id DESC LIMIT 1;"
        )
        exact = row is not None
    if not row:
        row = _most_recent_jira_row()
    if not row:
        return None, False
    parts = row.split("\x1f")
    if len(parts) < 4:
        return None, False
    return {
        "jira_key": parts[0], "summary": parts[1],
        "description": parts[2], "acceptance_criteria": parts[3],
    }, exact


def build_prompt(failure, dom_html, pr_ctx, pr_exact, jira_ctx, jira_exact):
    lines = [
        "A Playwright/Cucumber test step is failing. Diagnose why using the "
        "context below, then take exactly ONE of these three actions.",
        "",
        "1. STALE LOCATOR: the element still exists and means the same thing, "
        "just found differently now (e.g. a renamed CSS class/attribute). Fix "
        "ONLY the Page Object locator method. Do not touch the feature file or "
        "step definition.",
        "",
        "2. DOCUMENTED REQUIREMENT CHANGE: the DOM snapshot and the Jira ticket "
        "below together show a genuinely NEW requirement (e.g. a new mandatory "
        "field) that this existing test doesn't account for. Only take this "
        "path if the Jira context is marked 'EXACT MATCH for the PR under "
        "test' AND its acceptance criteria clearly and specifically justify "
        "THIS failing flow - a vague, unrelated, or best-effort/unmatched Jira "
        "ticket is NOT sufficient justification. If justified, update "
        "whichever of the feature file / step definition / Page Object are "
        "needed to satisfy the new requirement.",
        "",
        f"3. UNCLEAR / POSSIBLE REGRESSION: neither of the above applies. Make "
        f"NO file changes at all - this may be a genuine bug, and a human "
        f"needs to triage it. End your entire response with exactly this line "
        f"and nothing after it: {NO_FIX_MARKER}",
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
        label = "EXACT MATCH for the PR under test" if pr_exact else \
            "best-effort - most recent PR on record, NOT confirmed related to this failure"
        lines += [
            f"PR context ({label}) - #{pr_ctx['pr_number']}: {pr_ctx['title']}",
            "```diff",
            pr_ctx["diff"],
            "```",
            "",
        ]
    if jira_ctx:
        label = "EXACT MATCH for the PR under test" if jira_exact else \
            "best-effort - most recent Jira ticket on record, NOT confirmed related to this failure"
        lines += [
            f"Jira context ({label}) - {jira_ctx['jira_key']}: {jira_ctx['summary']}",
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
        # The repo-map (a survey of all 113 files) is unnecessary given the
        # files are already named explicitly, and GitHub Models' free tier
        # has an ~8000 token request cap that doesn't leave room for it.
        "--map-tokens", "0",
    ]
    cmd += [str(f) for f in files_to_edit]

    print("Running:", " ".join(cmd))
    result = subprocess.run(cmd, cwd=REPO_ROOT, capture_output=True, text=True, timeout=600)
    output = result.stdout[-4000:]
    print(output)
    print(result.stderr[-2000:])
    return result.returncode == 0, output


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


def verify_feature(feature_path):
    # Whole feature file, not just the one scenario - path 2 fixes can touch
    # step definitions/Page Object methods shared by other scenarios in it.
    rel = feature_path.relative_to(PLAYWRIGHT_DIR).as_posix()
    cmd = ["mvn", "-B", "-q", "test", f"-Dcucumber.features={rel}", "-Dheadless=true"]
    subprocess.run(cmd, cwd=PLAYWRIGHT_DIR, capture_output=True, text=True, timeout=600)
    return not has_any_failed_steps()


def git_head():
    result = subprocess.run(["git", "rev-parse", "HEAD"], cwd=REPO_ROOT, capture_output=True, text=True)
    return result.stdout.strip()


def git_reset_hard(sha):
    subprocess.run(["git", "reset", "--hard", sha], cwd=REPO_ROOT, capture_output=True, text=True)


def open_github_issue(failure, aider_output):
    title = f"Self-heal: needs triage - {failure['scenario_name']}"
    body_lines = [
        "`self-heal-locators.yml` found this failure but could not confidently "
        "auto-fix it (or an attempted fix didn't verify) - flagging for human "
        "review since it doesn't look like a simple stale locator and there's "
        "no clear documented requirement change justifying it.",
        "",
        f"**Feature file:** {failure['feature_uri']}",
        f"**Scenario:** {failure['scenario_name']}",
        f"**Failing step:** {failure['step_text']}",
        "",
        "**Error:**",
        "```",
        failure["error_message"][:2000],
        "```",
    ]
    if aider_output:
        body_lines += ["", "**Aider's diagnosis:**", "```", aider_output[-2000:], "```"]
    body_file = Path("/tmp/self-heal-issue-body.md")
    body_file.write_text("\n".join(body_lines))
    result = subprocess.run(
        ["gh", "issue", "create", "--title", title, "--body-file", str(body_file)],
        cwd=REPO_ROOT, capture_output=True, text=True,
    )
    print(result.stdout, result.stderr)


def main():
    failures = find_locator_failures()
    if not failures:
        SUMMARY_PATH.write_text("No locator-class failures found in this run.\n")
        print("No locator-class failures found - nothing to self-heal.")
        return 0

    print(f"Found {len(failures)} locator-class failure(s).")
    pr_number = os.environ.get("PR_NUMBER") or None
    pr_ctx, pr_exact = pr_context(pr_number)
    jira_ctx, jira_exact = jira_context(pr_number)
    print(f"PR context: {'exact match' if pr_exact else 'best-effort'}; "
          f"Jira context: {'exact match' if jira_exact else 'best-effort'}")

    summary_lines = ["# Self-Heal Locators - Summary", ""]

    for failure in failures:
        page_object = infer_page_object(failure["step_def_class"])
        if not page_object:
            summary_lines.append(
                f"- **{failure['scenario_name']}**: could not infer a Page Object "
                f"class from step definition `{failure['step_def_class']}`; skipped."
            )
            continue

        common_page = PAGE_OBJECT_DIR / "CommonPage.java"
        step_def = step_def_file(failure["step_def_class"])
        feature_path = feature_file_path(failure["feature_uri"])
        files_to_edit = [f for f in [page_object, common_page, step_def, feature_path] if f]

        dom_html = dom_snapshot_for(failure["scenario_name"])
        prompt = build_prompt(failure, dom_html, pr_ctx, pr_exact, jira_ctx, jira_exact)

        print(f"\n=== Healing: {failure['scenario_name']} ===")
        pre_attempt_sha = git_head()
        ok, aider_output = run_aider(prompt, files_to_edit)
        if not ok:
            summary_lines.append(f"- **{failure['scenario_name']}**: Aider run errored; no fix applied.")
            continue

        if git_head() == pre_attempt_sha:
            print("No changes made - flagging for human triage.")
            open_github_issue(failure, aider_output)
            summary_lines.append(f"- **{failure['scenario_name']}**: no confident fix - opened a GitHub issue for triage.")
            continue

        verified = verify_feature(feature_path) if feature_path else False
        if verified:
            edited = ", ".join(f.name for f in files_to_edit if f.exists())
            summary_lines.append(f"- **{failure['scenario_name']}** (VERIFIED - feature file now passes): edited {edited}")
        else:
            print("Fix did not verify - reverting and flagging for human triage.")
            git_reset_hard(pre_attempt_sha)
            open_github_issue(failure, aider_output)
            summary_lines.append(f"- **{failure['scenario_name']}**: attempted fix did not verify, reverted - opened a GitHub issue for triage.")

    SUMMARY_PATH.write_text("\n".join(summary_lines) + "\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
