package stepdefinitions;

import com.microsoft.playwright.Page;
import hooks.Hooks;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.junit.Assert;
import pageObjects.AccountPage;
import utils.TestContext;

public class AccountSteps {

	private final Page page = Hooks.getPage();
	private AccountPage accountPage;

	private AccountPage account() {
		if (accountPage == null) {
			accountPage = new AccountPage(page);
		}
		return accountPage;
	}

	@Given("User navigates to the Account module")
	public void user_navigates_to_the_account_module() {
		account().navigate();
	}

	@Then("customer with mobile {string} should be listed as eligible for account opening")
	public void customer_should_be_listed_as_eligible(String mobile) {
		Assert.assertTrue("KYC-approved customer should be listed as eligible for an account",
				account().isCustomerListedAsEligible(mobile));
	}

	@Then("customer with mobile {string} should not be listed as eligible for account opening")
	public void customer_should_not_be_listed_as_eligible(String mobile) {
		Assert.assertFalse("Customer without KYC approval should not be listed as eligible for an account",
				account().isCustomerListedAsEligible(mobile));
	}

	// Note: this same @When step is also reused (via the "Given" keyword) as Background
	// setup by the Product feature - Cucumber matches on step text only.
	@When("User opens an account for customer with mobile {string} with type {string} branch {string} currency {string}")
	public void user_opens_an_account_for_customer(String mobile, String accountType, String branch, String currency) {
		account().navigate();
		account().openAccountDialogForCustomer(mobile);
		account().selectAccountType(accountType);
		account().enterBranch(branch);
		account().selectCurrency(currency);
		account().clickCreateAccount();
		TestContext.lastAccountNumber = account().readCreatedAccountNumber();
		account().closeCreatedAccountDialog();
	}

	@Then("User should see the account opened confirmation with a valid account number")
	public void user_should_see_the_account_opened_confirmation() {
		Assert.assertNotNull("Account number was not captured", TestContext.lastAccountNumber);
		Assert.assertFalse("Account number should not be blank", TestContext.lastAccountNumber.isBlank());
	}

	@Then("the new account should appear in the Opened Accounts table")
	public void the_new_account_should_appear_in_the_opened_accounts_table() {
		Assert.assertTrue(account().isAccountVisibleInOpenedTable(TestContext.lastAccountNumber));
	}
}