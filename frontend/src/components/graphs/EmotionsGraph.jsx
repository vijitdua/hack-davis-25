import * as React from 'react';
import {LineChart} from '@mui/x-charts';
import {Card, Typography} from "@mui/material";
import {env} from "@/configs/env";
import {useEffect, useState} from "react";
import axios from "axios";

export default function EmotionsGraph({}) {
    const [past, setPast] = useState([]);
    const [future, setFuture] = useState([]);

    const moodLabels = ['😢', '🙁', '😐', '🙂', '😄'];

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await axios.get(`${env.backendUrl}/api/journal/summary`);
                const formatted = res.data.map(entry => ({
                    day: new Date(entry.day).toLocaleDateString('en-US', { weekday: 'short' }),
                    mood: (Number(entry["overall_emotion_score"]) || 3) - 1,
                }));
                console.log(formatted);
                setPast(formatted);
            } catch (err) {
                console.error("Error fetching journal summary:", err);
            }
        }

        const getFuturePredictions = async () => {
            try {
                const res = await axios.get(`${env.backendUrl}/api/journal/predict`);
                const formatted =  res.data.map(entry => ({
                    day: new Date(entry.day).toLocaleDateString('en-US', { weekday: 'short' }),
                    mood: (Number(entry['predicted_emotion_score']) || 3) -1,
                }));
                console.log(formatted);
                setFuture(formatted);
            } catch (err) {
                console.error("Error fetching future predictions:", err);
            }
        };

        fetchData();
        getFuturePredictions();
    }, []);

    const fullData = [...past, ...future];

    return (
        <Card sx={{m: '1rem'}}>
            <LineChart
                height={300}
                series={[{
                    data: fullData.map(d => d.mood),
                    showMark: true, // makes data points visible
                    valueFormatter: () => null, // disables tooltip on hover
                }]}
                xAxis={[
                    {
                        scaleType: 'point',
                        data: fullData.map(d => d.day),
                        position: 'top',
                    }
                ]}
                yAxis={[
                    {
                        min: 0,
                        max: 4,
                        tickMinStep: 1,
                        valueFormatter: v => moodLabels[Math.round(v)] || '',
                    }
                ]}
                sx={{
                    // Hide axis lines and ticks
                    '.MuiChartsAxis-line': {display: 'none'},
                    '.MuiChartsAxis-tick': {display: 'none'},

                    // Bigger emoji Y-axis values
                    '.MuiChartsAxis-left .MuiChartsAxis-tickLabel': {
                        fontSize: '32px',
                        lineHeight: 1.2,
                    },

                    // Bigger X-axis text
                    '.MuiChartsAxis-bottom .MuiChartsAxis-tickLabel': {
                        fontSize: '18px',
                        fontWeight: 500,
                    },

                    // Optional: axis label/title
                    '.MuiChartsAxis-label': {
                        fontSize: 18,
                        fontWeight: 600,
                    },

                    // Larger dots
                    '.MuiLineElement-mark': {
                        r: 6,
                    },
                }}
            />
        </Card>
    );
}
