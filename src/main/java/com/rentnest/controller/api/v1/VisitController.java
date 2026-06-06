package com.rentnest.controller.api.v1;

import com.rentnest.dto.request.VisitScheduleRequest;
import com.rentnest.entity.VisitSchedule;
import com.rentnest.security.UserPrincipal;
import com.rentnest.service.VisitService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/visits")
@RequiredArgsConstructor
public class VisitController {

    private final VisitService visitService;

    @PreAuthorize("hasRole('USER')")
    @PostMapping
    public ResponseEntity<VisitSchedule> requestVisit(
            @Valid @RequestBody VisitScheduleRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        VisitSchedule visit = visitService.scheduleVisit(request, currentUser.getId());
        return new ResponseEntity<>(visit, HttpStatus.CREATED);
    }

    @PreAuthorize("hasRole('USER')")
    @GetMapping("/my-requests")
    public ResponseEntity<List<VisitSchedule>> getUserVisits(@AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(visitService.getUserVisits(currentUser.getId()));
    }

    @PreAuthorize("hasRole('OWNER')")
    @GetMapping("/owner-requests")
    public ResponseEntity<List<VisitSchedule>> getOwnerPendingVisits(@AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(visitService.getOwnerPendingVisits(currentUser.getId()));
    }

    @PreAuthorize("hasRole('OWNER')")
    @PatchMapping("/{visitId}/status")
    public ResponseEntity<VisitSchedule> updateVisitStatus(
            @PathVariable Long visitId,
            @RequestParam VisitSchedule.VisitStatus status,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        return ResponseEntity.ok(visitService.updateVisitStatus(visitId, status, currentUser.getId()));
    }
}