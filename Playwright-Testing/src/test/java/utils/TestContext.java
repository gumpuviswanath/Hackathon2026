package utils;

// Holds small bits of state generated at runtime (e.g. auto-generated account numbers)
// that need to be handed off between step definition classes within the same scenario.
public class TestContext {

	public static String lastAccountNumber;
}