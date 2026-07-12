package com.hackathon.product;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@FeignClient(name = "account-service", url = "${services.account-service-url}")
public interface AccountClient {
    @GetMapping("/account/all")
    List<AccountDto> allAccounts();
}
