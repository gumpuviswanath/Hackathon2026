# Feature: Account Management
# 
#   Background:
#     Given User navigates to the Beyond Banking login page
#     When User enters username "admin" and password "beyond123"
#     And User clicks on the login button
#     Then User should be logged in successfully
# 
#   Scenario: Verify Account Management page loads correctly
#     Given User registers a new customer with name "Carla Mendes" mobile "9876500003" government id "AADHAR500003"
#     And User approves the KYC for customer with mobile "9876500003" providing reviewer "Jane Smith" channel "Branch" and documents "Passport (verified)"
#     When User navigates to the Account module
#     Then User should see the "Account Management" page heading
#     And customer with mobile "9876500003" should be listed as eligible for account opening
# 
#   Scenario: Validation - a customer without KYC approval is not eligible to open an account
#     Given User registers a new customer with name "Eve Turner" mobile "9876500005" government id "AADHAR500005"
#     When User navigates to the Account module
#     Then customer with mobile "9876500005" should not be listed as eligible for account opening
# 
#   Scenario: Successfully open a new account for a KYC-approved customer
#     Given User registers a new customer with name "Frank Wilson" mobile "9876500006" government id "AADHAR500006"
#     And User approves the KYC for customer with mobile "9876500006" providing reviewer "Jane Smith" channel "Branch" and documents "Passport (verified)"
#     When User opens an account for customer with mobile "9876500006" with type "Savings" branch "MG Road Branch" currency "INR"
#     Then User should see the account opened confirmation with a valid account number
#     And the new account should appear in the Opened Accounts table
