# Feature: Product Management
# 
#   Background:
#     Given User navigates to the Beyond Banking login page
#     When User enters username "admin" and password "beyond123"
#     And User clicks on the login button
#     Then User should be logged in successfully
# 
#   Scenario: Verify Product Management page loads correctly
#     Given User registers a new customer with name "David Singh" mobile "9876500007" government id "AADHAR500007" email "david.singh@example.com" and pan number "ABCDE1234L"
#     And User approves the KYC for customer with mobile "9876500007" providing reviewer "Jane Smith" channel "Branch" and documents "Passport (verified)"
#     And User opens an account for customer with mobile "9876500007" with type "Savings" branch "MG Road Branch" currency "INR"
#     And User navigates to the Product module
#     Then User should see the "Product Management" page heading
#     And the newly opened account should be listed under Apply for Products
# 
#   Scenario: Successfully apply for a Personal Loan product
#     Given User registers a new customer with name "Grace Lee" mobile "9876500008" government id "AADHAR500008" email "grace.lee@example.com" and pan number "ABCDE1234M"
#     And User approves the KYC for customer with mobile "9876500008" providing reviewer "Jane Smith" channel "Branch" and documents "Passport (verified)"
#     And User opens an account for customer with mobile "9876500008" with type "Savings" branch "MG Road Branch" currency "INR"
#     And User navigates to the Product module
#     When User applies for product "Personal Loan" against the newly opened account
#     Then User should see the success message "Personal Loan application submitted successfully!"
#     And the new product application should appear under the "Loans" tab
# 
#   Scenario: Successfully apply for a Credit Card product
#     Given User registers a new customer with name "Henry Ford" mobile "9876500009" government id "AADHAR500009" email "henry.ford@example.com" and pan number "ABCDE1234N"
#     And User approves the KYC for customer with mobile "9876500009" providing reviewer "Jane Smith" channel "Branch" and documents "Passport (verified)"
#     And User opens an account for customer with mobile "9876500009" with type "Savings" branch "MG Road Branch" currency "INR"
#     And User navigates to the Product module
#     When User applies for product "Credit Card" against the newly opened account
#     Then User should see the success message "Credit Card application submitted successfully!"
#     And the new product application should appear under the "Credit Cards" tab