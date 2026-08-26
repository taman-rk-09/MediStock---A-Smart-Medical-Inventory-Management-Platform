import {
    Box,
    Button,
    TextField
} from "@mui/material";

import AddRoundedIcon
    from "@mui/icons-material/AddRounded";


function UserToolbar({
    searchTerm,
    onSearchChange,
    onAdd
}) {

    return (

        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                mb: 3,
                flexWrap: "wrap"
            }}
        >

            <TextField
                label="Search Users"
                placeholder="Search by name, email or role..."
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={event =>
                    onSearchChange(
                        event.target.value
                    )
                }
                sx={{
                    flexGrow: 1,
                    minWidth: {
                        xs: "100%",
                        sm: 300
                    },
                    maxWidth: 500
                }}
            />


            <Button
                variant="contained"
                startIcon={
                    <AddRoundedIcon />
                }
                onClick={onAdd}
                sx={{
                    minHeight: 40,
                    px: 2.5,
                    borderRadius: 1,
                    textTransform: "none",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    flexShrink: 0
                }}
            >
                Add User
            </Button>

        </Box>

    );

}


export default UserToolbar;