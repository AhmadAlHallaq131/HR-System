package com.mainprofile.hr_system.service;

import com.mainprofile.hr_system.config.CustomUserDetails;
import com.mainprofile.hr_system.dto.MyProfileResponse;
import com.mainprofile.hr_system.dto.TeamMemberResponse;
import com.mainprofile.hr_system.entity.AttendanceRecord;
import com.mainprofile.hr_system.entity.Employee;
import com.mainprofile.hr_system.enums.AttendanceStatus;
import com.mainprofile.hr_system.repository.AttendanceRepository;
import com.mainprofile.hr_system.repository.EmployeeRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MeService {

    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;

    public MyProfileResponse getProfile() {
        CustomUserDetails user = currentUser();
        Employee emp = getEmployee(user.getEmployeeId());

        return MyProfileResponse.builder()
                .employeeId(emp.getId())
                .firstName(emp.getFirstName())
                .lastName(emp.getLastName())
                .fullName(emp.getFirstName() + " " + emp.getLastName())
                .email(emp.getEmail())
                .phone(emp.getPhone())
                .jobTitle(emp.getJobTitle())
                .status(emp.getStatus().name())
                .departmentId(emp.getDepartment() != null ? emp.getDepartment().getId() : null)
                .departmentName(emp.getDepartment() != null ? emp.getDepartment().getName() : null)
                .username(user.getUsername())
                .build();
    }

    public List<TeamMemberResponse> getTeam() {
        CustomUserDetails user = currentUser();
        Employee me = getEmployee(user.getEmployeeId());

        if (me.getDepartment() == null) return List.of();

        Long deptId = me.getDepartment().getId();
        String tenantId = user.getTenantId();

        List<Employee> teammates = employeeRepository.findAllByTenantIdAndDepartment_Id(tenantId, deptId)
                .stream()
                .filter(e -> !e.getId().equals(me.getId()))
                .toList();

        List<Long> empIds = teammates.stream().map(Employee::getId).toList();
        Map<Long, AttendanceRecord> todayMap = attendanceRepository
                .findAllByEmployeeIdInAndDate(empIds, LocalDate.now())
                .stream()
                .collect(Collectors.toMap(AttendanceRecord::getEmployeeId, Function.identity()));

        return teammates.stream().map(e -> {
            AttendanceRecord rec = todayMap.get(e.getId());
            String status = rec == null ? "ABSENT" : rec.getStatus().name();
            return TeamMemberResponse.builder()
                    .employeeId(e.getId())
                    .firstName(e.getFirstName())
                    .lastName(e.getLastName())
                    .jobTitle(e.getJobTitle())
                    .todayStatus(status)
                    .checkInTime(rec != null ? rec.getCheckInTime() : null)
                    .checkOutTime(rec != null ? rec.getCheckOutTime() : null)
                    .build();
        }).toList();
    }

    private Employee getEmployee(Long employeeId) {
        if (employeeId == null) throw new EntityNotFoundException("No employee record linked to your account");
        return employeeRepository.findById(employeeId)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found"));
    }

    private CustomUserDetails currentUser() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof CustomUserDetails u) return u;
        throw new IllegalStateException("Not authenticated");
    }
}
