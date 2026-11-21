package com.studentmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentProfileDto {
    private Long studentId;
    private Long userId;
    private String fullName;
    private String email;
    private Integer totalPoints;
    private Long rank;
    private Instant updatedAt;
    private List<PointTransactionDto> recentTransactions;
}
