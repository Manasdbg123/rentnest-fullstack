package com.rentnest.config;

import com.rentnest.entity.Property;
import com.rentnest.entity.PropertyImage;
import com.rentnest.entity.Role;
import com.rentnest.entity.User;
import com.rentnest.repository.PropertyRepository;
import com.rentnest.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (propertyRepository.count() >= 35) {
            log.info("Database already seeded with enough properties. Skipping...");
            return;
        }

        log.info("Seeding database with 50 diverse properties (Rooms, Shops, Commercial, Apartments)...");

        User seedUser = userRepository.findByEmail("admin@rentnest.com").orElseGet(() -> {
            User newUser = User.builder()
                    .name("RentNest Admin")
                    .email("admin@rentnest.com")
                    .password(passwordEncoder.encode("password123"))
                    .role(Role.USER)
                    .build();
            return userRepository.save(newUser);
        });

        String[] cities = {"Bengaluru", "Mumbai", "Pune", "Delhi", "Hyderabad"};
        String[][] localities = {
                {"Koramangala", "Indiranagar", "HSR Layout", "Whitefield", "Marathahalli", "Commercial Street"}, 
                {"Andheri West", "Bandra", "Juhu", "Powai", "Worli", "BKC"}, 
                {"Koregaon Park", "Viman Nagar", "Kalyani Nagar", "Hinjewadi", "FC Road"}, 
                {"Hauz Khas", "Vasant Kunj", "Lajpat Nagar", "Connaught Place", "Karol Bagh"}, 
                {"Banjara Hills", "Jubilee Hills", "HITEC City", "Gachibowli", "Ameerpet"} 
        };
        
        Property.PropertyType[] types = Property.PropertyType.values();
        Property.FurnishingStatus[] furnishings = Property.FurnishingStatus.values();
        Property.TenantPreference[] preferences = Property.TenantPreference.values();

        String[] apartmentImages = {
                "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1502672260266-1c1de2d9d000?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80"
        };
        
        String[] shopImages = {
                "https://images.unsplash.com/photo-1534489329927-b6732f1465e9?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1581579213190-671cb0a84e62?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1555529733-0e670560f7e1?auto=format&fit=crop&w=800&q=80"
        };
        
        String[] roomImages = {
                "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80"
        };
        
        String[] amenityPool = {"Gym", "Swimming Pool", "Lift", "Power Backup", "Security", "Club House", "Park", "Reserved Parking", "Visitor Parking", "Intercom Facility", "WiFi", "Cafeteria"};

        Random random = new Random();

        for (int i = 1; i <= 50; i++) {
            Property.PropertyType type = types[random.nextInt(types.length)];
            int rooms = (type == Property.PropertyType.SHOP || type == Property.PropertyType.COMMERCIAL) ? 0 : random.nextInt(4) + 1;
            
            BigDecimal rent;
            String titlePrefix;
            String[] imgPool;
            
            if (type == Property.PropertyType.SHOP || type == Property.PropertyType.COMMERCIAL) {
                rent = new BigDecimal(40000 + random.nextInt(150000)); // High rent
                titlePrefix = "Prime " + type + " Space";
                imgPool = shopImages;
            } else if (type == Property.PropertyType.ROOM || type == Property.PropertyType.PG) {
                rent = new BigDecimal(5000 + random.nextInt(15000)); // Low rent
                titlePrefix = "Cozy " + type + " for Rent";
                imgPool = roomImages;
                rooms = 1; // Room/PG usually 1
            } else {
                rent = new BigDecimal(15000 + random.nextInt(85000)); // Normal rent
                titlePrefix = "Premium " + rooms + " BHK " + type;
                imgPool = apartmentImages;
            }
            
            // Generate some extreme "Hot Deals" (15% chance to have very low rent for its category)
            if (random.nextInt(100) < 15) {
                rent = rent.multiply(new BigDecimal("0.6")); // 40% off market price
            }

            BigDecimal deposit = rent.multiply(new BigDecimal(random.nextInt(3) + 2)); 
            int sqft = (rooms == 0 ? 1 : rooms) * (350 + random.nextInt(250));
            
            int cityIdx = random.nextInt(cities.length);
            String city = cities[cityIdx];
            String locality = localities[cityIdx][random.nextInt(localities[cityIdx].length)];

            List<String> propertyAmenities = new ArrayList<>();
            int numAmenities = random.nextInt(6) + 2;
            for(int k=0; k<numAmenities; k++) {
                String am = amenityPool[random.nextInt(amenityPool.length)];
                if(!propertyAmenities.contains(am)) {
                    propertyAmenities.add(am);
                }
            }

            Property property = Property.builder()
                    .title(titlePrefix + " in " + locality)
                    .description("Highly sought after " + type.toString().toLowerCase() + " property in " + locality + ", " + city + ". Excellent location and verified ownership.")
                    .rentAmount(rent)
                    .depositAmount(deposit)
                    .squareFootage(sqft)
                    .city(city)
                    .locality(locality)
                    .type(type)
                    .furnishingStatus(furnishings[random.nextInt(furnishings.length)])
                    .rooms(rooms)
                    .status(Property.PropertyStatus.AVAILABLE)
                    .isVerified(random.nextBoolean() || random.nextBoolean()) 
                    .contactNumber("919876543210")
                    .availableFrom(LocalDate.now().plusDays(random.nextInt(30))) 
                    .tenantPreference(preferences[random.nextInt(preferences.length)])
                    .owner(seedUser)
                    .amenities(propertyAmenities)
                    .negotiable(random.nextBoolean())
                    .build();

            int numImages = random.nextInt(3) + 1;
            for (int j = 0; j < numImages; j++) {
                property.getImages().add(PropertyImage.builder()
                        .property(property)
                        .imageUrl(imgPool[random.nextInt(imgPool.length)])
                        .isPrimary(j == 0)
                        .build());
            }

            propertyRepository.save(property);
        }
        log.info("Successfully seeded 50 diverse properties!");
    }
}