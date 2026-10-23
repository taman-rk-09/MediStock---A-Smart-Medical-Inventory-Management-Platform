
package com.MediStock.app.controllers;

import com.MediStock.app.dto.ChangePasswordRequest;
import com.MediStock.app.dto.ProfileUpdateResponse;
import com.MediStock.app.dto.UpdateUserProfileRequest;
import com.MediStock.app.dto.UserProfileResponse;
import com.MediStock.app.services.UserProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users/me")
public class UserProfileController {

    private final UserProfileService userProfileService;

    public UserProfileController(
            UserProfileService userProfileService
    ) {
        this.userProfileService = userProfileService;
    }

    @GetMapping
    public ResponseEntity<?> getProfile(
            Authentication authentication
    ) {
        try {
            UserProfileResponse response =
                    userProfileService.getProfile(
                            authentication.getName()
                    );

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage())
            );
        }
    }

    @PutMapping
    public ResponseEntity<?> updateProfile(
            Authentication authentication,
            @RequestBody UpdateUserProfileRequest request
    ) {
        try {
            ProfileUpdateResponse response =
                    userProfileService.updateProfile(
                            authentication.getName(),
                            request
                    );

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage())
            );
        }
    }

    @PutMapping("/password")
    public ResponseEntity<?> changePassword(
            Authentication authentication,
            @RequestBody ChangePasswordRequest request
    ) {
        try {
            userProfileService.changePassword(
                    authentication.getName(),
                    request
            );

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Password changed successfully."
                    )
            );

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage())
            );
        }
    }
}
