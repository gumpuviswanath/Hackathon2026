package com.hackathon.kyc;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@FeignClient(name = "customer-service", url = "${services.customer-service-url}")
public interface CustomerClient {
    @GetMapping("/customer/all")
    List<CustomerDto> allCustomers();

    @PutMapping("/customer/{customerId}/status")
    CustomerDto updateStatus(@PathVariable("customerId") String customerId, @RequestBody StatusRequest request);
}
