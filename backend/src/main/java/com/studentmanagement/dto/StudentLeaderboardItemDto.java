package com.studentmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentLeaderboardItemDto {
    private Long studentId;
    private Long userId;
    private String fullName;
    private String email;
    private Integer totalPoints;
    private Long rank;
    private Instant updatedAt;
}
