
package com.MediStock.app.services;

import com.MediStock.app.dto.ChangePasswordRequest;
import com.MediStock.app.dto.ProfileUpdateResponse;
import com.MediStock.app.dto.UpdateUserProfileRequest;
import com.MediStock.app.dto.UserProfileResponse;
import com.MediStock.app.entities.Role;
import com.MediStock.app.entities.User;
import com.MediStock.app.repositories.RoleRepository;
import com.MediStock.app.repositories.UserRepository;
import com.MediStock.app.security.JwtGenerator;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
public class UserProfileService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtGenerator jwtGenerator;

    public UserProfileService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            JwtGenerator jwtGenerator
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtGenerator = jwtGenerator;
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(String authenticatedEmail) {
        User user = findUser(authenticatedEmail);
        return toResponse(user);
    }

    @Transactional
    public ProfileUpdateResponse updateProfile(
            String authenticatedEmail,
            UpdateUserProfileRequest request
    ) {
        User user = findUser(authenticatedEmail);

        if (request == null) {
            throw new IllegalArgumentException(
                    "Profile information is required."
            );
        }

        String name = trimToNull(request.getName());
        String email = trimToNull(request.getEmail());
        String phone = trimToNull(request.getPhoneNumber());
        String picture = trimToNull(request.getProfilePicture());

        if (name == null) {
            throw new IllegalArgumentException(
                    "Name cannot be empty."
            );
        }

        if (name.length() > 100) {
            throw new IllegalArgumentException(
                    "Name cannot exceed 100 characters."
            );
        }

        if (email == null || !email.matches(
                "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
        )) {
            throw new IllegalArgumentException(
                    "Please enter a valid email address."
            );
        }

        if (email.length() > 254) {
            throw new IllegalArgumentException(
                    "Email address is too long."
            );
        }

        if (phone != null && phone.length() > 30) {
            throw new IllegalArgumentException(
                    "Phone number cannot exceed 30 characters."
            );
        }

        if (picture != null && picture.length() > 500_000) {
            throw new IllegalArgumentException(
                    "Profile picture is too large. Please choose a smaller image."
            );
        }

        if (picture != null
                && !picture.matches(
                        "^data:image/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$"
                )) {
            throw new IllegalArgumentException(
                    "Please select a valid JPG, PNG, or WebP profile picture."
            );
        }

        String normalizedEmail = email.toLowerCase(Locale.ROOT);
        String currentEmail = user.getEmail().toLowerCase(Locale.ROOT);

        if (!normalizedEmail.equals(currentEmail)) {
            userRepository.findByEmail(normalizedEmail)
                    .ifPresent(existing -> {
                        throw new IllegalArgumentException(
                                "That email address is already registered."
                        );
                    });
        }

        user.setName(name);
        user.setEmail(normalizedEmail);
        user.setPhoneNumber(phone);
        user.setProfilePicture(picture);

        User savedUser = userRepository.save(user);

        Role role = roleRepository.findById(savedUser.getRoleId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "The user's role could not be found."
                        )
                );

        String newToken = jwtGenerator.generateToken(
                savedUser.getEmail(),
                role.getRoleName()
        );

        UserProfileResponse profile = toResponse(savedUser);

        return new ProfileUpdateResponse(profile, newToken);
    }

    @Transactional
    public void changePassword(
            String authenticatedEmail,
            ChangePasswordRequest request
    ) {
        if (request == null
                || request.getCurrentPassword() == null
                || request.getNewPassword() == null) {
            throw new IllegalArgumentException(
                    "Current and new passwords are required."
            );
        }

        User user = findUser(authenticatedEmail);

        if (!passwordEncoder.matches(
                request.getCurrentPassword(),
                user.getPassword()
        )) {
            throw new IllegalArgumentException(
                    "The current password is incorrect."
            );
        }

        String newPassword = request.getNewPassword();

        if (newPassword.length() < 8
                || newPassword.length() > 72) {
            throw new IllegalArgumentException(
                    "The new password must contain between 8 and 72 characters."
            );
        }

        if (passwordEncoder.matches(
                newPassword,
                user.getPassword()
        )) {
            throw new IllegalArgumentException(
                    "Your new password must be different from your current password."
            );
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "The authenticated user could not be found."
                        )
                );
    }

    private UserProfileResponse toResponse(User user) {
        return new UserProfileResponse(
                user.getUserId(),
                user.getName(),
                user.getEmail(),
                user.getRoleId(),
                user.getPhoneNumber(),
                user.getProfilePicture()
        );
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }
}
