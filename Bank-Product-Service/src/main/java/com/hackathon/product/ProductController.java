package com.hackathon.product;

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
        if (!List.of("Loan", "Credit Card", "Insurance").contains(request.productType())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product must be Loan, Credit Card, or Insurance");
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
}
