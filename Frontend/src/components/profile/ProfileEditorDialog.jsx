
import { useEffect, useRef, useState } from "react";

import {
    Alert,
    Avatar,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    Stack,
    TextField,
    Typography
} from "@mui/material";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import LockResetRoundedIcon from "@mui/icons-material/LockResetRounded";

import api from "../../services/api";

const EMPTY_PROFILE = {
    userId: null,
    name: "",
    email: "",
    roleId: null,
    phoneNumber: "",
    profilePicture: ""
};

function getErrorMessage(error) {
    const responseData = error?.response?.data;

    if (typeof responseData === "string") {
        return responseData;
    }

    return (
        responseData?.message ||
        responseData?.error ||
        error?.message ||
        "Something went wrong. Please try again."
    );
}

async function compressImage(file) {
    const supportedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (!file || !supportedTypes.includes(file.type)) {
        throw new Error("Choose a JPG, PNG, or WebP image.");
    }

    if (file.size > 15 * 1024 * 1024) {
        throw new Error("Choose an image smaller than 15 MB.");
    }

    const imageUrl = URL.createObjectURL(file);

    try {
        const image = new Image();

        await new Promise((resolve, reject) => {
            image.onload = resolve;
            image.onerror = () =>
                reject(new Error("The selected image could not be opened."));
            image.src = imageUrl;
        });

        const maxDimension = 320;

        const scale = Math.min(
            1,
            maxDimension / Math.max(image.width, image.height)
        );

        const canvas = document.createElement("canvas");

        canvas.width = Math.max(
            1,
            Math.round(image.width * scale)
        );

        canvas.height = Math.max(
            1,
            Math.round(image.height * scale)
        );

        const context = canvas.getContext("2d");

        if (!context) {
            throw new Error("Your browser could not process this image.");
        }

        context.drawImage(
            image,
            0,
            0,
            canvas.width,
            canvas.height
        );

        let quality = 0.85;
        let dataUrl = canvas.toDataURL("image/jpeg", quality);

        while (dataUrl.length > 350_000 && quality > 0.35) {
            quality = Math.max(0.35, quality - 0.1);
            dataUrl = canvas.toDataURL("image/jpeg", quality);
        }

        if (dataUrl.length > 350_000) {
            throw new Error(
                "This image could not be compressed enough. Please choose another image."
            );
        }

        return dataUrl;
    } finally {
        URL.revokeObjectURL(imageUrl);
    }
}

function ProfileEditorDialog({ open, onClose }) {
    const fileInputRef = useRef(null);

    const [profile, setProfile] = useState(EMPTY_PROFILE);
    const [originalProfile, setOriginalProfile] = useState(EMPTY_PROFILE);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [compressingImage, setCompressingImage] = useState(false);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (!open) {
            return undefined;
        }

        let cancelled = false;

        async function loadProfile() {
            setLoading(true);
            setError("");
            setSuccess("");

            try {
                const response = await api.get("/users/me");

                if (cancelled) return;

                const loadedProfile = {
                    ...EMPTY_PROFILE,
                    ...response.data,
                    name: response.data.name || "",
                    email: response.data.email || "",
                    phoneNumber: response.data.phoneNumber || "",
                    profilePicture: response.data.profilePicture || ""
                };

                setProfile(loadedProfile);
                setOriginalProfile(loadedProfile);
            } catch (requestError) {
                if (!cancelled) {
                    setError(getErrorMessage(requestError));
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadProfile();

        return () => {
            cancelled = true;
        };
    }, [open]);

    const handleFieldChange = (event) => {
        const { name, value } = event.target;

        setProfile((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleImageSelection = async (event) => {
        const file = event.target.files?.[0];

        // Allows the same image to be selected again.
        event.target.value = "";

        if (!file) return;

        setError("");
        setSuccess("");
        setCompressingImage(true);

        try {
            const compressedImage = await compressImage(file);

            setProfile((previous) => ({
                ...previous,
                profilePicture: compressedImage
            }));
        } catch (imageError) {
            setError(getErrorMessage(imageError));
        } finally {
            setCompressingImage(false);
        }
    };

    const handleRemovePicture = () => {
        setProfile((previous) => ({
            ...previous,
            profilePicture: ""
        }));
    };

    const handleSaveProfile = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!profile.name.trim()) {
            setError("Name cannot be empty.");
            return;
        }

        if (!profile.email.trim()) {
            setError("Email cannot be empty.");
            return;
        }

        setSaving(true);

        try {
            const response = await api.put("/users/me", {
                name: profile.name.trim(),
                email: profile.email.trim(),
                phoneNumber: profile.phoneNumber.trim(),
                profilePicture: profile.profilePicture || null
            });

            const updatedProfile = response.data.profile;
            const newToken = response.data.token;

            if (!updatedProfile || !newToken) {
                throw new Error(
                    "The server response did not contain the updated profile and token."
                );
            }

            // Store the replacement JWT before making further API requests.
            localStorage.setItem("token", newToken);
            localStorage.setItem("name", updatedProfile.name || "");
            localStorage.setItem("email", updatedProfile.email || "");
            localStorage.setItem(
                "profilePicture",
                updatedProfile.profilePicture || ""
            );

            const normalizedProfile = {
                ...EMPTY_PROFILE,
                ...updatedProfile,
                phoneNumber: updatedProfile.phoneNumber || "",
                profilePicture: updatedProfile.profilePicture || ""
            };

            setProfile(normalizedProfile);
            setOriginalProfile(normalizedProfile);

            window.dispatchEvent(
                new CustomEvent("medistock-profile-updated", {
                    detail: normalizedProfile
                })
            );

            setSuccess("Your profile was updated successfully.");
        } catch (requestError) {
            setError(getErrorMessage(requestError));
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!currentPassword || !newPassword || !confirmPassword) {
            setError("Complete all three password fields.");
            return;
        }

        if (newPassword.length < 8 || newPassword.length > 72) {
            setError("Your new password must contain 8–72 characters.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("The new password and confirmation do not match.");
            return;
        }

        setChangingPassword(true);

        try {
            const response = await api.put("/users/me/password", {
                currentPassword,
                newPassword
            });

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

            setSuccess(
                response.data?.message ||
                "Password changed successfully."
            );
        } catch (requestError) {
            setError(getErrorMessage(requestError));
        } finally {
            setChangingPassword(false);
        }
    };

    const handleClose = () => {
        if (saving || changingPassword || compressingImage) {
            return;
        }

        setError("");
        setSuccess("");
        onClose();
    };

    const hasProfileChanges =
        profile.name !== originalProfile.name ||
        profile.email !== originalProfile.email ||
        profile.phoneNumber !== originalProfile.phoneNumber ||
        profile.profilePicture !== originalProfile.profilePicture;

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{
                sx: {
                    borderRadius: "24px",
                    backgroundImage: "none"
                }
            }}
        >
            <DialogTitle
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    pt: 3,
                    px: 3
                }}
            >
                <Box>
                    <Typography
                        sx={{
                            fontSize: "1.35rem",
                            fontWeight: 800,
                            letterSpacing: "-0.04em"
                        }}
                    >
                        Account settings
                    </Typography>

                    <Typography
                        sx={{
                            mt: 0.5,
                            color: "text.secondary",
                            fontSize: "0.82rem"
                        }}
                    >
                        Manage your personal information and security.
                    </Typography>
                </Box>

                <IconButton
                    onClick={handleClose}
                    disabled={
                        saving ||
                        changingPassword ||
                        compressingImage
                    }
                    aria-label="Close account settings"
                >
                    <CloseRoundedIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ px: 3, pb: 3, pt: 2 }}>
                {error && (
                    <Alert
                        severity="error"
                        sx={{ mb: 2, borderRadius: "12px" }}
                    >
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert
                        severity="success"
                        sx={{ mb: 2, borderRadius: "12px" }}
                    >
                        {success}
                    </Alert>
                )}

                {loading ? (
                    <Box
                        sx={{
                            minHeight: 220,
                            display: "grid",
                            placeItems: "center"
                        }}
                    >
                        <CircularProgress />
                    </Box>
                ) : (
                    <Stack spacing={3}>
                        <Box
                            component="form"
                            onSubmit={handleSaveProfile}
                        >
                            <Stack spacing={2.25}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 2
                                    }}
                                >
                                    <Avatar
                                        src={profile.profilePicture || undefined}
                                        alt={profile.name || "Profile picture"}
                                        sx={{
                                            width: 76,
                                            height: 76,
                                            fontSize: "1.6rem",
                                            fontWeight: 800,
                                            bgcolor: "primary.main"
                                        }}
                                    >
                                        {profile.name
                                            ?.trim()
                                            ?.charAt(0)
                                            ?.toUpperCase() || "U"}
                                    </Avatar>

                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography
                                            sx={{
                                                fontWeight: 750,
                                                fontSize: "0.9rem"
                                            }}
                                        >
                                            Profile picture
                                        </Typography>

                                        <Typography
                                            sx={{
                                                mt: 0.4,
                                                mb: 1,
                                                color: "text.secondary",
                                                fontSize: "0.75rem"
                                            }}
                                        >
                                            JPG, PNG or WebP. The image will
                                            be resized and compressed.
                                        </Typography>

                                        <Stack
                                            direction="row"
                                            spacing={1}
                                            flexWrap="wrap"
                                            useFlexGap
                                        >
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                startIcon={
                                                    compressingImage
                                                        ? <CircularProgress size={15} />
                                                        : <PhotoCameraRoundedIcon />
                                                }
                                                disabled={compressingImage}
                                                onClick={() =>
                                                    fileInputRef.current?.click()
                                                }
                                                sx={{
                                                    borderRadius: "10px",
                                                    textTransform: "none"
                                                }}
                                            >
                                                Choose image
                                            </Button>

                                            {profile.profilePicture && (
                                                <Button
                                                    size="small"
                                                    color="error"
                                                    startIcon={
                                                        <DeleteOutlineRoundedIcon />
                                                    }
                                                    onClick={handleRemovePicture}
                                                    sx={{
                                                        borderRadius: "10px",
                                                        textTransform: "none"
                                                    }}
                                                >
                                                    Remove
                                                </Button>
                                            )}
                                        </Stack>

                                        <input
                                            ref={fileInputRef}
                                            hidden
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            onChange={handleImageSelection}
                                        />
                                    </Box>
                                </Box>

                                <TextField
                                    label="Full name"
                                    name="name"
                                    value={profile.name}
                                    onChange={handleFieldChange}
                                    required
                                    fullWidth
                                    inputProps={{ maxLength: 100 }}
                                />

                                <TextField
                                    label="Email address"
                                    name="email"
                                    type="email"
                                    value={profile.email}
                                    onChange={handleFieldChange}
                                    required
                                    fullWidth
                                    inputProps={{ maxLength: 254 }}
                                />

                                <TextField
                                    label="Phone number"
                                    name="phoneNumber"
                                    value={profile.phoneNumber}
                                    onChange={handleFieldChange}
                                    fullWidth
                                    inputProps={{ maxLength: 30 }}
                                />

                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={
                                        saving ||
                                        compressingImage ||
                                        !hasProfileChanges
                                    }
                                    sx={{
                                        minHeight: 46,
                                        borderRadius: "13px",
                                        fontWeight: 750,
                                        textTransform: "none"
                                    }}
                                >
                                    {saving ? (
                                        <CircularProgress
                                            size={22}
                                            color="inherit"
                                        />
                                    ) : (
                                        "Save profile"
                                    )}
                                </Button>
                            </Stack>
                        </Box>

                        <Divider />

                        <Box
                            component="form"
                            onSubmit={handleChangePassword}
                        >
                            <Stack spacing={2}>
                                <Box>
                                    <Typography
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                            fontSize: "1rem",
                                            fontWeight: 800
                                        }}
                                    >
                                        <LockResetRoundedIcon
                                            color="primary"
                                            fontSize="small"
                                        />
                                        Change password
                                    </Typography>

                                    <Typography
                                        sx={{
                                            mt: 0.5,
                                            color: "text.secondary",
                                            fontSize: "0.78rem"
                                        }}
                                    >
                                        Choose a new password with at least
                                        eight characters.
                                    </Typography>
                                </Box>

                                <TextField
                                    label="Current password"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(event) =>
                                        setCurrentPassword(event.target.value)
                                    }
                                    autoComplete="current-password"
                                    fullWidth
                                />

                                <TextField
                                    label="New password"
                                    type="password"
                                    value={newPassword}
                                    onChange={(event) =>
                                        setNewPassword(event.target.value)
                                    }
                                    autoComplete="new-password"
                                    inputProps={{ maxLength: 72 }}
                                    fullWidth
                                />

                                <TextField
                                    label="Confirm new password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(event) =>
                                        setConfirmPassword(event.target.value)
                                    }
                                    autoComplete="new-password"
                                    inputProps={{ maxLength: 72 }}
                                    fullWidth
                                />

                                <Button
                                    type="submit"
                                    variant="outlined"
                                    disabled={changingPassword}
                                    sx={{
                                        minHeight: 44,
                                        borderRadius: "13px",
                                        fontWeight: 750,
                                        textTransform: "none"
                                    }}
                                >
                                    {changingPassword ? (
                                        <CircularProgress size={22} />
                                    ) : (
                                        "Update password"
                                    )}
                                </Button>
                            </Stack>
                        </Box>
                    </Stack>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2.5 }}>
                <Button
                    onClick={handleClose}
                    disabled={
                        saving ||
                        changingPassword ||
                        compressingImage
                    }
                    sx={{
                        borderRadius: "10px",
                        textTransform: "none",
                        fontWeight: 700
                    }}
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default ProfileEditorDialog;
