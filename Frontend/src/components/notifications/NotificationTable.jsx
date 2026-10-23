
import {
    Box,
    Button,
    Chip,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";

import DeleteOutlineRoundedIcon
    from "@mui/icons-material/DeleteOutlineRounded";

const getAlertColor = (alertType) => {
    switch (alertType) {
        case "LOW_STOCK":
            return "primary";
        case "EXPIRING_SOON":
            return "warning";
        case "EXPIRED":
            return "error";
        default:
            return "default";
    }
};

const getStatusColor = (status) => {
    switch (status) {
        case "ACTIVE":
            return "error";
        case "REVIEWED":
            return "warning";
        case "RESOLVED":
            return "success";
        default:
            return "default";
    }
};

const formatAlertType = (alertType) =>
    alertType?.replaceAll("_", " ") || "-";

function NotificationTable({
    notifications,
    canManage,
    canDelete,
    onReview,
    onDelete
}) {
    if (notifications.length === 0) {
        return (
            <Paper
                elevation={0}
                sx={{
                    p: 5,
                    textAlign: "center",
                    borderRadius: "20px",
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper"
                }}
            >
                <Typography
                    sx={{
                        color: "text.secondary",
                        fontSize: "0.9rem"
                    }}
                >
                    No notifications found.
                </Typography>
            </Paper>
        );
    }

    const showActionColumn = canManage || canDelete;

    const headerCellSx = {
        py: 1.75,
        px: 2,
        fontWeight: 750,
        fontSize: "0.78rem",
        color: "text.secondary",
        whiteSpace: "nowrap",
        bgcolor: "action.hover",
        borderBottom: "1px solid",
        borderColor: "divider"
    };

    const bodyCellSx = {
        py: 1.6,
        px: 2,
        borderColor: "divider"
    };

    return (
        <Paper
            elevation={0}
            sx={{
                width: "100%",
                minWidth: 0,
                maxWidth: "100%",
                borderRadius: "20px",
                border: "1px solid",
                borderColor: "divider",
                overflow: "hidden",
                bgcolor: "background.paper",
                boxShadow: "0 5px 20px rgba(25,40,70,0.035)"
            }}
        >
            <TableContainer
                sx={{
                    width: "100%",
                    maxWidth: "100%",
                    minWidth: 0,
                    overflowX: "auto",
                    overflowY: "hidden",
                    WebkitOverflowScrolling: "touch",
                    scrollbarWidth: "thin",
                    scrollbarColor:
                        "rgba(128,128,128,0.4) transparent",

                    "&::-webkit-scrollbar": {
                        height: 8
                    },

                    "&::-webkit-scrollbar-track": {
                        backgroundColor: "transparent"
                    },

                    "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "rgba(128,128,128,0.35)",
                        borderRadius: 10
                    }
                }}
            >
                <Table
                    size="medium"
                    stickyHeader={false}
                    sx={{
                        width: "100%",
                        minWidth: 1050,
                        tableLayout: "auto",

                        "& .MuiTableCell-root": {
                            boxSizing: "border-box"
                        },

                        "& .MuiTableBody-root .MuiTableRow-root:last-child .MuiTableCell-root": {
                            borderBottom: 0
                        },

                        "& .MuiTableBody-root .MuiTableRow-root:hover": {
                            bgcolor: "action.hover"
                        }
                    }}
                >
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ ...headerCellSx, minWidth: 130 }}>
                                Medicine
                            </TableCell>

                            <TableCell sx={{ ...headerCellSx, minWidth: 100 }}>
                                Batch
                            </TableCell>

                            <TableCell
                                align="center"
                                sx={{ ...headerCellSx, minWidth: 85 }}
                            >
                                Quantity
                            </TableCell>

                            <TableCell sx={{ ...headerCellSx, minWidth: 120 }}>
                                Expiry
                            </TableCell>

                            <TableCell
                                align="center"
                                sx={{ ...headerCellSx, minWidth: 90 }}
                            >
                                Days Left
                            </TableCell>

                            <TableCell sx={{ ...headerCellSx, minWidth: 140 }}>
                                Alert
                            </TableCell>

                            <TableCell sx={{ ...headerCellSx, minWidth: 110 }}>
                                Status
                            </TableCell>

                            {canDelete && (
                                <TableCell
                                    sx={{
                                        ...headerCellSx,
                                        minWidth: 180,
                                        width: 220
                                    }}
                                >
                                    Remarks
                                </TableCell>
                            )}

                            {showActionColumn && (
                                <TableCell
                                    align="center"
                                    sx={{
                                        ...headerCellSx,
                                        minWidth: 150,
                                        width: 160,
                                        position: "sticky",
                                        right: 0,
                                        zIndex: 2,
                                        bgcolor: "background.paper",
                                        boxShadow: "-5px 0 10px rgba(25,40,70,0.04)"
                                    }}
                                >
                                    Actions
                                </TableCell>
                            )}
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {notifications.map((notification) => (
                            <TableRow
                                hover
                                key={notification.notificationId}
                                sx={{
                                    transition: "background-color 160ms ease"
                                }}
                            >
                                <TableCell sx={bodyCellSx}>
                                    <Typography
                                        sx={{
                                            fontSize: "0.86rem",
                                            fontWeight: 650,
                                            whiteSpace: "nowrap"
                                        }}
                                    >
                                        {notification.medicineName || "-"}
                                    </Typography>
                                </TableCell>

                                <TableCell sx={bodyCellSx}>
                                    <Typography
                                        sx={{
                                            fontSize: "0.85rem",
                                            color: "text.secondary",
                                            whiteSpace: "nowrap"
                                        }}
                                    >
                                        {notification.batchNumber || "-"}
                                    </Typography>
                                </TableCell>

                                <TableCell align="center" sx={bodyCellSx}>
                                    <Typography
                                        sx={{
                                            fontSize: "0.85rem",
                                            fontWeight: 550
                                        }}
                                    >
                                        {notification.quantity ?? "-"}
                                    </Typography>
                                </TableCell>

                                <TableCell sx={bodyCellSx}>
                                    <Typography
                                        sx={{
                                            fontSize: "0.85rem",
                                            color: "text.secondary",
                                            whiteSpace: "nowrap"
                                        }}
                                    >
                                        {notification.expDate || "-"}
                                    </Typography>
                                </TableCell>

                                <TableCell align="center" sx={bodyCellSx}>
                                    <Typography
                                        sx={{
                                            fontSize: "0.85rem",
                                            fontWeight: 650
                                        }}
                                    >
                                        {notification.daysRemaining ?? "-"}
                                    </Typography>
                                </TableCell>

                                <TableCell sx={bodyCellSx}>
                                    <Chip
                                        label={formatAlertType(notification.alertType)}
                                        color={getAlertColor(notification.alertType)}
                                        size="small"
                                        sx={{
                                            fontWeight: 700,
                                            fontSize: "0.7rem",
                                            whiteSpace: "nowrap",
                                            borderRadius: "8px"
                                        }}
                                    />
                                </TableCell>

                                <TableCell sx={bodyCellSx}>
                                    <Chip
                                        label={notification.status || "-"}
                                        color={getStatusColor(notification.status)}
                                        size="small"
                                        sx={{
                                            fontWeight: 700,
                                            fontSize: "0.7rem",
                                            whiteSpace: "nowrap",
                                            borderRadius: "8px"
                                        }}
                                    />
                                </TableCell>

                                {canDelete && (
                                    <TableCell
                                        sx={{
                                            ...bodyCellSx,
                                            minWidth: 180,
                                            maxWidth: 260
                                        }}
                                    >
                                        <Typography
                                            sx={{
                                                fontSize: "0.82rem",
                                                color: notification.remarks
                                                    ? "text.primary"
                                                    : "text.secondary",
                                                whiteSpace: "normal",
                                                overflowWrap: "anywhere",
                                                lineHeight: 1.5
                                            }}
                                        >
                                            {notification.remarks || "No remarks"}
                                        </Typography>
                                    </TableCell>
                                )}

                                {showActionColumn && (
                                    <TableCell
                                        align="center"
                                        sx={{
                                            ...bodyCellSx,
                                            minWidth: 150,
                                            width: 160,
                                            whiteSpace: "nowrap",
                                            position: "sticky",
                                            right: 0,
                                            zIndex: 1,
                                            bgcolor: "background.paper",
                                            boxShadow: "-5px 0 10px rgba(25,40,70,0.035)"
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                gap: 1,
                                                flexWrap: "nowrap"
                                            }}
                                        >
                                            {canManage &&
                                                notification.status === "ACTIVE" && (
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        onClick={() => onReview(notification)}
                                                        sx={{
                                                            minWidth: 76,
                                                            px: 1.5,
                                                            py: 0.65,
                                                            borderRadius: "10px",
                                                            textTransform: "none",
                                                            fontWeight: 700,
                                                            whiteSpace: "nowrap"
                                                        }}
                                                    >
                                                        Review
                                                    </Button>
                                                )}

                                            {canDelete &&
                                                notification.status === "RESOLVED" && (
                                                    <Button
                                                        variant="outlined"
                                                        color="error"
                                                        size="small"
                                                        startIcon={
                                                            <DeleteOutlineRoundedIcon fontSize="small" />
                                                        }
                                                        onClick={() => onDelete(notification)}
                                                        sx={{
                                                            minWidth: 88,
                                                            px: 1.25,
                                                            py: 0.65,
                                                            borderRadius: "10px",
                                                            textTransform: "none",
                                                            fontWeight: 700,
                                                            whiteSpace: "nowrap"
                                                        }}
                                                    >
                                                        Delete
                                                    </Button>
                                                )}
                                        </Box>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
}

export default NotificationTable;
