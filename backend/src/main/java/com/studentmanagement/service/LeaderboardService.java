package com.studentmanagement.service;

import com.studentmanagement.dto.LeaderboardResponse;
import com.studentmanagement.dto.StudentLeaderboardItemDto;
import com.studentmanagement.entity.StudentProfile;
import com.studentmanagement.repository.StudentProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaderboardService {

    private final StudentProfileRepository studentProfileRepository;

    @Transactional(readOnly = true)
    public LeaderboardResponse getLeaderboard(int page, int size, String sortBy, String direction) {
        Sort.Direction sortDirection = "ASC".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC;
        String property = ("totalPoints".equalsIgnoreCase(sortBy) || "points".equalsIgnoreCase(sortBy))
                ? "totalPoints"
                : "totalPoints";

        // Deterministic tie-breaking: primary sort, then updatedAt ASC, then id ASC
        Sort deterministicSort = Sort.by(sortDirection, property)
                .and(Sort.by(Sort.Direction.ASC, "updatedAt"))
                .and(Sort.by(Sort.Direction.ASC, "id"));

        Pageable pageable = PageRequest.of(page, size, deterministicSort);
        Page<StudentProfile> profilePage = studentProfileRepository.findAll(pageable);

        List<StudentLeaderboardItemDto> items = new ArrayList<>();
        List<StudentProfile> content = profilePage.getContent();

        for (int i = 0; i < content.size(); i++) {
            StudentProfile profile = content.get(i);
            // Global rank based on page offset and index
            long rank = (long) page * size + i + 1;

            items.add(StudentLeaderboardItemDto.builder()
                    .studentId(profile.getId())
                    .userId(profile.getUser().getId())
                    .fullName(profile.getUser().getFullName())
                    .email(profile.getUser().getEmail())
                    .totalPoints(profile.getTotalPoints())
                    .rank(rank)
                    .updatedAt(profile.getUpdatedAt())
                    .build());
        }

        return LeaderboardResponse.builder()
                .items(items)
                .page(profilePage.getNumber())
                .size(profilePage.getSize())
                .totalElements(profilePage.getTotalElements())
                .totalPages(profilePage.getTotalPages())
                .last(profilePage.isLast())
                .build();
    }
}
