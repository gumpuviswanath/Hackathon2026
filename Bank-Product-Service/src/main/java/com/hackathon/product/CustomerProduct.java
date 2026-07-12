package com.hackathon.product;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "customer_products")
public class CustomerProduct {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String customerId;
    private String accountNumber;
    private String productType;
    private String status;
    private LocalDateTime createdAt;

    protected CustomerProduct() {
    }

    public CustomerProduct(AccountDto account, String productType) {
        this.customerId = account.customerId();
        this.accountNumber = account.accountNumber();
        this.productType = productType;
        this.status = "Applied";
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public String getCustomerId() { return customerId; }
    public String getAccountNumber() { return accountNumber; }
    public String getProductType() { return productType; }
    public String getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
