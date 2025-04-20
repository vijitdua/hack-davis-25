import * as React from 'react';
import {LineChart} from '@mui/x-charts';
import {Card, Typography} from "@mui/material";

// todo: add a future promotion thing
export default function EmotionsGraph({past, future}) {
    const moodLabels = ['😢', '🙁', '😐', '🙂', '😄'];

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
