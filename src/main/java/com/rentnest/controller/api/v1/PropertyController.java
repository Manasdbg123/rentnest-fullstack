package com.rentnest.controller.api.v1;

import com.rentnest.dto.request.PropertyCreateRequest;
import com.rentnest.dto.response.PaginatedResponse;
import com.rentnest.dto.response.PropertyResponse;
import com.rentnest.entity.Property;
import com.rentnest.security.UserPrincipal;
import com.rentnest.service.PropertyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/properties")
@RequiredArgsConstructor
public class PropertyController {

    private final PropertyService propertyService;

    @PostMapping(consumes = { "multipart/form-data" })
    public ResponseEntity<PropertyResponse> createProperty(
            @Valid @ModelAttribute PropertyCreateRequest request,
            @RequestParam(value = "images", required = false) List<MultipartFile> images,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return new ResponseEntity<>(propertyService.createProperty(request, images, currentUser.getId()), HttpStatus.CREATED);
    }

    // THE FIX: Added the 3 new parameters to the method signature here
    @GetMapping
    public ResponseEntity<PaginatedResponse<PropertyResponse>> searchProperties(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) BigDecimal minRent,
            @RequestParam(required = false) BigDecimal maxRent,
            @RequestParam(required = false) Property.PropertyType type,
            @RequestParam(required = false) Property.FurnishingStatus furnishing,
            @RequestParam(required = false) Property.TenantPreference tenant,
            @RequestParam(required = false, defaultValue = "newest") String sortBy,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        // THE FIX: Passing all 9 parameters to the service
        return ResponseEntity.ok(propertyService.searchAvailableProperties(
                city, minRent, maxRent, type, furnishing, tenant, sortBy, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PropertyResponse> getPropertyById(@PathVariable Long id) {
        return ResponseEntity.ok(propertyService.getPropertyById(id));
    }

    @PostMapping("/{id}/favorite")
    public ResponseEntity<Boolean> toggleFavorite(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(propertyService.toggleFavorite(id, currentUser.getId()));
    }

    @GetMapping("/favorites")
    public ResponseEntity<List<PropertyResponse>> getUserFavorites(@AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(propertyService.getUserFavorites(currentUser.getId()));
    }

    @GetMapping("/my-properties")
    public ResponseEntity<List<PropertyResponse>> getMyProperties(@AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(propertyService.getMyProperties(currentUser.getId()));
    }
}