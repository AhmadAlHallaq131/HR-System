package com.mainprofile.hr_system.controller;

import com.mainprofile.hr_system.dto.CreateEmployeeUserRequest;
import com.mainprofile.hr_system.dto.EmployeeResponse;
import com.mainprofile.hr_system.service.UserManagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserManagementService userManagementService;

    @PostMapping
    @PreAuthorize("hasRole('HR_MANAGER')")
    public ResponseEntity<EmployeeResponse> createEmployee(@Valid @RequestBody CreateEmployeeUserRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userManagementService.createEmployeeUser(req));
    }

    @PutMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('HR_MANAGER')")
    public ResponseEntity<Void> deactivate(@PathVariable Long id) {
        userManagementService.deactivateUser(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/reset-password")
    @PreAuthorize("hasRole('HR_MANAGER')")
    public ResponseEntity<Void> resetPassword(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String newPassword = body.get("password");
        if (newPassword == null || newPassword.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        userManagementService.resetPassword(id, newPassword);
        return ResponseEntity.noContent().build();
    }
}
