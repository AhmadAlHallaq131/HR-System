package com.mainprofile.hr_system.entity;

import com.mainprofile.hr_system.enums.LeaveStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.envers.Audited;

import java.time.LocalDate;

@Entity
@Table(name = "leave_requests")
@Audited
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveRequest extends BaseEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @NotNull
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @NotNull
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "reason")
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private LeaveStatus status = LeaveStatus.PENDING;

    @Column(name = "reviewed_by")
    private String reviewedBy;


}
