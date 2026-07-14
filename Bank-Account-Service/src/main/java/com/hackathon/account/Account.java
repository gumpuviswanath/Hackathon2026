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
    private String branch;
    private String productCode;
    private String currency;
    private Double minimumBalance;
    private String cardType;
    private LocalDateTime createdAt;

    protected Account() {
    }

    public Account(CustomerDto customer, AccountRequest request) {
        this.accountNumber = String.valueOf(ThreadLocalRandom.current().nextLong(100000000000L, 1000000000000L));
        this.customerId = customer.customerId();
        this.customerName = customer.name();
        this.accountType = request.accountType();
        this.status = "Active";
        this.branch = request.branch();
        this.productCode = request.productCode();
        this.currency = request.currency();
        this.minimumBalance = request.minimumBalance();
        this.cardType = request.cardType();
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public String getAccountNumber() { return accountNumber; }
    public String getCustomerId() { return customerId; }
    public String getCustomerName() { return customerName; }
    public String getAccountType() { return accountType; }
    public String getStatus() { return status; }
    public String getBranch() { return branch; }
    public String getProductCode() { return productCode; }
    public String getCurrency() { return currency; }
    public Double getMinimumBalance() { return minimumBalance; }
    public String getCardType() { return cardType; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
