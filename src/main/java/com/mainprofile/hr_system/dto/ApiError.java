package com.mainprofile.hr_system.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class ApiError {
    private int status;
    private String message;
    private LocalDateTime timestamp;
}
