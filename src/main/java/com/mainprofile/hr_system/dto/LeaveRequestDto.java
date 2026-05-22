package com.mainprofile.hr_system.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class LeaveRequestDto {

    @NotNull
    private LocalDate startDate;

    @NotNull
    private LocalDate endDate;

    private String reason;
}
