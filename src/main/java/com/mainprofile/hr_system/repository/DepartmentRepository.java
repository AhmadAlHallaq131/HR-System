package com.mainprofile.hr_system.repository;

import com.mainprofile.hr_system.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {

    List<Department> findAllByTenantId(String tenantId);

    Optional<Department> findByIdAndTenantId(Long id, String tenantId);

    boolean existsByNameAndTenantId(String name, String tenantId);

    boolean existsByIdAndTenantId(Long id, String tenantId);
}
