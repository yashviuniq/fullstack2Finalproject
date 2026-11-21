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
public class PointTransactionDto {
    private Long id;
    private Integer pointsDelta;
    private String reason;
    private String awardedByName;
    private String awardedByEmail;
    private Instant createdAt;
}
