package com.hackathon.customer;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "customers")
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String customerId;
    private String name;
    private String mobile;
    private String email;
    private LocalDate dateOfBirth;
    private String address;
    private String governmentId;
    private String accountType;
    private String status;
    private String kycStatus;
    private LocalDateTime createdAt;

    protected Customer() {
    }

    public Customer(CustomerRequest request, String customerId) {
        this.customerId = customerId;
        this.name = request.name();
        this.mobile = request.mobile();
        this.email = request.email();
        this.dateOfBirth = request.dateOfBirth();
        this.address = request.address();
        this.governmentId = request.governmentId();
        this.accountType = request.accountType();
        this.status = "Pending KYC";
        this.kycStatus = "Pending";
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public String getCustomerId() { return customerId; }
    public String getName() { return name; }
    public String getMobile() { return mobile; }
    public String getEmail() { return email; }
    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public String getAddress() { return address; }
    public String getGovernmentId() { return governmentId; }
    public String getAccountType() { return accountType; }
    public String getStatus() { return status; }
    public String getKycStatus() { return kycStatus; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void updateKycStatus(String kycStatus) {
        this.kycStatus = kycStatus;
        if ("Approved".equals(kycStatus)) {
            this.status = "KYC Approved";
        } else if ("Rejected".equals(kycStatus)) {
            this.status = "KYC Rejected";
        } else {
            this.status = "Pending KYC";
        }
    }
}
