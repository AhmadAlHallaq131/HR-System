package com.mainprofile.hr_system.service;

import com.mainprofile.hr_system.config.CustomUserDetails;
import com.mainprofile.hr_system.dto.AttendanceResponse;
import com.mainprofile.hr_system.entity.AttendanceRecord;
import com.mainprofile.hr_system.entity.Employee;
import com.mainprofile.hr_system.enums.AttendanceStatus;
import com.mainprofile.hr_system.repository.AttendanceRepository;
import com.mainprofile.hr_system.repository.EmployeeRepository;
import com.mainprofile.hr_system.tenant.TenantContext;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;

    public AttendanceResponse checkIn() {
        CustomUserDetails user = currentUser();
        Long employeeId = user.getEmployeeId();
        if (employeeId == null) throw new IllegalStateException("No employee record linked to your account");

        LocalDate today = LocalDate.now();
        Optional<AttendanceRecord> existing = attendanceRepository.findByEmployeeIdAndDate(employeeId, today);

        if (existing.isPresent() && existing.get().getCheckInTime() != null) {
            throw new IllegalStateException("Already checked in today");
        }

        AttendanceRecord record = existing.orElseGet(() -> AttendanceRecord.builder()
                .tenantId(user.getTenantId())
                .employeeId(employeeId)
                .date(today)
                .build());

        record.setCheckInTime(LocalDateTime.now());
        record.setStatus(AttendanceStatus.CHECKED_IN);
        return AttendanceResponse.from(attendanceRepository.save(record));
    }

    public AttendanceResponse checkOut() {
        CustomUserDetails user = currentUser();
        Long employeeId = user.getEmployeeId();
        if (employeeId == null) throw new IllegalStateException("No employee record linked to your account");

        LocalDate today = LocalDate.now();
        AttendanceRecord record = attendanceRepository.findByEmployeeIdAndDate(employeeId, today)
                .orElseThrow(() -> new IllegalStateException("You haven't checked in today"));

        if (record.getCheckInTime() == null) {
            throw new IllegalStateException("You haven't checked in today");
        }
        if (record.getCheckOutTime() != null) {
            throw new IllegalStateException("Already checked out today");
        }

        LocalDateTime checkOut = LocalDateTime.now();
        record.setCheckOutTime(checkOut);
        record.setStatus(AttendanceStatus.CHECKED_OUT);
        long minutes = ChronoUnit.MINUTES.between(record.getCheckInTime(), checkOut);
        record.setWorkMinutes((int) minutes);
        return AttendanceResponse.from(attendanceRepository.save(record));
    }

    @Transactional(readOnly = true)
    public AttendanceResponse getToday() {
        CustomUserDetails user = currentUser();
        Long employeeId = user.getEmployeeId();
        if (employeeId == null) throw new IllegalStateException("No employee record linked to your account");

        return attendanceRepository.findByEmployeeIdAndDate(employeeId, LocalDate.now())
                .map(AttendanceResponse::from)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<AttendanceResponse> getMyHistory(int year, int month) {
        CustomUserDetails user = currentUser();
        Long employeeId = user.getEmployeeId();
        if (employeeId == null) throw new IllegalStateException("No employee record linked to your account");

        LocalDate from = LocalDate.of(year, month, 1);
        LocalDate to = from.withDayOfMonth(from.lengthOfMonth());
        return attendanceRepository.findAllByEmployeeIdAndDateBetween(employeeId, from, to)
                .stream()
                .map(AttendanceResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AttendanceResponse> getAllForHr(LocalDate date, Long employeeId) {
        String tenantId = TenantContext.getTenantId();
        List<AttendanceRecord> records = attendanceRepository.findByTenantAndDateFiltered(tenantId, date, employeeId);

        // Enrich with employee names
        List<Long> empIds = records.stream().map(AttendanceRecord::getEmployeeId).distinct().toList();
        List<Employee> employees = employeeRepository.findAllById(empIds);

        return records.stream().map(r -> {
            AttendanceResponse resp = AttendanceResponse.from(r);
            employees.stream()
                    .filter(e -> e.getId().equals(r.getEmployeeId()))
                    .findFirst()
                    .ifPresent(e -> {
                        resp.setEmployeeFullName(e.getFirstName() + " " + e.getLastName());
                        resp.setDepartmentName(e.getDepartment() != null ? e.getDepartment().getName() : null);
                    });
            return resp;
        }).toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Long> getTodaySummary() {
        String tenantId = TenantContext.getTenantId();
        LocalDate today = LocalDate.now();
        long checkedIn  = attendanceRepository.countByTenantIdAndDateAndStatus(tenantId, today, AttendanceStatus.CHECKED_IN);
        long checkedOut = attendanceRepository.countByTenantIdAndDateAndStatus(tenantId, today, AttendanceStatus.CHECKED_OUT);
        long total = employeeRepository.findAllByTenantId(tenantId).size();
        return Map.of(
                "checkedIn", checkedIn,
                "checkedOut", checkedOut,
                "present", checkedIn + checkedOut,
                "absent", Math.max(0, total - checkedIn - checkedOut)
        );
    }

    private CustomUserDetails currentUser() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof CustomUserDetails u) return u;
        throw new IllegalStateException("Not authenticated");
    }
}
