package com.rentnest.service.impl;

import com.rentnest.dto.request.PropertyCreateRequest;
import com.rentnest.dto.response.PaginatedResponse;
import com.rentnest.dto.response.PropertyResponse;
import com.rentnest.entity.Favorite;
import com.rentnest.entity.Property;
import com.rentnest.entity.PropertyImage;
import com.rentnest.entity.User;
import com.rentnest.exception.ResourceNotFoundException;
import com.rentnest.repository.FavoriteRepository;
import com.rentnest.repository.PropertyRepository;
import com.rentnest.repository.UserRepository;
import com.rentnest.service.CloudinaryService;
import com.rentnest.service.PropertyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PropertyServiceImpl implements PropertyService {

    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final FavoriteRepository favoriteRepository;
    private final CloudinaryService cloudinaryService;

    @Override
    @Transactional
    public PropertyResponse createProperty(PropertyCreateRequest request, List<MultipartFile> images, Long ownerId) {
        User owner = userRepository.findById(ownerId).orElseThrow(() -> new ResourceNotFoundException("User", "id", ownerId));

        Property property = Property.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .rentAmount(request.getRentAmount())
                .depositAmount(request.getDepositAmount())
                .squareFootage(request.getSquareFootage())
                .city(request.getCity())
                .locality(request.getLocality())
                .type(request.getType())
                .furnishingStatus(request.getFurnishingStatus())
                .rooms(request.getRooms())
                .status(Property.PropertyStatus.AVAILABLE)
                .isVerified(false)
                .contactNumber(request.getContactNumber() != null ? request.getContactNumber() : "N/A")
                .availableFrom(request.getAvailableFrom() != null ? request.getAvailableFrom() : LocalDate.now())
                .tenantPreference(request.getTenantPreference() != null ? request.getTenantPreference() : Property.TenantPreference.ANY)
                .owner(owner)
                .build();

        if (images != null && !images.isEmpty()) {
            boolean isFirst = true;
            for (MultipartFile file : images) {
                try {
                    String imageUrl = cloudinaryService.uploadImage(file);
                    property.getImages().add(PropertyImage.builder()
                            .property(property)
                            .imageUrl(imageUrl)
                            .isPrimary(isFirst)
                            .build());
                    isFirst = false;
                } catch (Exception e) {
                    throw new RuntimeException("Image upload failed");
                }
            }
        }

        Property savedProperty = propertyRepository.save(property);
        return mapToResponse(savedProperty);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginatedResponse<PropertyResponse> searchAvailableProperties(
            String city, BigDecimal minRent, BigDecimal maxRent, Property.PropertyType type,
            Property.FurnishingStatus furnishing, Property.TenantPreference tenant,
            String sortBy, int page, int size) {

        Sort sort = Sort.by("createdAt").descending();
        if ("price_asc".equalsIgnoreCase(sortBy)) {
            sort = Sort.by("rentAmount").ascending();
        } else if ("price_desc".equalsIgnoreCase(sortBy)) {
            sort = Sort.by("rentAmount").descending();
        }

        PageRequest pageRequest = PageRequest.of(page, size, sort);

        Page<Property> propertyPage = propertyRepository.searchPropertiesAdvanced(
                city, minRent, maxRent, type, furnishing, tenant, pageRequest);

        List<PropertyResponse> content = propertyPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PaginatedResponse.<PropertyResponse>builder()
                .content(content)
                .pageNo(propertyPage.getNumber())
                .pageSize(propertyPage.getSize())
                .totalElements(propertyPage.getTotalElements())
                .totalPages(propertyPage.getTotalPages())
                .last(propertyPage.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PropertyResponse getPropertyById(Long id) {
        Property property = propertyRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Property", "id", id));
        return mapToResponse(property);
    }

    @Override
    @Transactional
    public boolean toggleFavorite(Long propertyId, Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        Property property = propertyRepository.findById(propertyId).orElseThrow(() -> new ResourceNotFoundException("Property", "id", propertyId));

        Optional<Favorite> existingFavorite = favoriteRepository.findByUserIdAndPropertyId(userId, propertyId);
        if (existingFavorite.isPresent()) {
            favoriteRepository.delete(existingFavorite.get());
            return false;
        } else {
            Favorite favorite = Favorite.builder().user(user).property(property).build();
            favoriteRepository.save(favorite);
            return true;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<PropertyResponse> getUserFavorites(Long userId) {
        return favoriteRepository.findByUserId(userId).stream().map(fav -> mapToResponse(fav.getProperty())).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PropertyResponse> getMyProperties(Long ownerId) {
        return propertyRepository.findByOwnerIdOrderByCreatedAtDesc(ownerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private PropertyResponse mapToResponse(Property property) {
        List<PropertyResponse.ImageResponse> imageResponses = property.getImages().stream()
                .map(img -> new PropertyResponse.ImageResponse(img.getId(), img.getImageUrl(), img.isPrimary()))
                .collect(Collectors.toList());

        PropertyResponse.OwnerSummary ownerSummary = new PropertyResponse.OwnerSummary(
                property.getOwner().getId(), property.getOwner().getName(), property.getOwner().getEmail()
        );

        return PropertyResponse.builder()
                .id(property.getId())
                .title(property.getTitle())
                .description(property.getDescription())
                .rentAmount(property.getRentAmount())
                .depositAmount(property.getDepositAmount())
                .squareFootage(property.getSquareFootage())
                .isVerified(property.isVerified())
                .contactNumber(property.getContactNumber())
                .availableFrom(property.getAvailableFrom())
                .tenantPreference(property.getTenantPreference().name())
                .city(property.getCity())
                .locality(property.getLocality())
                .type(property.getType().name())
                .furnishingStatus(property.getFurnishingStatus().name())
                .rooms(property.getRooms())
                .status(property.getStatus().name())
                .createdAt(property.getCreatedAt())
                .owner(ownerSummary)
                .images(imageResponses)
                .build();
    }
}