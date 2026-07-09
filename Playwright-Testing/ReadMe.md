# Playwright Project

## Overview
This repository contains an automation testing framework built using **Playwright with Java, Maven, and Cucumber**. The project is designed to provide a structured and scalable solution for UI automation, leveraging the power of Playwright for cross-browser testing.

## Features
- **Playwright for UI automation** across multiple browsers.
- **Java and Maven** for dependency management and build execution.
- **Cucumber BDD integration** for behavior-driven testing.
- **Structured test framework** with reusable components.
- **Easy-to-maintain test scripts** with clear reporting and logging mechanisms.

## Project Setup
### Prerequisites
- Install **Java (JDK 11 or later)**
- Install **Maven**
- Install **Node.js** (required for Playwright)
- Install required dependencies using Maven:
  ```sh
  mvn clean install
  ```

### Running Tests
To execute the test suite, use the following command:
```sh
mvn test
```
For running specific feature files:
```sh
mvn test -Dcucumber.options="src/test/resources/features/yourFeatureFile.feature"
```

## Folder Structure
```
📂 PlaywrightDemoTest  # Root directory of the Playwright project
 ├── 📂 src
 │   ├── 📂 main
 │   │   ├── 📂 java             # (Empty for now, used for main application code if needed)
 │   │   ├── 📂 resources        # Stores configuration files, test data, and logs
 │
 │   ├── 📂 test
 │   │   ├── 📂 java             # Contains test-related Java code
 │   │   │   ├── 📂 hooks        # Cucumber hooks (e.g., @Before, @After for setup and teardown)
 │   │   │   ├── 📂 pageObjects  # Page Object Model (POM) classes representing UI elements
 │   │   │   ├── 📂 stepdefinitions # Step definitions for Cucumber feature files
 │   │   │   ├── 📂 testrunners  # JUnit or TestNG test runners to execute tests
 │   │   │   ├── 📂 utils        # Utility/helper classes (e.g., ConfigReader, CommonMethods)
 │   │   │
 │   │   ├── 📂 resources        # Stores non-code test assets
 │   │   │   ├── 📂 features     # Cucumber feature files (BDD scenarios)
 │   │   │   ├── 📄 extent-config.xml # Configuration file for Extent Reports
 │
 ├── 📂 target                   # Compiled output, test reports, and generated files
 ├── 📄 pom.xml                  # Maven build and dependency configuration file
 ├── 📄 package.json             # (If using Node.js for Playwright installation)
 ├── 📄 package-lock.json        # (Dependency lock file for Node.js modules)
 ├── 📂 JRE System Library [JavaSE-11]  # Java runtime environment for execution
 ├── 📂 Maven Dependencies       # All dependencies managed via Maven


## Documentation
This repository includes detailed documentation on:
- **Setting up the framework**
- **Writing and running test scripts**
- **Implementing Cucumber BDD with Playwright**
- **Best practices for maintaining automation scripts**

## Contribution
Feel free to contribute by raising issues, suggesting improvements, or submitting pull requests.

Happy Testing! 🚀
# Hackathon2026
