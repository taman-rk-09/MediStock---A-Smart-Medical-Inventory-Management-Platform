
package com.MediStock.app.dto;

public class UserProfileResponse {

    private Long userId;
    private String name;
    private String email;
    private Long roleId;
    private String phoneNumber;
    private String profilePicture;

    public UserProfileResponse() {
    }

    public UserProfileResponse(
            Long userId,
            String name,
            String email,
            Long roleId,
            String phoneNumber,
            String profilePicture
    ) {
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.roleId = roleId;
        this.phoneNumber = phoneNumber;
        this.profilePicture = profilePicture;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Long getRoleId() {
        return roleId;
    }

    public void setRoleId(Long roleId) {
        this.roleId = roleId;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getProfilePicture() {
        return profilePicture;
    }

    public void setProfilePicture(String profilePicture) {
        this.profilePicture = profilePicture;
    }
}
