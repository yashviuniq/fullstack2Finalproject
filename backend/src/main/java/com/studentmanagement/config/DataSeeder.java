package com.studentmanagement.config;

import com.studentmanagement.entity.PointTransaction;
import com.studentmanagement.entity.Role;
import com.studentmanagement.entity.StudentProfile;
import com.studentmanagement.entity.User;
import com.studentmanagement.repository.PointTransactionRepository;
import com.studentmanagement.repository.StudentProfileRepository;
import com.studentmanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final PointTransactionRepository pointTransactionRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already seeded. Skipping initial data generation.");
            return;
        }

        log.info("Seeding initial database data...");

        // 1. Create Default Teacher
        User teacher = User.builder()
                .fullName("Prof. Minerva McGonagall")
                .email("teacher@school.com")
                .password(passwordEncoder.encode("Password123!"))
                .role(Role.TEACHER)
                .createdAt(Instant.now().minus(30, ChronoUnit.DAYS))
                .build();
        teacher = userRepository.save(teacher);
        log.info("Created Demo Teacher: {}", teacher.getEmail());

        // 2. Define 12 Students with varied initial points and profile timestamps
        record SeedStudent(String fullName, String email, int points, String reason) {}

        List<SeedStudent> seedStudents = List.of(
                new SeedStudent("Hermione Granger", "hermione@school.com", 250, "Exemplary performance in Advanced Arithmancy"),
                new SeedStudent("Harry Potter", "harry@school.com", 210, "Outstanding bravery and defense leadership"),
                new SeedStudent("Ron Weasley", "ron@school.com", 185, "Strategic mastery in Wizards Chess tournament"),
                new SeedStudent("Draco Malfoy", "draco@school.com", 175, "Exceptional Potions formulation"),
                new SeedStudent("Luna Lovegood", "luna@school.com", 160, "Creative problem solving in Care of Creatures"),
                new SeedStudent("Neville Longbottom", "neville@school.com", 150, "Groundbreaking Herbology greenhouse project"),
                new SeedStudent("Ginny Weasley", "ginny@school.com", 140, "Athletic excellence and team sportsmanship"),
                new SeedStudent("Cedric Diggory", "cedric@school.com", 130, "Demonstrated honor and peer mentorship"),
                new SeedStudent("Cho Chang", "cho@school.com", 115, "Top marks in Astronomy observations"),
                new SeedStudent("Dean Thomas", "dean@school.com", 95, "Artistic contribution to school exhibition"),
                new SeedStudent("Seamus Finnigan", "seamus@school.com", 80, "Pyrotechnics lab safety compliance"),
                new SeedStudent("Pansy Parkinson", "pansy@school.com", 65, "Class participation and debate skills")
        );

        Instant baseTime = Instant.now().minus(20, ChronoUnit.DAYS);

        for (int i = 0; i < seedStudents.size(); i++) {
            SeedStudent s = seedStudents.get(i);
            Instant studentCreatedAt = baseTime.plus(i, ChronoUnit.HOURS);

            User studentUser = User.builder()
                    .fullName(s.fullName())
                    .email(s.email())
                    .password(passwordEncoder.encode("Password123!"))
                    .role(Role.STUDENT)
                    .createdAt(studentCreatedAt)
                    .build();
            studentUser = userRepository.save(studentUser);

            // Student profile
            StudentProfile profile = StudentProfile.builder()
                    .user(studentUser)
                    .totalPoints(s.points())
                    .updatedAt(studentCreatedAt.plus(i * 2L, ChronoUnit.HOURS))
                    .build();
            profile = studentProfileRepository.save(profile);

            // Initial point transaction
            PointTransaction tx = PointTransaction.builder()
                    .student(profile)
                    .awardedBy(teacher)
                    .pointsDelta(s.points())
                    .reason(s.reason())
                    .createdAt(profile.getUpdatedAt())
                    .build();
            pointTransactionRepository.save(tx);
        }

        log.info("Successfully seeded 1 Teacher, 12 Students with distinct points and audit logs.");
    }
}
