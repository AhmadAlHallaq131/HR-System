package com.mainprofile.hr_system.service;

import com.mainprofile.hr_system.dto.EmployeeRequest;
import com.mainprofile.hr_system.dto.EmployeeResponse;
import com.mainprofile.hr_system.entity.Department;
import com.mainprofile.hr_system.entity.Employee;
import com.mainprofile.hr_system.repository.DepartmentRepository;
import com.mainprofile.hr_system.repository.EmployeeRepository;
import com.mainprofile.hr_system.tenant.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;

    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyRole('HR_MANAGER','ADMIN')")
    public List<EmployeeResponse> getAll() {
        String tenantId = TenantContext.getTenantId();
        return employeeRepository.findAllByTenantId(tenantId)
                .stream()
                .map(EmployeeResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyRole('EMPLOYEE','HR_MANAGER','ADMIN')")
    public EmployeeResponse getById(Long id) {
        String tenantId = TenantContext.getTenantId();
        Employee employee = employeeRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new RuntimeException("Employee not found: " + id));
        return EmployeeResponse.from(employee);
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyRole('HR_MANAGER','ADMIN')")
    public List<EmployeeResponse> search(String name) {
        String tenantId = TenantContext.getTenantId();
        return employeeRepository.searchByNameAndTenant(name, tenantId)
                .stream()
                .map(EmployeeResponse::from)
                .toList();
    }

    @PreAuthorize("hasRole('HR_MANAGER')")
    public EmployeeResponse create(EmployeeRequest request) {
        String tenantId = TenantContext.getTenantId();

        // Check if email already exists in tenant
        if (employeeRepository.existsByEmailAndTenantId(request.getEmail(), tenantId)) {
            throw new RuntimeException("Email already exists: " + request.getEmail());
        }

        Employee employee = Employee.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .jobTitle(request.getJobTitle())
                .status(request.getStatus() != null 
                    ? Employee.EmployeeStatus.valueOf(request.getStatus()) 
                    : Employee.EmployeeStatus.ACTIVE)
                .build();

        // Set department if provided
        if (request.getDepartmentId() != null) {
            Department department = departmentRepository.findByIdAndTenantId(request.getDepartmentId(), tenantId)
                    .orElseThrow(() -> new RuntimeException("Department not found: " + request.getDepartmentId()));
            employee.setDepartment(department);
        }

        Employee saved = employeeRepository.save(employee);
        return EmployeeResponse.from(saved);
    }

    @PreAuthorize("hasRole('HR_MANAGER')")
    public EmployeeResponse update(Long id, EmployeeRequest request) {
        String tenantId = TenantContext.getTenantId();
        
        Employee employee = employeeRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new RuntimeException("Employee not found: " + id));
        
        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setJobTitle(request.getJobTitle());
        employee.setStatus(Employee.EmployeeStatus.valueOf(request.getStatus()));
        
        // Update department if changed
        if (request.getDepartmentId() != null) {
            if (!employee.getDepartment().getId().equals(request.getDepartmentId())) {
                Department department = departmentRepository.findByIdAndTenantId(request.getDepartmentId(), tenantId)
                        .orElseThrow(() -> new RuntimeException("Department not found: " + request.getDepartmentId()));
                employee.setDepartment(department);
            }
        }
        
        Employee updated = employeeRepository.save(employee);
        return EmployeeResponse.from(updated);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void delete(Long id) {
        String tenantId = TenantContext.getTenantId();
        Employee employee = employeeRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new RuntimeException("Employee not found: " + id));
        employeeRepository.delete(employee);

    }
}
