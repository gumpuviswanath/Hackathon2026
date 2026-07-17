package stepdefinitions;

import com.microsoft.playwright.Page;
import hooks.Hooks;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.junit.Assert;
import pageObjects.CustomerPage;

public class CustomerSteps {

	private final Page page = Hooks.getPage();
	private CustomerPage customerPage;

	private CustomerPage customer() {
		if (customerPage == null) {
			customerPage = new CustomerPage(page);
		}
		return customerPage;
	}

	@Given("User navigates to the Customer module")
	public void user_navigates_to_the_customer_module() {
		customer().navigate();
	}

	@When("User clicks on the Register New Customer button")
	public void user_clicks_on_the_register_new_customer_button() {
		customer().openRegisterDialog();
	}

	@When("User enters customer details with name {string} mobile {string} and government id {string}")
	public void user_enters_customer_details(String name, String mobile, String governmentId) {
		customer().fillMandatoryFields(name, mobile, governmentId);
	}

	@When("User clicks on the Register button")
	public void user_clicks_on_the_register_button() {
		customer().clickRegisterSubmit();
	}

	// Convenience step reused as setup (Background) by the KYC, Account and Product features
	@Given("User registers a new customer with name {string} mobile {string} and government id {string}")
	public void user_registers_a_new_customer(String name, String mobile, String governmentId) {
		customer().navigate();
		customer().openRegisterDialog();
		customer().fillMandatoryFields(name, mobile, governmentId);
		customer().clickRegisterSubmit();
		customer().verifySuccessMessageIsPresent("Customer registered successfully!");
	}

	@Then("the newly registered customer with mobile {string} should appear in the customers table")
	public void the_newly_registered_customer_should_appear_in_the_customers_table(String mobile) {
		Assert.assertTrue(customer().isCustomerRowVisible(mobile));
	}
}