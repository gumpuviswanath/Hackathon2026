package com.hackathon.kyc;

public record KycRequest(
        String customerId,
        String decision,
        String remarks,
        String verifiedBy
) {
}
