package com.mainprofile.hr_system.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CompanyResponse {
    private Long id;
    private String name;
    private String tenantId;
    private LocalDateTime createdAt;
    private boolean active;
    private long employeeCount;
    private String hrName;
    private String hrEmail;
    private String hrUsername;
}
