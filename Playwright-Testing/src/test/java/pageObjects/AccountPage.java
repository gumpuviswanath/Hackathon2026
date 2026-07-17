package pageObjects;

import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.AriaRole;
import com.microsoft.playwright.options.WaitForSelectorState;

// Account Management page (/account) - eligible customers table + account creation dialog
public class AccountPage extends CommonPage {

	public AccountPage(Page page) {
		super(page);
	}

	public void navigate() {
		page.navigate(utils.AppConfig.moduleUrl("/account"));
	}

	private Locator eligibleCustomerRow(String mobile) {
		return tableRowContaining(mobile);
	}

	public void openAccountDialogForCustomer(String mobile) {
		eligibleCustomerRow(mobile).getByRole(AriaRole.BUTTON, new Locator.GetByRoleOptions().setName("Open Account")).click();
	}

	// The eligible-customers endpoint only returns KYC-approved customers (see
	// AccountController.eligibleCustomers()), so a non-approved customer never appears
	// in this table at all - there's no disabled-button state to check in practice.
	//
	// The "Eligible Customers" table is the only one on this page gated behind a loading
	// spinner - the "Opened Accounts" table below it renders unconditionally (with its own
	// "No accounts opened yet" placeholder row present from the very first paint). Waiting
	// for "any table row" therefore resolves against the wrong table's placeholder before
	// the eligible-customers fetch has even finished, so wait for this table's own spinner
	// to clear instead.
	public boolean isCustomerListedAsEligible(String mobile) {
		page.locator(".MuiCircularProgress-root").first()
				.waitFor(new Locator.WaitForOptions().setState(WaitForSelectorState.HIDDEN).setTimeout(10000));
		return page.locator("tr", new Page.LocatorOptions().setHasText(mobile)).count() > 0;
	}

	// Account Type / Currency / Debit Card Type are native <select> elements (SelectProps.native)
	public void selectAccountType(String accountType) {
		dialog().getByLabel("Account Type").selectOption(accountType);
	}

	public void enterBranch(String branch) {
		dialog().getByLabel("Branch of Account Opening").fill(branch);
	}

	public void selectCurrency(String currency) {
		dialog().getByLabel("Currency of Account").selectOption(currency);
	}

	public void clickCreateAccount() {
		dialog().getByRole(AriaRole.BUTTON, new Locator.GetByRoleOptions().setName("Create Account")).click();
	}

	// Reads the auto-generated account number off the "Account Opened Successfully" confirmation dialog.
	// getByText("Account Number:") would resolve to the inner <strong> tag (its own text is an exact
	// match for the query), not the surrounding line that also holds the value - so read the whole
	// dialog's text and regex out the value instead.
	public String readCreatedAccountNumber() {
		Locator dlg = dialog();
		dlg.getByText("Account Number:").first().waitFor();
		String fullText = dlg.innerText();
		java.util.regex.Matcher matcher = java.util.regex.Pattern.compile("Account Number:\\s*(\\S+)").matcher(fullText);
		if (!matcher.find()) {
			throw new IllegalStateException("Could not find account number in confirmation dialog: " + fullText);
		}
		return matcher.group(1);
	}

	public void closeCreatedAccountDialog() {
		dialog().getByRole(AriaRole.BUTTON, new Locator.GetByRoleOptions().setName("Close")).click();
	}

	public boolean isAccountVisibleInOpenedTable(String accountNumber) {
		return tableRowContaining(accountNumber).isVisible();
	}
}