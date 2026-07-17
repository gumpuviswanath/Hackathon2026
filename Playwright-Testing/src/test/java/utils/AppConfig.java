package utils;

public class AppConfig {

	// Base URL of the Beyond Banking Customer Onboarding Portal (React SPA, Vite dev server)
	public static final String BASE_URL = System.getProperty("baseUrl", "http://localhost:3005");

	public static final String LOGIN_URL = BASE_URL + "/login";

	public static String moduleUrl(String path) {
		return BASE_URL + path;
	}
}