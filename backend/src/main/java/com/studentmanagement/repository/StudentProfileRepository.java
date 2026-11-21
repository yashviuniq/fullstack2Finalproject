package com.studentmanagement.repository;

import com.studentmanagement.entity.StudentProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;

@Repository
public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {

    @EntityGraph(attributePaths = {"user"})
    Optional<StudentProfile> findByUserId(Long userId);

    @EntityGraph(attributePaths = {"user"})
    Optional<StudentProfile> findByUserEmail(String email);

    @Override
    @EntityGraph(attributePaths = {"user"})
    Page<StudentProfile> findAll(Pageable pageable);

    @Query("SELECT COUNT(s) + 1 FROM StudentProfile s WHERE " +
           "s.totalPoints > :points OR " +
           "(s.totalPoints = :points AND s.updatedAt < :updatedAt) OR " +
           "(s.totalPoints = :points AND s.updatedAt = :updatedAt AND s.id < :id)")
    long calculateStudentRank(
            @Param("points") Integer points,
            @Param("updatedAt") Instant updatedAt,
            @Param("id") Long id
    );
}
