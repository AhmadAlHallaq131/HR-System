package com.mainprofile.hr_system.service;

import com.mainprofile.hr_system.config.CustomUserDetails;
import com.mainprofile.hr_system.dto.LoginRequest;
import com.mainprofile.hr_system.dto.LoginResponse;
import com.mainprofile.hr_system.entity.User;
import com.mainprofile.hr_system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService implements UserDetailsService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        if (!user.isActive()) {
            throw new UsernameNotFoundException("Account is deactivated");
        }
        return new CustomUserDetails(user);
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername().trim())
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

        if (!user.isActive()) {
            throw new BadCredentialsException("Account is deactivated");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid username or password");
        }

        Map<String, Object> claims = new HashMap<>();
        claims.put("email", user.getEmail());
        claims.put("fullName", user.getFullName() != null ? user.getFullName() : "");
        claims.put("role", user.getRole());
        claims.put("tenantId", user.getTenantId() != null ? user.getTenantId() : "");
        if (user.getEmployeeId() != null) {
            claims.put("employeeId", user.getEmployeeId());
        }

        String token = jwtService.generateToken(user.getUsername(), claims);

        return LoginResponse.builder()
                .token(token)
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .tenantId(user.getTenantId())
                .employeeId(user.getEmployeeId())
                .build();
    }
}
