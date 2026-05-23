package com.mainprofile.hr_system.repository;

import com.mainprofile.hr_system.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    List<Employee> findAllByTenantId(String tenantId);

    Optional<Employee> findByIdAndTenantId(Long id, String tenantId);

    boolean existsByEmailAndTenantId(String email, String tenantId);

    List<Employee> findAllByTenantIdAndDepartment_Id(String tenantId, Long departmentId);

    @Query("SELECT e FROM Employee e WHERE e.tenantId = :tenantId " +
           "AND (LOWER(e.firstName) LIKE LOWER(CONCAT('%', :name, '%')) " +
           "OR  LOWER(e.lastName)  LIKE LOWER(CONCAT('%', :name, '%')))")
    List<Employee> searchByNameAndTenant(String name, String tenantId);
}
