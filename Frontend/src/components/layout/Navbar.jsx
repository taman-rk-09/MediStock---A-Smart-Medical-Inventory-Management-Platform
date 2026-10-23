
import { useEffect, useState } from "react";

import {
    AppBar,
    Avatar,
    Box,
    Toolbar,
    Typography
} from "@mui/material";

import { useLocation } from "react-router-dom";

function Navbar() {
    const location = useLocation();

    const [profile, setProfile] = useState({
        name: localStorage.getItem("name") || "",
        role: localStorage.getItem("role") || "",
        profilePicture: localStorage.getItem("profilePicture") || ""
    });

    useEffect(() => {
        const updateProfile = (event) => {
            const updatedProfile = event.detail || {};

            setProfile({
                name:
                    updatedProfile.name ||
                    localStorage.getItem("name") ||
                    "",
                role:
                    updatedProfile.role ||
                    localStorage.getItem("role") ||
                    "",
                profilePicture:
                    updatedProfile.profilePicture ||
                    localStorage.getItem("profilePicture") ||
                    ""
            });
        };

        window.addEventListener(
            "medistock-profile-updated",
            updateProfile
        );

        return () => {
            window.removeEventListener(
                "medistock-profile-updated",
                updateProfile
            );
        };
    }, []);

    const pageTitle = getPageTitle(location.pathname);

    const initial =
        profile.name.trim().charAt(0).toUpperCase() || "U";

    return (
        <AppBar
            position="static"
            elevation={0}
            color="transparent"
            sx={{
                borderBottom: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                color: "text.primary"
            }}
        >
            <Toolbar
                sx={{
                    minHeight: "76px",
                    px: { xs: 2, md: 3 },
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 2
                }}
            >
                <Box sx={{ minWidth: 0 }}>
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 800,
                            letterSpacing: "-0.5px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap"
                        }}
                    >
                        {pageTitle}
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.3 }}
                    >
                        Welcome back, {profile.name || "User"}
                    </Typography>
                </Box>

                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        flexShrink: 0
                    }}
                >
                    <Box
                        sx={{
                            display: { xs: "none", sm: "block" },
                            textAlign: "right"
                        }}
                    >
                        <Typography
                            variant="body2"
                            sx={{ fontWeight: 700 }}
                        >
                            {profile.name || "User"}
                        </Typography>

                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ textTransform: "capitalize" }}
                        >
                            {profile.role?.toLowerCase() || "staff"}
                        </Typography>
                    </Box>

                    <Avatar
                        src={profile.profilePicture || undefined}
                        alt={profile.name || "User"}
                        sx={{
                            width: 42,
                            height: 42,
                            bgcolor: "primary.light",
                            color: "primary.dark",
                            fontWeight: 800,
                            border: "2px solid",
                            borderColor: "divider"
                        }}
                    >
                        {initial}
                    </Avatar>
                </Box>
            </Toolbar>
        </AppBar>
    );
}

function getPageTitle(pathname) {
    const segments = pathname
        .split("/")
        .filter(Boolean);

    const page = segments[segments.length - 1] || "dashboard";

    const titles = {
        dashboard: "Dashboard",
        medicines: "Medicines",
        inventory: "Inventory",
        sales: "Sales",
        suppliers: "Suppliers",
        "purchase-orders": "Purchase Orders",
        users: "User Management",
        reports: "Reports & Analytics",
        notifications: "Notifications",
        profile: "My Profile"
    };

    if (titles[page]) {
        return titles[page];
    }

    return page
        .split("-")
        .map(
            word =>
                word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join(" ");
}

export default Navbar;
