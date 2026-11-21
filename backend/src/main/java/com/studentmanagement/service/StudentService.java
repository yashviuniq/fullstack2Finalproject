package com.studentmanagement.service;

import com.studentmanagement.dto.AwardPointsRequest;
import com.studentmanagement.dto.PointTransactionDto;
import com.studentmanagement.dto.StudentLeaderboardItemDto;
import com.studentmanagement.dto.StudentProfileDto;
import com.studentmanagement.entity.PointTransaction;
import com.studentmanagement.entity.Role;
import com.studentmanagement.entity.StudentProfile;
import com.studentmanagement.entity.User;
import com.studentmanagement.exception.BadRequestException;
import com.studentmanagement.exception.ResourceNotFoundException;
import com.studentmanagement.repository.PointTransactionRepository;
import com.studentmanagement.repository.StudentProfileRepository;
import com.studentmanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StudentService {

    private final StudentProfileRepository studentProfileRepository;
    private final PointTransactionRepository pointTransactionRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public StudentProfileDto getMyProfile(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        if (user.getRole() != Role.STUDENT) {
            throw new BadRequestException("Only users with role STUDENT have a student profile");
        }

        StudentProfile profile = studentProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user: " + userEmail));

        long rank = studentProfileRepository.calculateStudentRank(
                profile.getTotalPoints(),
                profile.getUpdatedAt(),
                profile.getId()
        );

        List<PointTransaction> transactions = pointTransactionRepository.findByStudentIdOrderByCreatedAtDesc(profile.getId());
        List<PointTransactionDto> transactionDtos = transactions.stream()
                .map(tx -> PointTransactionDto.builder()
                        .id(tx.getId())
                        .pointsDelta(tx.getPointsDelta())
                        .reason(tx.getReason())
                        .awardedByName(tx.getAwardedBy().getFullName())
                        .awardedByEmail(tx.getAwardedBy().getEmail())
                        .createdAt(tx.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return StudentProfileDto.builder()
                .studentId(profile.getId())
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .totalPoints(profile.getTotalPoints())
                .rank(rank)
                .updatedAt(profile.getUpdatedAt())
                .recentTransactions(transactionDtos)
                .build();
    }

    @Transactional
    public StudentLeaderboardItemDto awardPoints(Long studentId, AwardPointsRequest request, String teacherEmail) {
        User teacher = userRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found with email: " + teacherEmail));

        if (teacher.getRole() != Role.TEACHER) {
            throw new AccessDeniedException("Only users with role TEACHER can award or adjust points");
        }

        StudentProfile profile = studentProfileRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found with ID: " + studentId));

        // Update points (pointsDelta can be positive or negative)
        int updatedTotal = profile.getTotalPoints() + request.getPointsDelta();
        profile.setTotalPoints(updatedTotal);
        profile.setUpdatedAt(Instant.now());
        StudentProfile savedProfile = studentProfileRepository.save(profile);

        // Record audit transaction
        PointTransaction transaction = PointTransaction.builder()
                .student(savedProfile)
                .awardedBy(teacher)
                .pointsDelta(request.getPointsDelta())
                .reason(request.getReason().trim())
                .createdAt(Instant.now())
                .build();
        pointTransactionRepository.save(transaction);

        long rank = studentProfileRepository.calculateStudentRank(
                savedProfile.getTotalPoints(),
                savedProfile.getUpdatedAt(),
                savedProfile.getId()
        );

        log.info("Teacher {} awarded {} points to student {} (new total: {}, rank: {})",
                teacherEmail, request.getPointsDelta(), savedProfile.getUser().getEmail(), updatedTotal, rank);

        return StudentLeaderboardItemDto.builder()
                .studentId(savedProfile.getId())
                .userId(savedProfile.getUser().getId())
                .fullName(savedProfile.getUser().getFullName())
                .email(savedProfile.getUser().getEmail())
                .totalPoints(savedProfile.getTotalPoints())
                .rank(rank)
                .updatedAt(savedProfile.getUpdatedAt())
                .build();
    }
}
