import {Box, Container, Typography} from "@mui/material";

function MainLayout({children}){
    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
        }}>
            <Box sx={{
                padding: '0.5rem 0.5rem',
                width: "100%",
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "primary.dark",
                mb: '1rem',
            }}>
                <Box component='img'
                     sx={{
                    height: 50,
                    width: 50,
                }}
                     src='/android-chrome-512x512.png'
                />
                <Typography variant='h3' element='h1'>
                    Mind Mosaic
                </Typography>
            </Box>
            {children}
        </div>
    );
}

export default MainLayout;
