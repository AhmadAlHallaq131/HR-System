package com.mainprofile.hr_system.service;

import com.mainprofile.hr_system.dto.EmployeeRequest;
import com.mainprofile.hr_system.dto.EmployeeResponse;
import com.mainprofile.hr_system.entity.Department;
import com.mainprofile.hr_system.entity.Employee;
import com.mainprofile.hr_system.repository.DepartmentRepository;
import com.mainprofile.hr_system.repository.EmployeeRepository;
import com.mainprofile.hr_system.tenant.TenantContext;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
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
    public List<EmployeeResponse> getAll() {
        return employeeRepository.findAllByTenantId(TenantContext.getTenantId())
                .stream().map(EmployeeResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public EmployeeResponse getById(Long id) {
        return EmployeeResponse.from(employeeRepository
                .findByIdAndTenantId(id, TenantContext.getTenantId())
                .orElseThrow(() -> new EntityNotFoundException("Employee not found: " + id)));
    }

    @Transactional(readOnly = true)
    public List<EmployeeResponse> search(String name) {
        return employeeRepository.searchByNameAndTenant(name, TenantContext.getTenantId())
                .stream().map(EmployeeResponse::from).toList();
    }

    public EmployeeResponse create(EmployeeRequest request) {
        String tenantId = TenantContext.getTenantId();
        if (employeeRepository.existsByEmailAndTenantId(request.getEmail(), tenantId)) {
            throw new IllegalArgumentException("Email already exists: " + request.getEmail());
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

        if (request.getDepartmentId() != null) {
            Department dept = departmentRepository.findByIdAndTenantId(request.getDepartmentId(), tenantId)
                    .orElseThrow(() -> new EntityNotFoundException("Department not found: " + request.getDepartmentId()));
            employee.setDepartment(dept);
        }
        return EmployeeResponse.from(employeeRepository.save(employee));
    }

    public EmployeeResponse update(Long id, EmployeeRequest request) {
        String tenantId = TenantContext.getTenantId();
        Employee employee = employeeRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found: " + id));

        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setEmail(request.getEmail());
        employee.setJobTitle(request.getJobTitle());
        if (request.getStatus() != null) {
            employee.setStatus(Employee.EmployeeStatus.valueOf(request.getStatus()));
        }

        if (request.getDepartmentId() != null) {
            Long currentDeptId = employee.getDepartment() != null ? employee.getDepartment().getId() : null;
            if (!request.getDepartmentId().equals(currentDeptId)) {
                Department dept = departmentRepository.findByIdAndTenantId(request.getDepartmentId(), tenantId)
                        .orElseThrow(() -> new EntityNotFoundException("Department not found: " + request.getDepartmentId()));
                employee.setDepartment(dept);
            }
        } else {
            employee.setDepartment(null);
        }

        return EmployeeResponse.from(employeeRepository.save(employee));
    }

    public void delete(Long id) {
        Employee employee = employeeRepository.findByIdAndTenantId(id, TenantContext.getTenantId())
                .orElseThrow(() -> new EntityNotFoundException("Employee not found: " + id));
        employeeRepository.delete(employee);
    }
}
