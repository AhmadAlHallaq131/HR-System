package com.mainprofile.hr_system.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class TeamMemberResponse {
    private Long employeeId;
    private String firstName;
    private String lastName;
    private String jobTitle;
    private String todayStatus;
    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;
}
