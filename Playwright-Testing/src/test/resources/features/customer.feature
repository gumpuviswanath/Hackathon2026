Feature: Customer Management

  Background:
    Given User navigates to the Beyond Banking login page
    When User enters username "admin" and password "beyond123"
    And User clicks on the login button
    Then User should be logged in successfully
    And User navigates to the Customer module

  Scenario: Verify Customer Management page loads correctly
    Then User should see the "Customer Management" page heading
    And User should see the "Register New Customer" button

  Scenario: Validation error when registering a customer without mandatory fields
    When User clicks on the Register New Customer button
    And User clicks on the Register button
    Then User should see the error message "Please fill all required fields"

  Scenario: Successfully register a new customer with valid mandatory details
    When User clicks on the Register New Customer button
    And User enters customer details with name "Alice Johnson" mobile "9876500001" government id "AADHAR500001" and email "alice.johnson@example.com"
    And User clicks on the Register button
    Then User should see the success message "Customer registered successfully!"
    And the newly registered customer with mobile "9876500001" should appear in the customers table
