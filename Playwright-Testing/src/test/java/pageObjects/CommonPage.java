package pageObjects;

import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.AriaRole;
import org.junit.Assert;

// Reusable checks shared across every module page (heading text, buttons,
// success/error alerts, and the MUI Dialog that every "create" form opens in).
public class CommonPage {

	protected final Page page;

	public CommonPage(Page page) {
		this.page = page;
	}

	// The currently open MUI Dialog (role="dialog"). Scoping locators to this
	// avoids ambiguity when a button's text also appears elsewhere on the page.
	public Locator dialog() {
		return page.getByRole(AriaRole.DIALOG);
	}

	// Pages fetch their data asynchronously after the initial page load (e.g. Dashboard
	// shows a spinner until loadDashboard() resolves), so heading/button checks need to
	// wait for the element to attach rather than snapshot visibility immediately - isVisible()
	// alone does not wait.
	public void verifyHeadingIsPresent(String heading) {
		Locator locator = page.getByText(heading).first();
		locator.waitFor(new Locator.WaitForOptions().setTimeout(10000));
		Assert.assertTrue("Heading not visible: " + heading, locator.isVisible());
	}

	public void verifyButtonIsPresent(String buttonText) {
		Locator locator = page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName(buttonText)).first();
		locator.waitFor(new Locator.WaitForOptions().setTimeout(10000));
		Assert.assertTrue("Button not visible: " + buttonText, locator.isVisible());
	}

	public void verifySuccessMessageIsPresent(String message) {
		Locator alert = page.locator("text=" + message);
		alert.first().waitFor(new Locator.WaitForOptions().setTimeout(5000));
		Assert.assertTrue("Success message not visible: " + message, alert.first().isVisible());
	}

	public void verifyErrorMessageIsPresent(String message) {
		Locator alert = page.getByText(message);
		alert.first().waitFor(new Locator.WaitForOptions().setTimeout(5000));
		Assert.assertTrue("Error message not visible: " + message, alert.first().isVisible());
	}

	// The nearest ancestor <tr> of the row containing the given text.
	// .first() picks the most recently created match, since every module table
	// in this app lists records newest-first. Waits for the row to attach, since
	// the table's data loads asynchronously after navigation.
	public Locator tableRowContaining(String text) {
		Locator row = page.locator("tr", new Page.LocatorOptions().setHasText(text)).first();
		row.waitFor(new Locator.WaitForOptions().setTimeout(10000));
		return row;
	}
}
