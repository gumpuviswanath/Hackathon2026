package stepdefinitions;

import com.microsoft.playwright.Page;
import hooks.Hooks;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.junit.Assert;
import pageObjects.ProductPage;
import utils.TestContext;

public class ProductSteps {

	private final Page page = Hooks.getPage();
	private ProductPage productPage;

	private ProductPage product() {
		if (productPage == null) {
			productPage = new ProductPage(page);
		}
		return productPage;
	}

	@Given("User navigates to the Product module")
	public void user_navigates_to_the_product_module() {
		product().navigate();
	}

	@Then("the newly opened account should be listed under Apply for Products")
	public void the_newly_opened_account_should_be_listed() {
		Assert.assertTrue(product().isAccountListedForApplication(TestContext.lastAccountNumber));
	}

	@When("User applies for product {string} against the newly opened account")
	public void user_applies_for_product_against_the_newly_opened_account(String productType) {
		product().navigate();
		product().openApplyDialogForAccount(TestContext.lastAccountNumber);
		product().selectProductType(productType);
		product().submitApplication();
	}

	@Then("the new product application should appear under the {string} tab")
	public void the_new_product_application_should_appear_under_the_tab(String tabName) {
		Assert.assertTrue(product().isProductVisibleInTab(tabName, TestContext.lastAccountNumber));
	}
}