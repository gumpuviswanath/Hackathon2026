Feature: KYC Verification

  Background:
    Given User navigates to the Beyond Banking login page
    When User enters username "admin" and password "beyond123"
    And User clicks on the login button
    Then User should be logged in successfully
    And User registers a new customer with name "Bob Kumar" mobile "9876500002" government id "AADHAR500002" and email "bob.kumar@example.com"
    And User navigates to the KYC module

  Scenario: Verify KYC Verification page loads correctly
    Then User should see the "KYC Verification" page heading
    And User should see "Pending" "Approved" and "Rejected" tabs

  Scenario: Approve a pending customer's KYC
    When User approves the KYC for customer with mobile "9876500002" providing reviewer "Jane Smith" channel "Branch" and documents "Passport (verified)"
    Then User should see the success message "Customer approved successfully!"
    And customer with mobile "9876500002" should show as approved in the Approved tab

  Scenario: Reject a pending customer's KYC
    When User rejects the KYC for customer with mobile "9876500002" providing reviewer "Jane Smith" channel "Online" and documents "Passport (unverified)"
    Then User should see the success message "Customer rejected successfully!"
    And customer with mobile "9876500002" should show as rejected in the Rejected tab
