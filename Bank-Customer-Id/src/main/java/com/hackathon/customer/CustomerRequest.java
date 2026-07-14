package com.hackathon.customer;

import java.time.LocalDate;

public record CustomerRequest(
        String name,
        String mobile,
        String email,
        LocalDate dateOfBirth,
        String nationality,
        String address,
        String mailingAddress,
        String governmentId
) {
}
