package com.hackathon.kyc;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface KycRepository extends JpaRepository<KycDetails, Long> {
    List<KycDetails> findAllByOrderByIdDesc();
}
