package com.hackathon.account;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/account")
public class AccountController {
    private final AccountRepository repository;
    private final CustomerClient customerClient;
    private final ProductClient productClient;

    public AccountController(AccountRepository repository, CustomerClient customerClient, ProductClient productClient) {
        this.repository = repository;
        this.customerClient = customerClient;
        this.productClient = productClient;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Account createAccount(@RequestBody AccountRequest request) {
        if (!List.of("Savings", "Current", "Fixed Deposit").contains(request.accountType())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Account type must be Savings, Current, or Fixed Deposit");
        }

        CustomerDto customer = customerClient.getCustomer(request.customerId());
        if (!"Approved".equals(customer.kycStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "KYC not completed.");
        }
        if (repository.existsByCustomerId(customer.customerId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Customer already has an account.");
        }

        return repository.save(new Account(customer, request));
    }

    @GetMapping("/all")
    public List<Account> allAccounts() {
        return repository.findAllByOrderByIdDesc();
    }

    @DeleteMapping("/{accountNumber}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void deleteAccount(@PathVariable("accountNumber") String accountNumber) {
        repository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found"));

        productClient.deleteByAccountNumber(accountNumber);
        repository.deleteByAccountNumber(accountNumber);
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
