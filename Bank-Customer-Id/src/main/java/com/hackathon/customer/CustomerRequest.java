package com.hackathon.customer;

import java.time.LocalDate;

public record CustomerRequest(
        String name,
        String mobile,
        String email,
        LocalDate dateOfBirth,
        String address,
        String governmentId,
        String accountType
) {
}
