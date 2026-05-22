package com.mainprofile.hr_system.dto;

import com.mainprofile.hr_system.entity.Department;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentResponse {

    private Long id;
    private String name;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<Long> employeeIds = new ArrayList<>();

    public static DepartmentResponse from(Department department) {
        DepartmentResponse response = new DepartmentResponse();
        response.setId(department.getId());
        response.setName(department.getName());
        response.setDescription(department.getDescription());
        response.setCreatedAt(department.getCreatedAt());
        response.setUpdatedAt(department.getUpdatedAt());
        
        if (department.getEmployees() != null) {
            response.setEmployeeIds(
                department.getEmployees().stream()
                    .map(m -> m.getId())
                    .toList()
            );
        }
        
        return response;
    }
}
