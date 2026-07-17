package pageObjects;

import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.AriaRole;

// Product Management page (/product) - accounts table (apply) + tabbed applications table
public class ProductPage extends CommonPage {

	public ProductPage(Page page) {
		super(page);
	}

	public void navigate() {
		page.navigate(utils.AppConfig.moduleUrl("/product"));
	}

	public void openApplyDialogForAccount(String accountNumber) {
		tableRowContaining(accountNumber).getByRole(AriaRole.BUTTON, new Locator.GetByRoleOptions().setName("Apply")).click();
	}

	// Product Type is a native <select> (SelectProps.native) with <optgroup>/<option> values
	public void selectProductType(String productType) {
		dialog().getByLabel("Product Type").selectOption(productType);
	}

	public void submitApplication() {
		dialog().getByRole(AriaRole.BUTTON, new Locator.GetByRoleOptions().setName("Submit Application")).click();
	}

	public void openTab(String tabName) {
		page.getByRole(AriaRole.TAB, new Page.GetByRoleOptions().setName(tabName)).click();
	}

	public boolean isAccountListedForApplication(String accountNumber) {
		return tableRowContaining(accountNumber).isVisible();
	}

	public boolean isProductVisibleInTab(String tabName, String accountNumber) {
		openTab(tabName);
		return tableRowContaining(accountNumber).isVisible();
	}
}