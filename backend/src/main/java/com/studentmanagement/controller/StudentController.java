package com.studentmanagement.controller;

import com.studentmanagement.dto.AwardPointsRequest;
import com.studentmanagement.dto.StudentLeaderboardItemDto;
import com.studentmanagement.dto.StudentProfileDto;
import com.studentmanagement.service.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    @GetMapping("/me")
    public ResponseEntity<StudentProfileDto> getMyProfile(@AuthenticationPrincipal UserDetails userDetails) {
        StudentProfileDto profile = studentService.getMyProfile(userDetails.getUsername());
        return ResponseEntity.ok(profile);
    }

    @PostMapping("/{studentId}/points")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<StudentLeaderboardItemDto> awardPoints(
            @PathVariable Long studentId,
            @Valid @RequestBody AwardPointsRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        StudentLeaderboardItemDto updated = studentService.awardPoints(studentId, request, userDetails.getUsername());
        return ResponseEntity.ok(updated);
    }
}
