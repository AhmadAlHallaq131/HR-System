package com.mainprofile.hr_system.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateEmployeeUserRequest {
    @NotBlank private String fullName;
    @NotBlank private String username;
    @NotBlank @Email private String email;
    @NotBlank private String password;
    private String jobTitle;
    private String phone;
    private Long departmentId;
}
