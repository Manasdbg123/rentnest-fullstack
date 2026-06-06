package com.rentnest.mapper;

import com.rentnest.dto.response.PropertyResponse.OwnerSummary;
import com.rentnest.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public OwnerSummary toOwnerSummary(User user) {
        if (user == null) {
            return null;
        }

        return OwnerSummary.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .build();
    }
}