# Customer Service

Spring Boot microservice for customer registration and KYC status ownership.

## Run

```powershell
mvn -pl Bank-Customer-Id spring-boot:run
```

Default port: `3000`

## APIs

- `POST /customer`
- `GET /customer/all`
- `GET /customer/{customerId}`
- `GET /customer/approved`
- `PUT /customer/{customerId}/status`
- `PUT /customer/status`
- `GET /customer/summary`
