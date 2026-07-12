package com.hackathon.account;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, Long> {
    boolean existsByCustomerId(String customerId);
    Optional<Account> findByAccountNumber(String accountNumber);
    List<Account> findAllByOrderByIdDesc();
}
