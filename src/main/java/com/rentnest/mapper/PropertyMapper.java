package com.rentnest.mapper;

import com.rentnest.dto.response.PropertyResponse;
import com.rentnest.entity.Property;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class PropertyMapper {

    private final UserMapper userMapper;

    public PropertyResponse toPropertyResponse(Property property) {
        if (property == null) {
            return null;
        }

        var images = property.getImages().stream()
                .map(img -> new PropertyResponse.ImageResponse(img.getId(), img.getImageUrl(), img.isPrimary()))
                .collect(Collectors.toList());

        return PropertyResponse.builder()
                .id(property.getId())
                .title(property.getTitle())
                .description(property.getDescription())
                .rentAmount(property.getRentAmount())
                .city(property.getCity())
                .locality(property.getLocality())
                .type(property.getType().name())
                .furnishingStatus(property.getFurnishingStatus().name())
                .rooms(property.getRooms())
                .status(property.getStatus().name())
                .createdAt(property.getCreatedAt())
                .owner(userMapper.toOwnerSummary(property.getOwner()))
                .images(images)
                .build();
    }
}