package com.mainprofile.hr_system.repository;

import com.mainprofile.hr_system.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CompanyRepository extends JpaRepository<Company, Long> {
    boolean existsByTenantId(String tenantId);
    Optional<Company> findByTenantId(String tenantId);
}
