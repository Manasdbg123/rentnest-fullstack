package com.rentnest.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PropertyResponse {

    private Long id;
    private String title;
    private String description;
    private BigDecimal rentAmount;
    private BigDecimal depositAmount;
    private int squareFootage;
    private String city;
    private String locality;
    private String type;
    private String furnishingStatus;
    private int rooms;
    private String status;
    private boolean isVerified;
    private String contactNumber;

    // NEW FIELDS
    private LocalDate availableFrom;
    private String tenantPreference;

    private LocalDateTime createdAt;
    private OwnerSummary owner;
    private List<ImageResponse> images;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class OwnerSummary {
        private Long id;
        private String name;
        private String email;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class ImageResponse {
        private Long id;
        private String imageUrl;
        private boolean isPrimary;
    }
}