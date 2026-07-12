# Account Service

Spring Boot microservice for account opening. Uses OpenFeign to call customer-service.

## Run

```powershell
mvn -pl Bank-Account-Service spring-boot:run
```

Default port: `3002`

## APIs

- `POST /account`
- `GET /account/all`
- `GET /account/eligible-customers`
