package com.hackathon.kyc;

public record KycRequest(
        String customerId,
        String decision,
        String remarks,
        String verifiedBy,
        String reviewerName,
        String documentsVerified,
        String onboardingChannel
) {
}
