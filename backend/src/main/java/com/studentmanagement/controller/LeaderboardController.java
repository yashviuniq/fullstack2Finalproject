package com.studentmanagement.controller;

import com.studentmanagement.dto.LeaderboardResponse;
import com.studentmanagement.service.LeaderboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    @GetMapping
    public ResponseEntity<LeaderboardResponse> getLeaderboard(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "totalPoints") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction
    ) {
        LeaderboardResponse response = leaderboardService.getLeaderboard(page, size, sortBy, direction);
        return ResponseEntity.ok(response);
    }
}
