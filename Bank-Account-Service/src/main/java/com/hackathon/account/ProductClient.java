package com.hackathon.account;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "product-service", url = "${services.product-service-url}")
public interface ProductClient {
    @DeleteMapping("/product/by-account/{accountNumber}")
    void deleteByAccountNumber(@PathVariable("accountNumber") String accountNumber);
}
