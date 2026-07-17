package stepdefinitions;

import com.microsoft.playwright.Page;
import hooks.Hooks;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.junit.Assert;
import pageObjects.LoginPage;
import utils.AppConfig;

// Login steps - shared as a Background across every module feature file,
// since every module requires an authenticated session first.
public class LoginSteps {

	private final Page page = Hooks.getPage();
	private LoginPage loginPage;

	private LoginPage login() {
		if (loginPage == null) {
			loginPage = new LoginPage(page);
		}
		return loginPage;
	}

	@Given("User navigates to the Beyond Banking login page")
	public

	void user_navigates_to_the_beyond_banking_login_page() {
		login().navigateToLoginPage(AppConfig.LOGIN_URL);
	}

	@When("User enters username {string} and password {string}")
	public void user_enters_username_and_password(String username, String password) {
		login().enterUsername(username);
		login().enterPassword(password);
	}

	@When("User clicks on the login button")
	public void user_clicks_on_the_login_button() {
		login().clickLogin();
	}

	@Then("User should be logged in successfully")
	public void user_should_be_logged_in_successfully() {
		page.waitForURL(url -> !url.contains("/login"));
		Assert.assertFalse("Login failed - still on login page", page.url().contains("/login"));
	}
}