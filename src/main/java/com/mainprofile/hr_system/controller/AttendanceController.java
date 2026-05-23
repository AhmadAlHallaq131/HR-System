package com.mainprofile.hr_system.controller;

import com.mainprofile.hr_system.dto.AttendanceResponse;
import com.mainprofile.hr_system.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/check-in")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<AttendanceResponse> checkIn() {
        return ResponseEntity.ok(attendanceService.checkIn());
    }

    @PostMapping("/check-out")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<AttendanceResponse> checkOut() {
        return ResponseEntity.ok(attendanceService.checkOut());
    }

    @GetMapping("/today")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<AttendanceResponse> getToday() {
        AttendanceResponse record = attendanceService.getToday();
        if (record == null) return ResponseEntity.noContent().build();
        return ResponseEntity.ok(record);
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<List<AttendanceResponse>> getMyHistory(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        int y = year  != null ? year  : LocalDate.now().getYear();
        int m = month != null ? month : LocalDate.now().getMonthValue();
        return ResponseEntity.ok(attendanceService.getMyHistory(y, m));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('HR_MANAGER','SUPER_ADMIN')")
    public ResponseEntity<List<AttendanceResponse>> getAll(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) Long employeeId) {
        LocalDate target = date != null ? date : LocalDate.now();
        return ResponseEntity.ok(attendanceService.getAllForHr(target, employeeId));
    }

    @GetMapping("/today/summary")
    @PreAuthorize("hasAnyRole('HR_MANAGER','SUPER_ADMIN')")
    public ResponseEntity<Map<String, Long>> getTodaySummary() {
        return ResponseEntity.ok(attendanceService.getTodaySummary());
    }
}
