package com.mainprofile.hr_system.config;

import com.mainprofile.hr_system.entity.User;
import com.mainprofile.hr_system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.count() > 0) return;

        userRepository.saveAll(List.of(
            User.builder()
                .username("admin")
                .password(passwordEncoder.encode("admin123"))
                .email("admin@techcorp.com")
                .role("ADMIN")
                .tenantId("TechCorp")
                .build(),
            User.builder()
                .username("hr_manager")
                .password(passwordEncoder.encode("hr123"))
                .email("hr@techcorp.com")
                .role("HR_MANAGER")
                .tenantId("TechCorp")
                .build(),
            User.builder()
                .username("employee")
                .password(passwordEncoder.encode("emp123"))
                .email("employee@techcorp.com")
                .role("EMPLOYEE")
                .tenantId("TechCorp")
                .build()
        ));
    }
}
