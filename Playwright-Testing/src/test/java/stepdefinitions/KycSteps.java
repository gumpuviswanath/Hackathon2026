package stepdefinitions;

import com.microsoft.playwright.Page;
import hooks.Hooks;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.junit.Assert;
import pageObjects.KycPage;

public class KycSteps {

	private final Page page = Hooks.getPage();
	private KycPage kycPage;

	private KycPage kyc() {
		if (kycPage == null) {
			kycPage = new KycPage(page);
		}
		return kycPage;
	}

	@Given("User navigates to the KYC module")
	public void user_navigates_to_the_kyc_module() {
		kyc().navigate();
	}

	@Then("User should see {string} {string} and {string} tabs")
	public void user_should_see_tabs(String tab1, String tab2, String tab3) {
		kyc().openTab(tab1);
		kyc().openTab(tab2);
		kyc().openTab(tab3);
	}

	@When("User approves the KYC for customer with mobile {string} providing reviewer {string} channel {string} and documents {string}")
	public void user_approves_the_kyc_for_customer(String mobile, String reviewer, String channel, String documents) {
		decide(mobile, "Approve", reviewer, channel, documents, "Approved");
	}

	@When("User rejects the KYC for customer with mobile {string} providing reviewer {string} channel {string} and documents {string}")
	public void user_rejects_the_kyc_for_customer(String mobile, String reviewer, String channel, String documents) {
		decide(mobile, "Reject", reviewer, channel, documents, "Rejected");
	}

	// Note: this same @When step is also reused (via the "Given" keyword) as Background
	// setup by the Account and Product features - Cucumber matches on step text only,
	// so the Gherkin keyword used in a feature file does not need to match the annotation.

	private void decide(String mobile, String actionButton, String reviewer, String channel, String documents, String decisionSubmitText) {
		kyc().navigate();
		kyc().clickDecisionButtonForCustomer(mobile, actionButton);
		kyc().fillReviewerName(reviewer);
		kyc().selectOnboardingChannel(channel);
		kyc().fillDocumentsVerified(documents);
		kyc().submitDecision(decisionSubmitText);
	}

	@Then("customer with mobile {string} should show as approved in the Approved tab")
	public void customer_should_show_as_approved(String mobile) {
		Assert.assertTrue(kyc().isCustomerVisibleInTab("Approved", mobile));
	}

	@Then("customer with mobile {string} should show as rejected in the Rejected tab")
	public void customer_should_show_as_rejected(String mobile) {
		Assert.assertTrue(kyc().isCustomerVisibleInTab("Rejected", mobile));
	}
}