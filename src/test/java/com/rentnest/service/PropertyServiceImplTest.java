package com.rentnest.service;

import com.rentnest.dto.request.PropertyCreateRequest;
import com.rentnest.dto.response.PropertyResponse;
import com.rentnest.entity.Property;
import com.rentnest.entity.User;
import com.rentnest.entity.Role;
import com.rentnest.mapper.PropertyMapper;
import com.rentnest.repository.PropertyRepository;
import com.rentnest.repository.UserRepository;
import com.rentnest.service.impl.PropertyServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PropertyServiceImplTest {

    @Mock
    private PropertyRepository propertyRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CloudinaryService cloudinaryService;

    @Mock
    private PropertyMapper propertyMapper;

    @InjectMocks
    private PropertyServiceImpl propertyService;

    private User mockOwner;
    private PropertyCreateRequest mockRequest;

    @BeforeEach
    void setUp() {
        mockOwner = User.builder()
                .id(1L)
                .name("Test Owner")
                .email("owner@test.com")
                .role(Role.OWNER)
                .build();

        mockRequest = new PropertyCreateRequest();
        mockRequest.setTitle("Beautiful Villa in Tech Park");
        mockRequest.setDescription("A highly detailed description of a great property.");
        mockRequest.setRentAmount(new BigDecimal("25000"));
        mockRequest.setCity("Bengaluru");
        mockRequest.setLocality("Whitefield");
        mockRequest.setType(Property.PropertyType.VILLA);
        mockRequest.setFurnishingStatus(Property.FurnishingStatus.FULLY_FURNISHED);
        mockRequest.setRooms(3);
    }

    @Test
    void createProperty_Success_ReturnsPropertyResponse() {
        // Arrange: Tell Mockito what to do when the database is called
        when(userRepository.findById(1L)).thenReturn(Optional.of(mockOwner));

        Property savedProperty = Property.builder()
                .id(100L)
                .title(mockRequest.getTitle())
                .owner(mockOwner)
                .images(new ArrayList<>())
                .status(Property.PropertyStatus.UNDER_REVIEW)
                .build();

        when(propertyRepository.save(any(Property.class))).thenReturn(savedProperty);

        PropertyResponse expectedResponse = PropertyResponse.builder()
                .id(100L)
                .title("Beautiful Villa in Tech Park")
                .build();

        when(propertyMapper.toPropertyResponse(savedProperty)).thenReturn(expectedResponse);

        // Act: Actually call the method we are testing
        PropertyResponse actualResponse = propertyService.createProperty(mockRequest, null, 1L);

        // Assert: Verify the business logic worked perfectly
        assertNotNull(actualResponse);
        assertEquals(100L, actualResponse.getId());
        assertEquals("Beautiful Villa in Tech Park", actualResponse.getTitle());

        // Verify that our mocks were actually interacted with
        verify(userRepository, times(1)).findById(1L);
        verify(propertyRepository, times(1)).save(any(Property.class));
    }
}