package com.streamnest.backend.dto;

public record HealthResponse(
        String status,
        String service,
        String version
) {}