package pageObjects;

import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.AriaRole;

// KYC Verification page (/kyc) - Pending/Approved/Rejected tabs + decision dialog
public class KycPage extends CommonPage {

	public KycPage(Page page) {
		super(page);
	}

	public void navigate() {
		page.navigate(utils.AppConfig.moduleUrl("/kyc"));
	}

	public void openTab(String tabName) {
		page.getByRole(AriaRole.TAB, new Page.GetByRoleOptions().setName(tabName)).click();
	}

	// Clicks Approve/Reject on the most recently created Pending row matching the given mobile number
	public void clickDecisionButtonForCustomer(String mobile, String decisionButton) {
		openTab("Pending");
		Locator row = tableRowContaining(mobile);
		row.getByRole(AriaRole.BUTTON, new Locator.GetByRoleOptions().setName(decisionButton)).click();
	}

	public void fillReviewerName(String reviewerName) {
		dialog().getByLabel("Reviewer/Approver Name").fill(reviewerName);
	}

	// Onboarding Channel is a non-native MUI Select - opens a listbox, options have role="option"
	public void selectOnboardingChannel(String channel) {
		dialog().getByLabel("Customer Onboarding Channel").click();
		page.getByRole(AriaRole.OPTION, new Page.GetByRoleOptions().setName(channel)).click();
	}

	public void fillDocumentsVerified(String documents) {
		dialog().getByLabel("Documents Provided/Verified").fill(documents);
	}

	public void submitDecision(String decision) {
		dialog().getByRole(AriaRole.BUTTON, new Locator.GetByRoleOptions().setName(decision).setExact(true)).click();
	}

	public boolean isCustomerVisibleInTab(String tabName, String mobile) {
		openTab(tabName);
		return tableRowContaining(mobile).isVisible();
	}
}