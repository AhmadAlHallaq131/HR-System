package com.mainprofile.hr_system.dto;

import com.mainprofile.hr_system.entity.AttendanceRecord;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class AttendanceResponse {
    private Long id;
    private Long employeeId;
    private String employeeFullName;
    private String departmentName;
    private LocalDate date;
    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;
    private String status;
    private Integer workMinutes;

    public static AttendanceResponse from(AttendanceRecord r) {
        return AttendanceResponse.builder()
                .id(r.getId())
                .employeeId(r.getEmployeeId())
                .date(r.getDate())
                .checkInTime(r.getCheckInTime())
                .checkOutTime(r.getCheckOutTime())
                .status(r.getStatus().name())
                .workMinutes(r.getWorkMinutes())
                .build();
    }
}
