import React, {useState, useEffect} from 'react';
import {Button, Container, TextField, Typography, Box, Avatar, CircularProgress, Card} from '@mui/material';
import {useRouter} from 'next/router';
import axios from "axios";
import {env} from "@/configs/env";

export default function MomoChatPage() {
    const [step, setStep] = useState(1);
    const [message, setMessage] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = () => {
        if (!message.trim()) return;
        setLoading(true);
        setStep(2);
        axios.post(`${env.backendUrl}/api/chat`, {message}, {
            withCredentials: true,
        })
            .then(res => {
                setResponse(res.data.reply);
            })
            .catch(err => {
                console.error("Momo error:", err);
                setResponse("Momo had a moment. Try again later.");
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const reset = () => {
        setMessage('');
        setResponse('');
        setStep(1);
    };

    return (
        <Container maxWidth="sm" sx={{mt: 8, textAlign: 'center'}}>
            {step === 1 && (
                <>
                    <Avatar
                        src="/momo.webp"
                        alt="Momo"
                        sx={{width: 100, height: 100, margin: 'auto', mb: 3}}
                    />
                    <Typography variant="h5" gutterBottom>
                        Hi! What do you want to talk about today?
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        minRows={3}
                        label="Your message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        sx={{mt: 3, mb: 2}}
                    />
                    <Button variant="contained" color="primary" onClick={handleSubmit}>
                        Send to Momo
                    </Button>
                </>
            )}

            {step === 2 && (
                <>
                    <Box display="flex" alignItems="center" mb={3} justifyContent="center">
                        <Avatar src="/momo.webp" alt="Momo" sx={{width: 60, height: 60, mr: 2}}/>
                        <Typography variant="h6">Momo</Typography>
                    </Box>
                    <Card
                        sx={{
                            borderRadius: 3,
                            p: 2,
                            mb: 3,
                            fontSize: '1.1rem',
                            textAlign: 'left',
                        }}
                    >
                        {loading ? <CircularProgress size={24}/> : response}
                    </Card>
                    <Box display="flex" justifyContent="space-between">
                        <Button onClick={() => router.push('/')} color="secondary">
                            Home
                        </Button>
                        <Button onClick={reset} variant="contained">
                            Send Another
                        </Button>
                    </Box>
                </>
            )}
        </Container>
    );
}