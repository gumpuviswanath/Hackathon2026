package pageObjects;

import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.AriaRole;
import org.junit.Assert;

// Dashboard page (/) - AppBar (hamburger menu + sign out) and sidebar navigation links
public class DashboardPage extends CommonPage {

	public DashboardPage(Page page) {
		super(page);
	}

	// AppBar has exactly two icon buttons: hamburger menu (first) and sign out (last)
	public void openNavigationMenu() {
		page.locator("header button").first().click();
	}

	public void clickSignOut() {
		page.locator("header button[aria-label='Sign out']").click();
	}

	public void verifyMenuLinkIsPresent(String label) {
		boolean visible = page.getByRole(AriaRole.LINK, new Page.GetByRoleOptions().setName(label)).isVisible();
		Assert.assertTrue("Menu link not visible: " + label, visible);
	}
}
