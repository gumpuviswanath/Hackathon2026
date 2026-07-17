package pageObjects;

import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.AriaRole;

public class LoginPage {

	private final Page page;

	public LoginPage(Page page) {
		this.page = page;
	}

	// Navigate to the Beyond Banking Staff Portal login page
	public void navigateToLoginPage(String url) {
		page.navigate(url);
	}

	// MUI TextField labeled "Username" (no id/name attribute, associate via label)
	public void enterUsername(String username) {
		page.getByLabel("Username").fill(username);
	}

	// MUI TextField labeled "Password"
	public void enterPassword(String password) {
		page.getByLabel("Password").fill(password);
	}

	// "Sign In" submit button
	public void clickLogin() {
		page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Sign In")).click();
	}
}