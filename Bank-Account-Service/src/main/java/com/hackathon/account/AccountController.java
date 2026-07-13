package com.hackathon.account;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/account")
public class AccountController {
    private final AccountRepository repository;
    private final CustomerClient customerClient;

    public AccountController(AccountRepository repository, CustomerClient customerClient) {
        this.repository = repository;
        this.customerClient = customerClient;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Account createAccount(@RequestBody AccountRequest request) {
        if (!List.of("Savings", "Current").contains(request.accountType())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Account type must be Savings or Current");
        }

        CustomerDto customer = customerClient.getCustomer(request.customerId());
        if (!"Approved".equals(customer.kycStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "KYC not completed.");
        }
        if (repository.existsByCustomerId(customer.customerId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Customer already has an account.");
        }

        return repository.save(new Account(customer, request.accountType()));
    }

    @GetMapping("/all")
    public List<Account> allAccounts() {
        return repository.findAllByOrderByIdDesc();
    }

    @GetMapping("/eligible-customers")
    public List<EligibleCustomer> eligibleCustomers() {
        return customerClient.approvedCustomers().stream()
                .map(customer -> new EligibleCustomer(
                        customer.customerId(),
                        customer.name(),
                        customer.mobile(),
                        customer.kycStatus(),
                        repository.existsByCustomerId(customer.customerId())
                ))
                .toList();
    }
}
