package com.hackathon.account;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.concurrent.ThreadLocalRandom;

@Entity
@Table(name = "accounts")
public class Account {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String accountNumber;
    private String customerId;
    private String customerName;
    private String accountType;
    private String status;
    private LocalDateTime createdAt;

    protected Account() {
    }

    public Account(CustomerDto customer, String accountType) {
        this.accountNumber = String.valueOf(ThreadLocalRandom.current().nextLong(100000000000L, 1000000000000L));
        this.customerId = customer.customerId();
        this.customerName = customer.name();
        this.accountType = accountType;
        this.status = "Active";
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public String getAccountNumber() { return accountNumber; }
    public String getCustomerId() { return customerId; }
    public String getCustomerName() { return customerName; }
    public String getAccountType() { return accountType; }
    public String getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
