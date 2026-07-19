package pageObjects;

import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.AriaRole;

// Customer Management page (/customer) - registration dialog + customers table
public class CustomerPage extends CommonPage {

	public CustomerPage(Page page) {
		super(page);
	}

	public void navigate() {
		page.navigate(utils.AppConfig.moduleUrl("/customer"));
	}

	public void openRegisterDialog() {
		page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Register New Customer")).click();
	}

	public void enterFullName(String name) {
		dialog().getByLabel("Full Name *").fill(name);
	}

	public void enterMobile(String mobile) {
		dialog().getByLabel("Mobile Number *").fill(mobile);
	}

	public void enterGovernmentId(String governmentId) {
		dialog().getByLabel("Government ID *").fill(governmentId);
	}

	public void enterNationality(String nationality) {
		dialog().getByLabel("Nationality/Citizenship").fill(nationality);
	}

	// Fills the mandatory fields only (name, mobile, government id, email, PAN) - enough for a demo registration
	public void fillMandatoryFields(String name, String mobile, String governmentId, String email, String panNumber) {
		enterFullName(name);
		enterMobile(mobile);
		enterGovernmentId(governmentId);
		enterEmail(email);
		enterPanNumber(panNumber);
	}

	public void enterPanNumber(String panNumber) {
		dialog().getByLabel("PAN Number *").fill(panNumber);
	}

	public void enterEmail(String email) {
		dialog().getByLabel("Email *").fill(email);
	}

	public void clickRegisterSubmit() {
		dialog().getByRole(AriaRole.BUTTON, new Locator.GetByRoleOptions().setName("Register").setExact(true)).click();
	}

	public boolean isCustomerRowVisible(String mobile) {
		Locator row = tableRowContaining(mobile);
		return row.isVisible();
	}
}
