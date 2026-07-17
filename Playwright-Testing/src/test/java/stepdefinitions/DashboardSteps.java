package stepdefinitions;

import com.microsoft.playwright.Page;
import hooks.Hooks;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.junit.Assert;
import pageObjects.DashboardPage;

public class DashboardSteps {

	private final Page page = Hooks.getPage();
	private DashboardPage dashboardPage;

	private DashboardPage dashboard() {
		if (dashboardPage == null) {
			dashboardPage = new DashboardPage(page);
		}
		return dashboardPage;
	}

	@When("User opens the navigation menu")
	public void user_opens_the_navigation_menu() {
		dashboard().openNavigationMenu();
	}

	@Then("User should see {string} {string} {string} and {string} links in the menu")
	public void user_should_see_links_in_the_menu(String link1, String link2, String link3, String link4) {
		dashboard().verifyMenuLinkIsPresent(link1);
		dashboard().verifyMenuLinkIsPresent(link2);
		dashboard().verifyMenuLinkIsPresent(link3);
		dashboard().verifyMenuLinkIsPresent(link4);
	}

	@When("User clicks the sign out button")
	public void user_clicks_the_sign_out_button() {
		dashboard().clickSignOut();
	}

	@Then("User should be redirected to the login page")
	public void user_should_be_redirected_to_the_login_page() {
		page.waitForURL(url -> url.contains("/login"));
		Assert.assertTrue("Not redirected to login page", page.url().contains("/login"));
	}
}