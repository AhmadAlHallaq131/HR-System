package com.mainprofile.hr_system.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateCompanyRequest {
    @NotBlank private String companyName;
    @NotBlank private String hrFullName;
    @NotBlank @Email private String hrEmail;
    @NotBlank private String hrUsername;
    @NotBlank private String hrPassword;
}
