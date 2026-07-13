# Product Service

Spring Boot microservice for product selection. Uses OpenFeign to call account-service.

## Run

```powershell
mvn -pl Bank-Product-Service spring-boot:run
```

Default port: `3003`

## APIs

- `POST /product`
- `GET /product/all`
- `GET /product/accounts`
