package com.studentmanagement.repository;

import com.studentmanagement.entity.PointTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PointTransactionRepository extends JpaRepository<PointTransaction, Long> {

    @EntityGraph(attributePaths = {"awardedBy"})
    List<PointTransaction> findByStudentIdOrderByCreatedAtDesc(Long studentProfileId);

    @EntityGraph(attributePaths = {"awardedBy"})
    Page<PointTransaction> findByStudentIdOrderByCreatedAtDesc(Long studentProfileId, Pageable pageable);
}
