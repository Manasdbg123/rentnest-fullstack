package com.rentnest.dto.request;

import com.rentnest.entity.Property;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class PropertyCreateRequest {
    private String title;
    private String description;
    private BigDecimal rentAmount;
    private BigDecimal depositAmount;
    private int squareFootage;
    private String city;
    private String locality;
    private Property.PropertyType type;
    private Property.FurnishingStatus furnishingStatus;
    private int rooms;
    private String contactNumber;

    // NEW FIELDS
    private LocalDate availableFrom;
    private Property.TenantPreference tenantPreference;
}