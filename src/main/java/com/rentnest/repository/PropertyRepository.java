package com.rentnest.repository;

import com.rentnest.entity.Property;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long> {

    List<Property> findByOwnerIdOrderByCreatedAtDesc(Long ownerId);

    // Advanced System-Level Search Query
    @Query("SELECT p FROM Property p WHERE " +
            "(:city IS NULL OR p.city = :city) AND " +
            "(:minRent IS NULL OR p.rentAmount >= :minRent) AND " +
            "(:maxRent IS NULL OR p.rentAmount <= :maxRent) AND " +
            "(:type IS NULL OR p.type = :type) AND " +
            "(:furnishing IS NULL OR p.furnishingStatus = :furnishing) AND " +
            "(:tenant IS NULL OR p.tenantPreference = :tenant)")
    Page<Property> searchPropertiesAdvanced(
            @Param("city") String city,
            @Param("minRent") BigDecimal minRent,
            @Param("maxRent") BigDecimal maxRent,
            @Param("type") Property.PropertyType type,
            @Param("furnishing") Property.FurnishingStatus furnishing,
            @Param("tenant") Property.TenantPreference tenant,
            Pageable pageable
    );
}