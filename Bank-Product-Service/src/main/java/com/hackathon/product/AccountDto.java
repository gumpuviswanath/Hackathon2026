package com.hackathon.product;

public record AccountDto(
        String accountNumber,
        String customerId,
        String customerName,
        String accountType,
        String status
) {
}
