package com.mainprofile.hr_system.service;

import com.mainprofile.hr_system.dto.DepartmentRequest;
import com.mainprofile.hr_system.dto.DepartmentResponse;
import com.mainprofile.hr_system.entity.Department;
import com.mainprofile.hr_system.repository.DepartmentRepository;
import com.mainprofile.hr_system.tenant.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyRole('HR_MANAGER','ADMIN')")
    public List<DepartmentResponse> getAll() {
        String tenantId = TenantContext.getTenantId();
        return departmentRepository.findAllByTenantId(tenantId)
                .stream()
                .map(DepartmentResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyRole('EMPLOYEE','HR_MANAGER','ADMIN')")
    public DepartmentResponse getById(Long id) {
        String tenantId = TenantContext.getTenantId();
        Department department = departmentRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new RuntimeException("Department not found: " + id));
        return DepartmentResponse.from(department);
    }

    @PreAuthorize("hasRole('HR_MANAGER')")
    public DepartmentResponse create(DepartmentRequest request) {
        String tenantId = TenantContext.getTenantId();
        
        // Check if department name already exists in tenant
        if (departmentRepository.existsByNameAndTenantId(request.getName(), tenantId)) {
            throw new RuntimeException("Department already exists: " + request.getName());
        }
        
        Department department = Department.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();
        
        Department saved = departmentRepository.save(department);
        return DepartmentResponse.from(saved);
    }

    @PreAuthorize("hasRole('HR_MANAGER')")
    public DepartmentResponse update(Long id, DepartmentRequest request) {
        String tenantId = TenantContext.getTenantId();
        
        Department department = departmentRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new RuntimeException("Department not found: " + id));
        
        department.setName(request.getName());
        department.setDescription(request.getDescription());
        
        Department updated = departmentRepository.save(department);
        return DepartmentResponse.from(updated);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void delete(Long id) {
        String tenantId = TenantContext.getTenantId();
        
        if (!departmentRepository.existsByIdAndTenantId(id, tenantId)) {
            throw new RuntimeException("Department not found: " + id);
        }
        
        departmentRepository.deleteById(id);
    }
}
