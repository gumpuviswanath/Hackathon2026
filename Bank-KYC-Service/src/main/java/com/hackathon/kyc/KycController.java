package com.hackathon.kyc;

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
@RequestMapping("/kyc")
public class KycController {
    private final KycRepository repository;
    private final CustomerClient customerClient;

    public KycController(KycRepository repository, CustomerClient customerClient) {
        this.repository = repository;
        this.customerClient = customerClient;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public KycDetails decide(@RequestBody KycRequest request) {
        if (!List.of("Approved", "Rejected").contains(request.decision())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Decision must be Approved or Rejected");
        }
        KycDetails saved = repository.save(new KycDetails(request));
        customerClient.updateStatus(request.customerId(), new StatusRequest(request.customerId(), request.decision()));
        return saved;
    }

    @GetMapping("/all")
    public List<KycDetails> all() {
        return repository.findAllByOrderByIdDesc();
    }

    @GetMapping("/pending")
    public List<CustomerDto> pendingCustomers() {
        return byKycStatus("Pending");
    }

    @GetMapping("/approved")
    public List<CustomerDto> approvedCustomers() {
        return byKycStatus("Approved");
    }

    @GetMapping("/rejected")
    public List<CustomerDto> rejectedCustomers() {
        return byKycStatus("Rejected");
    }

    private List<CustomerDto> byKycStatus(String status) {
        return customerClient.allCustomers().stream()
                .filter(customer -> status.equals(customer.kycStatus()))
                .toList();
    }
}
