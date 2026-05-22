package com.mainprofile.hr_system.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.envers.Audited;

@Entity
@Table(name = "employees")
@Audited
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Employee extends BaseEntity {

    @NotBlank
    @Column(name = "first_name", nullable = false)
    private String firstName;

    @NotBlank
    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Email
    @NotBlank
    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "job_title")
    private String jobTitle;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private EmployeeStatus status = EmployeeStatus.ACTIVE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    public enum EmployeeStatus {
        ACTIVE, INACTIVE, ON_LEAVE
    }
}
