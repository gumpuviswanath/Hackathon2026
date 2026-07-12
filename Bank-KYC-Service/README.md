# KYC Service

Spring Boot microservice for KYC verification. Uses OpenFeign to call customer-service.

## Run

```powershell
mvn -pl Bank-KYC-Service spring-boot:run
```

Default port: `3001`

## APIs

- `POST /kyc`
- `GET /kyc/all`
- `GET /kyc/pending`
- `GET /kyc/approved`
- `GET /kyc/rejected`
