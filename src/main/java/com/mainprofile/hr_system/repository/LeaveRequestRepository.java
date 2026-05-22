package com.mainprofile.hr_system.repository;

import com.mainprofile.hr_system.entity.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {

    List<LeaveRequest> findAllByTenantId(String tenantId);

    Optional<LeaveRequest> findByIdAndTenantId(Long id, String tenantId);

    List<LeaveRequest> findAllByEmployeeIdAndTenantId(Long employeeId, String tenantId);
}
