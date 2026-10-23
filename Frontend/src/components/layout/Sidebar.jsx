
import { useEffect, useState } from "react";

import {
    Avatar,
    Box,
    Divider,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography
} from "@mui/material";

import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import MedicationRoundedIcon from "@mui/icons-material/MedicationRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import LocalPharmacyRoundedIcon from "@mui/icons-material/LocalPharmacyRounded";
import PointOfSaleRoundedIcon from "@mui/icons-material/PointOfSaleRounded";

import { NavLink, useNavigate } from "react-router-dom";
import ProfileEditorDialog from "../profile/ProfileEditorDialog";

function Sidebar() {
    const navigate = useNavigate();

    const role = localStorage.getItem("role");
    const rolePath = role?.toLowerCase() || "staff";

    const [profile, setProfile] = useState({
        name: localStorage.getItem("name") || "",
        email: localStorage.getItem("email") || "",
        role: role || "",
        profilePicture: localStorage.getItem("profilePicture") || ""
    });

    const [profileDialogOpen, setProfileDialogOpen] = useState(false);

    useEffect(() => {
        const updateProfile = (event) => {
            const updatedProfile = event.detail || {};

            setProfile({
                name:
                    updatedProfile.name ||
                    localStorage.getItem("name") ||
                    "",
                email:
                    updatedProfile.email ||
                    localStorage.getItem("email") ||
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

    const logout = () => {
        localStorage.clear();
        navigate("/");
    };

    const displayName = profile.name.trim() || "My Account";

    const initial =
        displayName.charAt(0).toUpperCase() ||
        profile.email.charAt(0).toUpperCase() ||
        "U";

    return (
        <Box
            component="aside"
            sx={{
                width: 264,
                height: "calc(100vh - 28px)",
                position: "sticky",
                top: 0,
                display: "flex",
                flexDirection: "column",
                borderRadius: "24px",
                overflow: "hidden",
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                boxShadow: "0 8px 30px rgba(15, 23, 42, 0.05)",
                flexShrink: 0,
                "@media (max-width: 900px)": {
                    width: 232,
                    height: "calc(100vh - 20px)",
                    borderRadius: "20px"
                }
            }}
        >
            {/* Brand */}
            <Box sx={{ px: 3, py: 3 }}>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5
                    }}
                >
                    <Box
                        sx={{
                            width: 42,
                            height: 42,
                            borderRadius: "14px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: "primary.main",
                            color: "primary.contrastText"
                        }}
                    >
                        <LocalPharmacyRoundedIcon />
                    </Box>

                    <Box>
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 800,
                                letterSpacing: "-0.5px",
                                lineHeight: 1.2
                            }}
                        >
                            MediStock
                        </Typography>

                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >
                            Medical Inventory
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <Divider />

            {/* Navigation */}
            <Box
                sx={{
                    flex: 1,
                    overflowY: "auto",
                    px: 1.5,
                    py: 2
                }}
            >
                <SectionLabel>Workspace</SectionLabel>

                <List disablePadding>
                    <MenuItem
                        to={`/${rolePath}/dashboard`}
                        icon={<DashboardRoundedIcon />}
                        label="Dashboard"
                    />

                    <MenuItem
                        to={`/${rolePath}/medicines`}
                        icon={<MedicationRoundedIcon />}
                        label="Medicines"
                    />

                    <MenuItem
                        to={`/${rolePath}/inventory`}
                        icon={<Inventory2RoundedIcon />}
                        label="Inventory"
                    />

                    <MenuItem
                        to={`/${rolePath}/sales`}
                        icon={<PointOfSaleRoundedIcon />}
                        label="Sales"
                    />

                    {role === "ADMIN" && (
                        <>
                            <MenuItem
                                to={`/${rolePath}/suppliers`}
                                icon={<LocalShippingRoundedIcon />}
                                label="Suppliers"
                            />

                            <MenuItem
                                to={`/${rolePath}/purchase-orders`}
                                icon={<ShoppingCartRoundedIcon />}
                                label="Purchase Orders"
                            />

                            <MenuItem
                                to={`/${rolePath}/users`}
                                icon={<PeopleRoundedIcon />}
                                label="Users"
                            />

                            <MenuItem
                                to={`/${rolePath}/reports`}
                                icon={<AssessmentRoundedIcon />}
                                label="Reports"
                            />
                        </>
                    )}

                    {role === "PHARMACIST" && (
                        <>
                            <MenuItem
                                to={`/${rolePath}/suppliers`}
                                icon={<LocalShippingRoundedIcon />}
                                label="Suppliers"
                            />

                            <MenuItem
                                to={`/${rolePath}/purchase-orders`}
                                icon={<ShoppingCartRoundedIcon />}
                                label="Purchase Orders"
                            />
                        </>
                    )}
                </List>

                <SectionLabel>Updates</SectionLabel>

                <List disablePadding>
                    <MenuItem
                        to={`/${rolePath}/notifications`}
                        icon={<NotificationsRoundedIcon />}
                        label="Notifications"
                    />
                </List>
            </Box>

            <Divider />

            {/* Clickable account card */}
            <Box sx={{ p: 1.5 }}>
                <ListItemButton
                    onClick={() => setProfileDialogOpen(true)}
                    sx={{
                        borderRadius: "16px",
                        py: 1.5,
                        px: 1.5,
                        mb: 1,
                        "&:hover": {
                            bgcolor: "action.hover"
                        }
                    }}
                >
                    <ListItemIcon sx={{ minWidth: 46 }}>
                        <Avatar
                            src={profile.profilePicture || undefined}
                            alt={displayName}
                            sx={{
                                width: 40,
                                height: 40,
                                bgcolor: "primary.light",
                                color: "primary.dark",
                                fontWeight: 700
                            }}
                        >
                            {initial}
                        </Avatar>
                    </ListItemIcon>

                    <ListItemText
                        primary={displayName}
                        secondary={
                            profile.email ||
                            profile.role ||
                            "Edit your account"
                        }
                        primaryTypographyProps={{
                            fontWeight: 700,
                            fontSize: 13,
                            noWrap: true
                        }}
                        secondaryTypographyProps={{
                            fontSize: 11,
                            noWrap: true
                        }}
                    />

                    <Typography
                        variant="caption"
                        color="primary.main"
                        sx={{ ml: 0.5, fontWeight: 600 }}
                    >
                        Edit
                    </Typography>
                </ListItemButton>

                <ListItemButton
                    onClick={logout}
                    sx={{
                        borderRadius: "14px",
                        px: 1.5,
                        py: 1.2,
                        color: "error.main",
                        "&:hover": {
                            bgcolor: "error.light",
                            color: "error.dark"
                        }
                    }}
                >
                    <ListItemIcon
                        sx={{
                            minWidth: 40,
                            color: "inherit"
                        }}
                    >
                        <LogoutRoundedIcon />
                    </ListItemIcon>

                    <ListItemText
                        primary="Logout"
                        primaryTypographyProps={{
                            fontWeight: 600,
                            fontSize: 13
                        }}
                    />
                </ListItemButton>
            </Box>

            {/* Profile editor dialog */}
            <ProfileEditorDialog
                open={profileDialogOpen}
                onClose={() => setProfileDialogOpen(false)}
            />
        </Box>
    );
}

function SectionLabel({ children }) {
    return (
        <Typography
            variant="caption"
            sx={{
                display: "block",
                px: 1.5,
                mb: 1,
                mt: 2,
                color: "text.secondary",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "1px",
                fontSize: 10
            }}
        >
            {children}
        </Typography>
    );
}

function MenuItem({ to, icon, label }) {
    return (
        <ListItemButton
            component={NavLink}
            to={to}
            end
            sx={{
                borderRadius: "14px",
                mb: 0.5,
                px: 1.5,
                py: 1.2,
                color: "text.secondary",
                "& .MuiListItemIcon-root": {
                    minWidth: 40,
                    color: "inherit"
                },
                "& .MuiListItemText-primary": {
                    fontSize: 13,
                    fontWeight: 600
                },
                "&.active": {
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    boxShadow: "0 4px 12px rgba(25, 118, 210, 0.22)"
                },
                "&.active .MuiListItemIcon-root": {
                    color: "inherit"
                },
                "&:hover:not(.active)": {
                    bgcolor: "action.hover",
                    color: "text.primary"
                }
            }}
        >
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText primary={label} />
        </ListItemButton>
    );
}

export default Sidebar;
