import { Outlet } from "react-router-dom";

import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import AiChatWidget from "../components/ai/AiChatWidget.jsx";

function DashboardLayout() {

    return (

        <div
            style={{
                display: "flex",
                minHeight: "100vh",
                background: "#F6F8FB"
            }}
        >

            <Sidebar />

            <div
                style={{
                    flex: 1,
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column"
                }}
            >

                <Navbar />

                <main
                    style={{
                        flex: 1,
                        minWidth: 0,
                        padding: "28px",
                        overflowX: "hidden"
                    }}
                >

                    {/* Active Route Content */}
                    <Outlet />

                </main>

            </div>

            {/* Floating Chat Widget */}
            <AiChatWidget />

        </div>

    );

}

export default DashboardLayout;