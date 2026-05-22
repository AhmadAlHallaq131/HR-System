package com.mainprofile.hr_system.service;

import com.mainprofile.hr_system.dto.LeaveRequestDto;
import com.mainprofile.hr_system.entity.Employee;
import com.mainprofile.hr_system.entity.LeaveRequest;
import com.mainprofile.hr_system.enums.LeaveStatus;
import com.mainprofile.hr_system.repository.EmployeeRepository;
import com.mainprofile.hr_system.repository.LeaveRequestRepository;
import com.mainprofile.hr_system.config.CustomUserDetails;
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
    public List<LeaveRequest> getAll() {
        String tenantId = TenantContext.getTenantId();
        return leaveRepository.findAllByTenantId(tenantId);
    }

    @Transactional(readOnly = true)
    public List<LeaveRequest> getMine() {
        String email = getCurrentUserEmail();
        String tenantId = TenantContext.getTenantId();
        Employee me = employeeRepository.findAllByTenantId(tenantId).stream()
                .filter(e -> e.getEmail().equals(email))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("Employee record not found for current user"));
        return leaveRepository.findAllByEmployeeIdAndTenantId(me.getId(), tenantId);
    }

    public LeaveRequest submit(LeaveRequestDto dto, Long employeeId) {
        String tenantId = TenantContext.getTenantId();
        Employee emp = employeeRepository.findByIdAndTenantId(employeeId, tenantId)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found: " + employeeId));

        LeaveRequest leave = LeaveRequest.builder()
                .employee(emp)
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .reason(dto.getReason())
                .build();
        return leaveRepository.save(leave);
    }

    public LeaveRequest approve(Long id) {
        LeaveRequest leave = getLeave(id);
        leave.setStatus(LeaveStatus.APPROVED);
        leave.setReviewedBy(getCurrentUserEmail());
        return leaveRepository.save(leave);
    }

    public LeaveRequest reject(Long id) {
        LeaveRequest leave = getLeave(id);
        leave.setStatus(LeaveStatus.REJECTED);
        leave.setReviewedBy(getCurrentUserEmail());
        return leaveRepository.save(leave);
    }

    private LeaveRequest getLeave(Long id) {
        String tenantId = TenantContext.getTenantId();
        return leaveRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new EntityNotFoundException("Leave request not found: " + id));
    }

    private String getCurrentUserEmail() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof CustomUserDetails userDetails) {
            return userDetails.getEmail();
        }
        return auth != null ? auth.getName() : "unknown";
    }
}
