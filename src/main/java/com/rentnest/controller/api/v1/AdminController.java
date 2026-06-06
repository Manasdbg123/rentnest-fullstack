package com.rentnest.controller.api.v1;

import com.rentnest.entity.Property;
import com.rentnest.exception.ResourceNotFoundException;
import com.rentnest.repository.PropertyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final PropertyRepository propertyRepository;

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/properties/{propertyId}/approve")
    public ResponseEntity<String> approveProperty(@PathVariable Long propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property", "id", propertyId));

        property.setStatus(Property.PropertyStatus.AVAILABLE);
        propertyRepository.save(property);

        return ResponseEntity.ok("Property approved and is now live.");
    }
}