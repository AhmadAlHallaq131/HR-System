package com.mainprofile.hr_system.repository;

import com.mainprofile.hr_system.entity.AttendanceRecord;
import com.mainprofile.hr_system.enums.AttendanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<AttendanceRecord, Long> {

    Optional<AttendanceRecord> findByEmployeeIdAndDate(Long employeeId, LocalDate date);

    List<AttendanceRecord> findAllByTenantIdAndDate(String tenantId, LocalDate date);

    List<AttendanceRecord> findAllByEmployeeIdAndDateBetween(Long employeeId, LocalDate from, LocalDate to);

    @Query("SELECT a FROM AttendanceRecord a WHERE a.tenantId = :tenantId AND a.date = :date AND (:employeeId IS NULL OR a.employeeId = :employeeId)")
    List<AttendanceRecord> findByTenantAndDateFiltered(
            @Param("tenantId") String tenantId,
            @Param("date") LocalDate date,
            @Param("employeeId") Long employeeId);

    long countByTenantIdAndDateAndStatus(String tenantId, LocalDate date, AttendanceStatus status);

    List<AttendanceRecord> findAllByEmployeeIdInAndDate(List<Long> employeeIds, LocalDate date);
}
