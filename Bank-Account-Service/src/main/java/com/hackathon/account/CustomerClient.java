package com.hackathon.account;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "customer-service", url = "${services.customer-service-url}")
public interface CustomerClient {
    @GetMapping("/customer/{customerId}")
    CustomerDto getCustomer(@PathVariable("customerId") String customerId);

    @GetMapping("/customer/approved")
    List<CustomerDto> approvedCustomers();
}
