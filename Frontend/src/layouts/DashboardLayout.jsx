
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";

import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import AiChatWidget from "../components/ai/AiChatWidget.jsx";

function DashboardLayout() {
    return (
        <Box
            sx={{
                display: "flex",
                gap: "14px",
                minHeight: "100vh",
                boxSizing: "border-box",
                p: "14px",
                backgroundColor: "#F6F8FB",

                "@media (max-width: 900px)": {
                    gap: "10px",
                    p: "10px"
                }
            }}
        >
            {/* SIDEBAR */}
            <Sidebar />

            {/* MAIN APPLICATION AREA */}
            <Box
                sx={{
                    flex: 1,
                    minWidth: 0,
                    minHeight: "calc(100vh - 28px)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",

                    "@media (max-width: 900px)": {
                        gap: "10px",
                        minHeight: "calc(100vh - 20px)"
                    }
                }}
            >
                {/* NAVBAR */}
                <Navbar />

                {/* PAGE CONTENT */}
                <Box
                    component="main"
                    sx={{
                        flex: 1,
                        minWidth: 0,
                        p: {
                            xs: 2,
                            sm: 2.5,
                            md: 3
                        },
                        borderRadius: "24px",
                        boxSizing: "border-box",
                        overflowX: "hidden",
                        backgroundColor: "transparent"
                    }}
                >
                    <Outlet />
                </Box>
            </Box>

            {/* FLOATING AI CHAT */}
            <AiChatWidget />
        </Box>
    );
}

export default DashboardLayout;
