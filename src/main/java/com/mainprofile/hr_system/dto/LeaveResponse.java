package com.mainprofile.hr_system.dto;

import com.mainprofile.hr_system.entity.LeaveRequest;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class LeaveResponse {
    private Long id;
    private Long employeeId;
    private String employeeFullName;
    private String employeeEmail;
    private LocalDate startDate;
    private LocalDate endDate;
    private String reason;
    private String status;
    private String reviewedBy;

    public static LeaveResponse from(LeaveRequest r) {
        return LeaveResponse.builder()
                .id(r.getId())
                .employeeId(r.getEmployee().getId())
                .employeeFullName(r.getEmployee().getFirstName() + " " + r.getEmployee().getLastName())
                .employeeEmail(r.getEmployee().getEmail())
                .startDate(r.getStartDate())
                .endDate(r.getEndDate())
                .reason(r.getReason())
                .status(r.getStatus().name())
                .reviewedBy(r.getReviewedBy())
                .build();
    }
}
