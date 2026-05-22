package com.mainprofile.hr_system.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.envers.Audited;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "departments")
@Audited
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Department extends BaseEntity {

    @NotBlank
    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description")
    private String description;

    @OneToMany(mappedBy = "department", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Employee> employees = new ArrayList<>();
}
