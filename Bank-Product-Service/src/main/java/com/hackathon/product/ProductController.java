package com.hackathon.product;

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
@RequestMapping("/product")
public class ProductController {
    private final ProductRepository repository;
    private final AccountClient accountClient;

    public ProductController(ProductRepository repository, AccountClient accountClient) {
        this.repository = repository;
        this.accountClient = accountClient;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CustomerProduct createProduct(@RequestBody ProductRequest request) {
        if (!List.of(
                "Loan", "Personal Loan", "Auto Loan", "Student Loan",
                "Credit Card",
                "Mutual Funds",
                "Insurance", "Life Insurance", "Home/Auto Insurance"
        ).contains(request.productType())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported product type: " + request.productType());
        }

        AccountDto account = accountClient.allAccounts().stream()
                .filter(item -> item.accountNumber().equals(request.accountNumber()))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "Open account first."));

        return repository.save(new CustomerProduct(account, request.productType()));
    }

    @GetMapping("/all")
    public List<CustomerProduct> allProducts() {
        return repository.findAllByOrderByIdDesc();
    }

    @GetMapping("/accounts")
    public List<AccountDto> accounts() {
        return accountClient.allAccounts();
    }

    @DeleteMapping("/by-account/{accountNumber}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void deleteByAccountNumber(@PathVariable("accountNumber") String accountNumber) {
        repository.deleteByAccountNumber(accountNumber);
    }
}
