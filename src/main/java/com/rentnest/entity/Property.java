package com.rentnest.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "properties")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Property {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private BigDecimal rentAmount;

    @Column(nullable = false)
    private BigDecimal depositAmount;

    @Column(nullable = false)
    private int squareFootage;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String locality;

    @Column(nullable = false)
    private boolean isVerified;

    @Column(nullable = false)
    private String contactNumber;

    // NEW FIELDS FROM SCREENSHOT
    @Column(nullable = false)
    private LocalDate availableFrom;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TenantPreference tenantPreference;

    @Enumerated(EnumType.STRING)
    private PropertyType type;

    @Enumerated(EnumType.STRING)
    private PropertyStatus status;

    @Enumerated(EnumType.STRING)
    private FurnishingStatus furnishingStatus;

    private int rooms;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private User owner;

    @Builder.Default
    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PropertyImage> images = new ArrayList<>();

    public enum PropertyType { APARTMENT, HOUSE, VILLA, STUDIO }
    public enum PropertyStatus { UNDER_REVIEW, ACTIVE, RENTED, INACTIVE, AVAILABLE }
    public enum FurnishingStatus { UNFURNISHED, SEMI_FURNISHED, FULLY_FURNISHED }
    public enum TenantPreference { ANY, FAMILY, BACHELOR, COMPANY }
}