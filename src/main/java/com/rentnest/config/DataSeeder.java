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
        if (propertyRepository.count() >= 15) {
            log.info("Database already seeded. Skipping...");
            return;
        }

        log.info("Seeding database with highly realistic verified properties...");

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
        String[] localities = {"Koramangala", "Andheri West", "Koregaon Park", "Hauz Khas", "Banjara Hills", "Indiranagar", "Bandra", "Viman Nagar"};
        Property.PropertyType[] types = Property.PropertyType.values();
        Property.FurnishingStatus[] furnishings = Property.FurnishingStatus.values();
        Property.TenantPreference[] preferences = Property.TenantPreference.values();

        String[] imagePool = {
                "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1502672260266-1c1de2d9d000?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80"
        };

        Random random = new Random();

        for (int i = 1; i <= 20; i++) {
            int rooms = random.nextInt(4) + 1;
            BigDecimal rent = new BigDecimal(15000 + random.nextInt(65000));
            BigDecimal deposit = rent.multiply(new BigDecimal(random.nextInt(3) + 3));
            int sqft = rooms * (400 + random.nextInt(200));

            Property property = Property.builder()
                    .title("Premium " + rooms + " BHK " + types[random.nextInt(types.length)] + " for Rent")
                    .description("A beautiful, well-ventilated property located in a prime area. Highly secure society with 24/7 water supply.")
                    .rentAmount(rent)
                    .depositAmount(deposit)
                    .squareFootage(sqft)
                    .city(cities[random.nextInt(cities.length)])
                    .locality(localities[random.nextInt(localities.length)])
                    .type(types[random.nextInt(types.length)])
                    .furnishingStatus(furnishings[random.nextInt(furnishings.length)])
                    .rooms(rooms)
                    .status(Property.PropertyStatus.AVAILABLE)
                    .isVerified(random.nextBoolean())
                    .contactNumber("919876543210")
                    .availableFrom(LocalDate.now().plusDays(random.nextInt(30))) // Random date within next 30 days
                    .tenantPreference(preferences[random.nextInt(preferences.length)])
                    .owner(seedUser)
                    .build();

            int numImages = random.nextInt(3) + 1;
            for (int j = 0; j < numImages; j++) {
                property.getImages().add(PropertyImage.builder()
                        .property(property)
                        .imageUrl(imagePool[random.nextInt(imagePool.length)])
                        .isPrimary(j == 0)
                        .build());
            }

            propertyRepository.save(property);
        }
        log.info("Successfully seeded 20 properties!");
    }
}