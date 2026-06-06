package com.rentnest.service;

import com.rentnest.dto.request.PropertyCreateRequest;
import com.rentnest.dto.response.PaginatedResponse;
import com.rentnest.dto.response.PropertyResponse;
import com.rentnest.entity.Property;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

public interface PropertyService {
    PropertyResponse createProperty(PropertyCreateRequest request, List<MultipartFile> images, Long ownerId);

    // UPDATED SIGNATURE
    PaginatedResponse<PropertyResponse> searchAvailableProperties(
            String city,
            BigDecimal minRent,
            BigDecimal maxRent,
            Property.PropertyType type,
            Property.FurnishingStatus furnishing,
            Property.TenantPreference tenant,
            String sortBy,
            int page,
            int size
    );

    PropertyResponse getPropertyById(Long id);
    boolean toggleFavorite(Long propertyId, Long userId);
    List<PropertyResponse> getUserFavorites(Long userId);
    List<PropertyResponse> getMyProperties(Long ownerId);
}