package com.mainprofile.hr_system.config;

import com.mainprofile.hr_system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${hr.admin.credentials-file}")
    private String credentialsFilePath;

    @Override
    public void run(ApplicationArguments args) {
        if (!userRepository.existsByUsername("admin")) {
            throw new IllegalStateException("Admin user not found — ensure V5 migration has run successfully");
        }

        String rawPassword = UUID.randomUUID().toString();
        String encodedPassword = passwordEncoder.encode(rawPassword);

        // Direct SQL UPDATE — bypasses entity caching and detachment issues
        userRepository.updatePasswordByUsername("admin", encodedPassword);

        writeCredentialsFile(rawPassword);
    }

    private void writeCredentialsFile(String rawPassword) {
        String timestamp = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));

        String content = String.join(System.lineSeparator(),
                "================================================",
                "  HR System - Admin Credentials",
                "================================================",
                "  Generated : " + timestamp,
                "  Username  : admin",
                "  Password  : " + rawPassword,
                "================================================",
                "  This file is overwritten on every server restart.",
                "  Keep it secure. Do not commit it to version control.",
                "================================================"
        );

        try {
            Path path = Paths.get(credentialsFilePath);
            Files.createDirectories(path.getParent());
            Files.writeString(path, content);
            log.info("Admin credentials written to: {}", path.toAbsolutePath());
        } catch (IOException e) {
            log.error("Failed to write admin credentials file at {}: {}", credentialsFilePath, e.getMessage());
        }
    }
}
