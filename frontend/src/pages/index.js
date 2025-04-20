import EmotionsGraph from "@/components/graphs/EmotionsGraph";
import {Container, Typography} from "@mui/material";
import * as React from "react";
import EmotionalFeedback from "@/components/EmotionalFeedback";
import AddEntryButton from "@/components/AddEntryButton";
import TalkToMomoButton from "@/components/TalkToMomoButton";
import {useEffect} from "react";
import {env} from "@/configs/env";
import axios from "axios";

function index() {
    const [feedback, setFeedback] = React.useState('');

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

    useEffect(()=>{
        async function myFunction(){
            const response = await axios.get(`${env.backendUrl}/api/journal/analysis-summary`)
            setFeedback(response.data.summary);
        }

        myFunction();
    }, [])

    return (
        <Container maxWidth="md" sx={{
        }}>

            <Typography variant='h3' component='h1'>
                Good Morning!
            </Typography>
            <EmotionalFeedback feedback={ feedback || '...loading...'}/>

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
