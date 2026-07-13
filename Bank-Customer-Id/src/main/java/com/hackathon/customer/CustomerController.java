package com.hackathon.customer;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

@CrossOrigin
@RestController
@RequestMapping("/customer")
public class CustomerController {
    private final CustomerRepository repository;

    public CustomerController(CustomerRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Customer createCustomer(@RequestBody CustomerRequest request) {
        validateCustomer(request);
        return repository.save(new Customer(request, nextCustomerId()));
    }

    @GetMapping("/all")
    public List<Customer> allCustomers() {
        return repository.findAllByOrderByIdDesc();
    }

    @GetMapping("/approved")
    public List<Customer> approvedCustomers() {
        return repository.findByKycStatusOrderByIdDesc("Approved");
    }

    @GetMapping("/{customerId}")
    public Customer getCustomer(@PathVariable("customerId") String customerId) {
        return repository.findByCustomerId(customerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));
    }

    @PutMapping("/{customerId}/status")
    public Customer updateStatus(@PathVariable("customerId") String customerId, @RequestBody StatusRequest request) {
        return updateCustomerStatus(customerId, request.kycStatus());
    }

    @PutMapping("/status")
    public Customer updateStatus(@RequestBody StatusRequest request) {
        return updateCustomerStatus(request.customerId(), request.kycStatus());
    }

    @GetMapping("/summary")
    public Map<String, Long> summary() {
        List<Customer> customers = repository.findAll();
        return Map.of(
                "customersRegistered", (long) customers.size(),
                "pendingKyc", customers.stream().filter(c -> "Pending".equals(c.getKycStatus())).count(),
                "approved", customers.stream().filter(c -> "Approved".equals(c.getKycStatus())).count(),
                "rejected", customers.stream().filter(c -> "Rejected".equals(c.getKycStatus())).count()
        );
    }

    private Customer updateCustomerStatus(String customerId, String kycStatus) {
        if (!List.of("Approved", "Rejected", "Pending").contains(kycStatus)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "KYC status must be Approved, Rejected, or Pending");
        }

        Customer customer = getCustomer(customerId);
        customer.updateKycStatus(kycStatus);
        return repository.save(customer);
    }

    private String nextCustomerId() {
        String customerId;
        do {
            customerId = String.valueOf(ThreadLocalRandom.current().nextInt(100000000, 1000000000));
        } while (repository.existsByCustomerId(customerId));
        return customerId;
    }

    private void validateCustomer(CustomerRequest request) {
        if (request.name() == null || request.name().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Customer name is required");
        }
        if (request.mobile() == null || request.mobile().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mobile number is required");
        }
        if (request.governmentId() == null || request.governmentId().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Government ID is required");
        }
    }
}
