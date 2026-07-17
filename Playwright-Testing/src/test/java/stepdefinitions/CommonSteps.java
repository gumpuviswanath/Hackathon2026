package stepdefinitions;

import com.microsoft.playwright.Page;
import hooks.Hooks;
import io.cucumber.java.en.Then;
import pageObjects.CommonPage;

// Generic verification steps reused across every module feature file
// (page heading, buttons, success/error alerts) - the underlying MUI structure
// is identical on every page so one implementation covers them all.
public class CommonSteps {

	private final Page page = Hooks.getPage();
	private final CommonPage commonPage = new CommonPage(page);

	@Then("User should see the {string} page heading")
	public void user_should_see_the_page_heading(String heading) {
		commonPage.verifyHeadingIsPresent(heading);
	}

	@Then("User should see the {string} button")
	public void user_should_see_the_button(String buttonText) {
		commonPage.verifyButtonIsPresent(buttonText);
	}

	@Then("User should see the success message {string}")
	public void user_should_see_the_success_message(String message) {
		commonPage.verifySuccessMessageIsPresent(message);
	}

	@Then("User should see the error message {string}")
	public void user_should_see_the_error_message(String message) {
		commonPage.verifyErrorMessageIsPresent(message);
	}
}