package com.mainprofile.hr_system.controller;

import com.mainprofile.hr_system.dto.LeaveRequestDto;
import com.mainprofile.hr_system.entity.LeaveRequest;
import com.mainprofile.hr_system.service.LeaveService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaves")
@RequiredArgsConstructor
public class LeaveController {

    private final LeaveService leaveService;

    @GetMapping
    @PreAuthorize("hasAnyRole('HR_MANAGER','ADMIN')")
    public ResponseEntity<List<LeaveRequest>> getAll() {
        return ResponseEntity.ok(leaveService.getAll());
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('EMPLOYEE','HR_MANAGER','ADMIN')")
    public ResponseEntity<List<LeaveRequest>> getMine() {
        return ResponseEntity.ok(leaveService.getMine());
    }

    @PostMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('EMPLOYEE','HR_MANAGER')")
    public ResponseEntity<LeaveRequest> submit(@PathVariable Long employeeId,
                                               @Valid @RequestBody LeaveRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(leaveService.submit(dto, employeeId));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('HR_MANAGER')")
    public ResponseEntity<LeaveRequest> approve(@PathVariable Long id) {
        return ResponseEntity.ok(leaveService.approve(id));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('HR_MANAGER')")
    public ResponseEntity<LeaveRequest> reject(@PathVariable Long id) {
        return ResponseEntity.ok(leaveService.reject(id));
    }
}
