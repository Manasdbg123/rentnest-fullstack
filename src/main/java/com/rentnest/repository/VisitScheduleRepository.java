package com.rentnest.repository;

import com.rentnest.entity.VisitSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VisitScheduleRepository extends JpaRepository<VisitSchedule, Long> {

    List<VisitSchedule> findByUserId(Long userId);

    List<VisitSchedule> findByPropertyId(Long propertyId);

    @Query("SELECT v FROM VisitSchedule v WHERE v.property.owner.id = :ownerId AND v.status = 'PENDING'")
    List<VisitSchedule> findPendingVisitsForOwner(@Param("ownerId") Long ownerId);

    boolean existsByUserIdAndPropertyIdAndStatus(Long userId, Long propertyId, VisitSchedule.VisitStatus status);

    // ADD THIS EXACT LINE TO FIX THE COMPILER ERROR
    List<VisitSchedule> findByStatusAndCreatedAtBefore(VisitSchedule.VisitStatus status, LocalDateTime date);
}