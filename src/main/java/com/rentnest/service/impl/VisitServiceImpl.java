package com.rentnest.service.impl;

import com.rentnest.dto.request.VisitScheduleRequest;
import com.rentnest.entity.Property;
import com.rentnest.entity.User;
import com.rentnest.entity.VisitSchedule;
import com.rentnest.event.VisitRequestedEvent;
import com.rentnest.exception.BusinessValidationException;
import com.rentnest.exception.ResourceNotFoundException;
import com.rentnest.exception.UnauthorizedAccessException;
import com.rentnest.repository.PropertyRepository;
import com.rentnest.repository.UserRepository;
import com.rentnest.repository.VisitScheduleRepository;
import com.rentnest.service.VisitService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class VisitServiceImpl implements VisitService {

    private final VisitScheduleRepository visitRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;

    // Spring's built-in event publisher
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional
    public VisitSchedule scheduleVisit(VisitScheduleRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new ResourceNotFoundException("Property", "id", request.getPropertyId()));

        // Business Rule 1: Can't visit a property that is already rented
        if (property.getStatus() != Property.PropertyStatus.AVAILABLE) {
            throw new BusinessValidationException("Property is not available for visits.");
        }

        // Business Rule 2: Prevent spamming identical requests
        boolean alreadyRequested = visitRepository.existsByUserIdAndPropertyIdAndStatus(
                userId, property.getId(), VisitSchedule.VisitStatus.PENDING);
        if (alreadyRequested) {
            throw new BusinessValidationException("You already have a pending visit request for this property.");
        }

        VisitSchedule visit = VisitSchedule.builder()
                .user(user)
                .property(property)
                .visitDate(request.getVisitDate())
                .status(VisitSchedule.VisitStatus.PENDING)
                .build();

        VisitSchedule savedVisit = visitRepository.save(visit);

        // Publish the event. The service finishes instantly without waiting for the email to send.
        log.info("Publishing VisitRequestedEvent for visit ID: {}", savedVisit.getId());
        eventPublisher.publishEvent(new VisitRequestedEvent(this, savedVisit));

        return savedVisit;
    }

    @Override
    public List<VisitSchedule> getUserVisits(Long userId) {
        return visitRepository.findByUserId(userId);
    }

    @Override
    public List<VisitSchedule> getOwnerPendingVisits(Long ownerId) {
        return visitRepository.findPendingVisitsForOwner(ownerId);
    }

    @Override
    @Transactional
    public VisitSchedule updateVisitStatus(Long visitId, VisitSchedule.VisitStatus status, Long ownerId) {
        VisitSchedule visit = visitRepository.findById(visitId)
                .orElseThrow(() -> new ResourceNotFoundException("VisitSchedule", "id", visitId));

        // Security Check: Only the actual owner of the property can approve/reject visits
        if (!visit.getProperty().getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedAccessException("You do not have permission to update this visit request.");
        }

        visit.setStatus(status);
        return visitRepository.save(visit);
    }
}