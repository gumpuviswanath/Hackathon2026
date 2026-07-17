package com.hackathon.account;

public record AccountRequest(
        String customerId,
        String accountType,
        String branch,
        String productCode,
        String currency,
        Double minimumBalance,
        String cardType
) {
}
