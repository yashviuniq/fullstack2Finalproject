package com.studentmanagement.service;

import com.studentmanagement.config.JwtService;
import com.studentmanagement.dto.AuthRequest;
import com.studentmanagement.dto.AuthResponse;
import com.studentmanagement.dto.RegisterRequest;
import com.studentmanagement.dto.UserSummaryDto;
import com.studentmanagement.entity.Role;
import com.studentmanagement.entity.StudentProfile;
import com.studentmanagement.entity.User;
import com.studentmanagement.exception.DuplicateEmailException;
import com.studentmanagement.repository.StudentProfileRepository;
import com.studentmanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        final String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateEmailException("Email is already registered: " + email);
        }

        User user = User.builder()
                .fullName(request.getFullName().trim())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .createdAt(Instant.now())
                .build();

        User savedUser = userRepository.save(user);

        // Rule: When a user registers with role STUDENT, automatically initialize a StudentProfile with 0 points
        if (savedUser.getRole() == Role.STUDENT) {
            StudentProfile profile = StudentProfile.builder()
                    .user(savedUser)
                    .totalPoints(0)
                    .updatedAt(Instant.now())
                    .build();
            studentProfileRepository.save(profile);
            log.info("Initialized default StudentProfile with 0 points for user: {}", savedUser.getEmail());
        }

        String token = jwtService.generateToken(savedUser);

        return AuthResponse.builder()
                .token(token)
                .user(UserSummaryDto.builder()
                        .id(savedUser.getId())
                        .fullName(savedUser.getFullName())
                        .email(savedUser.getEmail())
                        .role(savedUser.getRole())
                        .build())
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse login(AuthRequest request) {
        final String email = request.getEmail().trim().toLowerCase();

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword())
        );

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));

        String token = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .user(UserSummaryDto.builder()
                        .id(user.getId())
                        .fullName(user.getFullName())
                        .email(user.getEmail())
                        .role(user.getRole())
                        .build())
                .build();
    }
}
