package com.mainprofile.hr_system.service;

import com.mainprofile.hr_system.config.CustomUserDetails;
import com.mainprofile.hr_system.dto.LeaveRequestDto;
import com.mainprofile.hr_system.dto.LeaveResponse;
import com.mainprofile.hr_system.entity.Employee;
import com.mainprofile.hr_system.entity.LeaveRequest;
import com.mainprofile.hr_system.enums.LeaveStatus;
import com.mainprofile.hr_system.repository.EmployeeRepository;
import com.mainprofile.hr_system.repository.LeaveRequestRepository;
import com.mainprofile.hr_system.tenant.TenantContext;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class LeaveService {

    private final LeaveRequestRepository leaveRepository;
    private final EmployeeRepository employeeRepository;

    @Transactional(readOnly = true)
    public List<LeaveResponse> getAll() {
        return leaveRepository.findAllByTenantId(TenantContext.getTenantId())
                .stream()
                .map(LeaveResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<LeaveResponse> getMine() {
        CustomUserDetails user = currentUser();
        Long employeeId = user.getEmployeeId();
        if (employeeId == null) throw new EntityNotFoundException("No employee record linked to your account");
        return leaveRepository.findAllByEmployeeIdAndTenantId(employeeId, TenantContext.getTenantId())
                .stream()
                .map(LeaveResponse::from)
                .toList();
    }

    public LeaveResponse submit(LeaveRequestDto dto, Long employeeId) {
        String tenantId = TenantContext.getTenantId();
        Employee emp = employeeRepository.findByIdAndTenantId(employeeId, tenantId)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found: " + employeeId));

        if (dto.getEndDate().isBefore(dto.getStartDate())) {
            throw new IllegalArgumentException("End date cannot be before start date");
        }

        LeaveRequest leave = LeaveRequest.builder()
                .employee(emp)
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .reason(dto.getReason())
                .build();
        return LeaveResponse.from(leaveRepository.save(leave));
    }

    public LeaveResponse approve(Long id) {
        LeaveRequest leave = getLeave(id);
        if (leave.getStatus() != LeaveStatus.PENDING) {
            throw new IllegalStateException("Only PENDING requests can be approved (current status: " + leave.getStatus() + ")");
        }
        leave.setStatus(LeaveStatus.APPROVED);
        leave.setReviewedBy(currentUser().getEmail());
        return LeaveResponse.from(leaveRepository.save(leave));
    }

    public LeaveResponse reject(Long id) {
        LeaveRequest leave = getLeave(id);
        if (leave.getStatus() != LeaveStatus.PENDING) {
            throw new IllegalStateException("Only PENDING requests can be rejected (current status: " + leave.getStatus() + ")");
        }
        leave.setStatus(LeaveStatus.REJECTED);
        leave.setReviewedBy(currentUser().getEmail());
        return LeaveResponse.from(leaveRepository.save(leave));
    }

    private LeaveRequest getLeave(Long id) {
        return leaveRepository.findByIdAndTenantId(id, TenantContext.getTenantId())
                .orElseThrow(() -> new EntityNotFoundException("Leave request not found: " + id));
    }

    private CustomUserDetails currentUser() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof CustomUserDetails u) return u;
        throw new IllegalStateException("Not authenticated");
    }
}
