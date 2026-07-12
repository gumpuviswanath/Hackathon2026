package com.hackathon.account;

public record CustomerDto(
        String customerId,
        String name,
        String mobile,
        String status,
        String kycStatus
) {
}
