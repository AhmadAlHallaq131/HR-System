package com.mainprofile.hr_system.service;

import com.mainprofile.hr_system.dto.CreateEmployeeUserRequest;
import com.mainprofile.hr_system.dto.EmployeeResponse;
import com.mainprofile.hr_system.entity.Department;
import com.mainprofile.hr_system.entity.Employee;
import com.mainprofile.hr_system.entity.User;
import com.mainprofile.hr_system.repository.DepartmentRepository;
import com.mainprofile.hr_system.repository.EmployeeRepository;
import com.mainprofile.hr_system.repository.UserRepository;
import com.mainprofile.hr_system.tenant.TenantContext;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class UserManagementService {

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    public EmployeeResponse createEmployeeUser(CreateEmployeeUserRequest req) {
        String tenantId = TenantContext.getTenantId();

        if (userRepository.existsByUsername(req.getUsername())) {
            throw new IllegalArgumentException("Username already taken: " + req.getUsername());
        }
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Email already in use: " + req.getEmail());
        }

        // Split fullName into first/last
        String[] parts = req.getFullName().trim().split("\\s+", 2);
        String firstName = parts[0];
        String lastName = parts.length > 1 ? parts[1] : "";

        Department dept = null;
        if (req.getDepartmentId() != null) {
            dept = departmentRepository.findByIdAndTenantId(req.getDepartmentId(), tenantId)
                    .orElseThrow(() -> new EntityNotFoundException("Department not found: " + req.getDepartmentId()));
        }

        Employee employee = employeeRepository.save(Employee.builder()
                .firstName(firstName)
                .lastName(lastName)
                .email(req.getEmail())
                .jobTitle(req.getJobTitle())
                .phone(req.getPhone())
                .department(dept)
                .status(Employee.EmployeeStatus.ACTIVE)
                .build());

        User user = userRepository.save(User.builder()
                .username(req.getUsername())
                .password(passwordEncoder.encode(req.getPassword()))
                .email(req.getEmail())
                .fullName(req.getFullName())
                .role("EMPLOYEE")
                .tenantId(tenantId)
                .active(true)
                .employeeId(employee.getId())
                .build());

        employee.setUserId(user.getId());
        employeeRepository.save(employee);

        return EmployeeResponse.from(employee);
    }

    @Transactional(readOnly = true)
    public List<User> getUsersInTenant() {
        return userRepository.findAllByTenantId(TenantContext.getTenantId());
    }

    public void deactivateUser(Long userId) {
        String tenantId = TenantContext.getTenantId();
        User user = userRepository.findById(userId)
                .filter(u -> tenantId.equals(u.getTenantId()))
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + userId));
        user.setActive(false);
        userRepository.save(user);
    }

    public void activateUser(Long userId) {
        String tenantId = TenantContext.getTenantId();
        User user = userRepository.findById(userId)
                .filter(u -> tenantId.equals(u.getTenantId()))
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + userId));
        user.setActive(true);
        userRepository.save(user);
    }

    public void resetPassword(Long userId, String newPassword) {
        String tenantId = TenantContext.getTenantId();
        User user = userRepository.findById(userId)
                .filter(u -> tenantId.equals(u.getTenantId()))
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + userId));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
