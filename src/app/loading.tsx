"use client";

import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

const Loading = () => {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                width: "100%",
                bgcolor: "background.default",
            }}
        >
            <CircularProgress
                size={60}
                thickness={4}
                sx={{
                    color: "primary.main",
                    mb: 2
                }}
            />
        </Box>
    );
};

export default Loading;