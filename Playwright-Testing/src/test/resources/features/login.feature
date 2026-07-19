@regression
Feature: Login to Beyond Banking Staff Portal

  Scenario: Successful login with valid credentials
    Given User navigates to the Beyond Banking login page
    When User enters username "admin" and password "beyond123"
    And User clicks on the login button
    Then User should be logged in successfully

  Scenario: Unsuccessful login with invalid credentials
    Given User navigates to the Beyond Banking login page
    When User enters username "admin" and password "wrongpassword"
    And User clicks on the login button
    Then User should see the error message "Incorrect username or password."