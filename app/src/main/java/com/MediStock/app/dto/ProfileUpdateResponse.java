
package com.MediStock.app.dto;

public class ProfileUpdateResponse {

    private UserProfileResponse profile;
    private String token;

    public ProfileUpdateResponse() {
    }

    public ProfileUpdateResponse(
            UserProfileResponse profile,
            String token
    ) {
        this.profile = profile;
        this.token = token;
    }

    public UserProfileResponse getProfile() {
        return profile;
    }

    public void setProfile(UserProfileResponse profile) {
        this.profile = profile;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}
