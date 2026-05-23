package com.mainprofile.hr_system.controller;

import com.mainprofile.hr_system.dto.MyProfileResponse;
import com.mainprofile.hr_system.dto.TeamMemberResponse;
import com.mainprofile.hr_system.service.MeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/me")
@PreAuthorize("hasRole('EMPLOYEE')")
@RequiredArgsConstructor
public class MeController {

    private final MeService meService;

    @GetMapping("/profile")
    public ResponseEntity<MyProfileResponse> getProfile() {
        return ResponseEntity.ok(meService.getProfile());
    }

    @GetMapping("/team")
    public ResponseEntity<List<TeamMemberResponse>> getTeam() {
        return ResponseEntity.ok(meService.getTeam());
    }
}
