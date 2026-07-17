Feature: Dashboard Overview

  Background:
    Given User navigates to the Beyond Banking login page
    When User enters username "admin" and password "beyond123"
    And User clicks on the login button
    Then User should be logged in successfully

  Scenario: Verify dashboard loads with navigation menu links
    Then User should see the "Dashboard Overview" page heading
    When User opens the navigation menu
    Then User should see "Customer" "KYC" "Account" and "Product" links in the menu

  Scenario: Verify user can log out successfully
    When User opens the navigation menu
    And User clicks the sign out button
    Then User should be redirected to the login page