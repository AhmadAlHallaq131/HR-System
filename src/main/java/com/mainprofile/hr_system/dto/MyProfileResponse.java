package com.mainprofile.hr_system.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MyProfileResponse {
    private Long employeeId;
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private String phone;
    private String jobTitle;
    private String status;
    private Long departmentId;
    private String departmentName;
    private String username;
}
