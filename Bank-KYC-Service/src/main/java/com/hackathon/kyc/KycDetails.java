package com.hackathon.kyc;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "kyc_details")
public class KycDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String customerId;
    private String decision;
    private String remarks;
    private String verifiedBy;
    private String reviewerName;
    private String documentsVerified;
    private String onboardingChannel;
    private LocalDateTime createdAt;

    protected KycDetails() {
    }

    public KycDetails(KycRequest request) {
        this.customerId = request.customerId();
        this.decision = request.decision();
        this.remarks = request.remarks();
        this.verifiedBy = request.verifiedBy() == null ? "KYC Officer" : request.verifiedBy();
        this.reviewerName = request.reviewerName();
        this.documentsVerified = request.documentsVerified();
        this.onboardingChannel = request.onboardingChannel();
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public String getCustomerId() { return customerId; }
    public String getDecision() { return decision; }
    public String getRemarks() { return remarks; }
    public String getVerifiedBy() { return verifiedBy; }
    public String getReviewerName() { return reviewerName; }
    public String getDocumentsVerified() { return documentsVerified; }
    public String getOnboardingChannel() { return onboardingChannel; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
