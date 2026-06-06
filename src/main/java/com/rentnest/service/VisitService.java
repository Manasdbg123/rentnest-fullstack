package com.rentnest.service;

import com.rentnest.dto.request.VisitScheduleRequest;
import com.rentnest.entity.VisitSchedule;

import java.util.List;

public interface VisitService {
    VisitSchedule scheduleVisit(VisitScheduleRequest request, Long userId);
    List<VisitSchedule> getUserVisits(Long userId);
    List<VisitSchedule> getOwnerPendingVisits(Long ownerId);
    VisitSchedule updateVisitStatus(Long visitId, VisitSchedule.VisitStatus status, Long ownerId);
}