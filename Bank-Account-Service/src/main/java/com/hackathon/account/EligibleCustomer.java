package com.hackathon.account;

public record EligibleCustomer(
        String customerId,
        String name,
        String mobile,
        String kycStatus,
        boolean accountExists
) {
}
