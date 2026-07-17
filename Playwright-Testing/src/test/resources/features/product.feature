Feature: Product Management

  Background:
    Given User navigates to the Beyond Banking login page
    When User enters username "admin" and password "beyond123"
    And User clicks on the login button
    Then User should be logged in successfully
    And User registers a new customer with name "David Singh" mobile "9876500004" and government id "AADHAR500004"
    And User approves the KYC for customer with mobile "9876500004" providing reviewer "Jane Smith" channel "Branch" and documents "Passport (verified)"
    And User opens an account for customer with mobile "9876500004" with type "Savings" branch "MG Road Branch" currency "INR"
    And User navigates to the Product module

  Scenario: Verify Product Management page loads correctly
    Then User should see the "Product Management" page heading
    And the newly opened account should be listed under Apply for Products

  Scenario: Successfully apply for a Personal Loan product
    When User applies for product "Personal Loan" against the newly opened account
    Then User should see the success message "Personal Loan application submitted successfully!"
    And the new product application should appear under the "Loans" tab

  Scenario: Successfully apply for a Credit Card product
    When User applies for product "Credit Card" against the newly opened account
    Then User should see the success message "Credit Card application submitted successfully!"
    And the new product application should appear under the "Credit Cards" tab