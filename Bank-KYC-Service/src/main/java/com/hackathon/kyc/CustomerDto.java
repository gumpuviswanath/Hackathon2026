package com.hackathon.kyc;

public record CustomerDto(
        String customerId,
        String name,
        String mobile,
        String email,
        String panNumber,
        String status,
        String kycStatus
) {
}
