package com.mainprofile.hr_system.service;

import com.mainprofile.hr_system.dto.CompanyResponse;
import com.mainprofile.hr_system.dto.CreateCompanyRequest;
import com.mainprofile.hr_system.entity.Company;
import com.mainprofile.hr_system.entity.User;
import com.mainprofile.hr_system.repository.CompanyRepository;
import com.mainprofile.hr_system.repository.EmployeeRepository;
import com.mainprofile.hr_system.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminService {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<CompanyResponse> getAllCompanies() {
        return companyRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CompanyResponse getCompany(Long id) {
        return toResponse(companyRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Company not found: " + id)));
    }

    public CompanyResponse createCompany(CreateCompanyRequest req) {
        if (userRepository.existsByUsername(req.getHrUsername())) {
            throw new IllegalArgumentException("Username already taken: " + req.getHrUsername());
        }
        if (userRepository.existsByEmail(req.getHrEmail())) {
            throw new IllegalArgumentException("Email already in use: " + req.getHrEmail());
        }

        // tenantId derived from company name (slug)
        String tenantId = req.getCompanyName().replaceAll("\\s+", "").toLowerCase()
                + "_" + UUID.randomUUID().toString().substring(0, 6);

        Company company = companyRepository.save(Company.builder()
                .name(req.getCompanyName())
                .tenantId(tenantId)
                .active(true)
                .build());

        userRepository.save(User.builder()
                .username(req.getHrUsername())
                .password(passwordEncoder.encode(req.getHrPassword()))
                .email(req.getHrEmail())
                .fullName(req.getHrFullName())
                .role("HR_MANAGER")
                .tenantId(tenantId)
                .active(true)
                .build());

        return toResponse(company);
    }

    public CompanyResponse updateCompany(Long id, String name, Boolean active) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Company not found: " + id));
        if (name != null && !name.isBlank()) company.setName(name);
        if (active != null) company.setActive(active);
        return toResponse(companyRepository.save(company));
    }

    @Transactional(readOnly = true)
    public Map<String, Long> getPlatformStats() {
        long totalCompanies = companyRepository.count();
        long activeCompanies = companyRepository.findAll().stream().filter(Company::isActive).count();
        long totalEmployees = employeeRepository.count();
        return Map.of(
                "totalCompanies", totalCompanies,
                "activeCompanies", activeCompanies,
                "totalEmployees", totalEmployees
        );
    }

    private CompanyResponse toResponse(Company c) {
        long empCount = employeeRepository.findAllByTenantId(c.getTenantId()).size();
        return userRepository.findByTenantIdAndRole(c.getTenantId(), "HR_MANAGER")
                .map(hr -> CompanyResponse.builder()
                        .id(c.getId())
                        .name(c.getName())
                        .tenantId(c.getTenantId())
                        .createdAt(c.getCreatedAt())
                        .active(c.isActive())
                        .employeeCount(empCount)
                        .hrName(hr.getFullName())
                        .hrEmail(hr.getEmail())
                        .hrUsername(hr.getUsername())
                        .build())
                .orElseGet(() -> CompanyResponse.builder()
                        .id(c.getId())
                        .name(c.getName())
                        .tenantId(c.getTenantId())
                        .createdAt(c.getCreatedAt())
                        .active(c.isActive())
                        .employeeCount(empCount)
                        .build());
    }
}
