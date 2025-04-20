import EmotionsGraph from "@/components/graphs/EmotionsGraph";
import {Container, Typography} from "@mui/material";
import * as React from "react";
import EmotionalFeedback from "@/components/EmotionalFeedback";
import AddEntryButton from "@/components/AddEntryButton";
import TalkToMomoButton from "@/components/TalkToMomoButton";

function index() {
    const past = [
        {day: 'Mon', mood: 4},
        {day: 'Tue', mood: 2},
        {day: 'Wed', mood: 1.5},
        {day: 'Thu', mood: 0.5},
        {day: 'Fri', mood: 1}, // current day
    ];

    const next = [
        {day: 'Sat', mood: 2},
        {day: 'Sun', mood: 3},
    ];

    return (
        <Container maxWidth="md" sx={{
        }}>

            <Typography variant='h3' component='h1'>
                Good Morning User!
            </Typography>
            <EmotionalFeedback feedback={'Ur cool boi u got this boi (replace this with legit feedback later boi)'}/>

            <Typography variant='h3' component='h1'>
                Your Mood Recently
            </Typography>
            <EmotionsGraph future={next} past={past} />

            <TalkToMomoButton/>
            <AddEntryButton/>

        </Container>
    );
}

export default index;
