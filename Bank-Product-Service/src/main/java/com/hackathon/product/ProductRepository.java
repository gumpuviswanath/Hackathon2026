package com.hackathon.product;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<CustomerProduct, Long> {
    List<CustomerProduct> findAllByOrderByIdDesc();
    void deleteByAccountNumber(String accountNumber);
}
