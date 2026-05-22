package com.mainprofile.hr_system.controller;

import com.mainprofile.hr_system.dto.DepartmentRequest;
import com.mainprofile.hr_system.dto.DepartmentResponse;
import com.mainprofile.hr_system.service.DepartmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService departmentService;

    @GetMapping
    @PreAuthorize("hasAnyRole('HR_MANAGER','ADMIN')")
    public ResponseEntity<List<DepartmentResponse>> getAll() {
        return ResponseEntity.ok(departmentService.getAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('EMPLOYEE','HR_MANAGER','ADMIN')")
    public ResponseEntity<DepartmentResponse> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(departmentService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('HR_MANAGER')")
    public ResponseEntity<DepartmentResponse> create(@Valid @RequestBody DepartmentRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(departmentService.create(req));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('HR_MANAGER')")
    public ResponseEntity<DepartmentResponse> update(@PathVariable Long id,
                                                      @Valid @RequestBody DepartmentRequest req) {
        return ResponseEntity.ok(departmentService.update(id, req));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        departmentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
