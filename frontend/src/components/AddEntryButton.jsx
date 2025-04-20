import React, { useRef, useEffect, useState } from "react";
import { Fab } from "@mui/material";
import CreateIcon from '@mui/icons-material/Create';
import {useRouter} from "next/router";

function AddEntryButton() {
    const router = useRouter();
    const parentRef = useRef(null); // Reference to the parent container
    const [rightOffset, setRightOffset] = useState("1rem"); // Default offset

    const handleOpenDialog = async () => {
        await router.push('/add-entry');
    };

    useEffect(() => {
        const updateRightOffset = () => {
            if (parentRef.current) {
                // Calculate the distance between parent right edge and viewport right edge
                const parentRect = parentRef.current.getBoundingClientRect();
                const viewportWidth = window.innerWidth;
                const offset = Math.max(viewportWidth - parentRect.right + 2, 2); // Add padding
                setRightOffset(`${offset}px`);
            }
        };

        // Update on mount and on window resize
        updateRightOffset();
        window.addEventListener("resize", updateRightOffset);

        return () => {
            window.removeEventListener("resize", updateRightOffset);
        };
    }, []);

    return (
        <div ref={parentRef} style={{ position: "relative" }}>
            <Fab
                color="primary"
                aria-label="compose"
                onClick={handleOpenDialog}
                sx={{
                    position: "fixed", // Fixed at the bottom of the viewport
                    bottom: "5rem",   // Always 2rem from the bottom of the viewport
                    right: rightOffset, // Dynamically calculated right offset
                    zIndex: 10,       // Ensure it stays above other content
                }}
            >
                <CreateIcon />
            </Fab>
        </div>
    );
}

export default AddEntryButton;
