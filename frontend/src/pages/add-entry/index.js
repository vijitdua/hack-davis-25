import {useState} from "react";
import {Box, Button, Typography, TextField, Slider, Chip, CircularProgress} from "@mui/material";
import axios from "axios";

const moodData = [
    {label: "😢", value: 0, name: "Really Unpleasant", flower: "wilted-rose.png"},
    {label: "🙁", value: 1, name: "Slightly Unpleasant", flower: "dropping-daisy.webp"},
    {label: "😐", value: 2, name: "Neutral", flower: "simple-tulip.webp"},
    {label: "🙂", value: 3, name: "Happy", flower: "sunflower.png"},
    {label: "😄", value: 4, name: "Really Happy", flower: "cherry-blossom.webp"},
];

const impactingFactors = [
    "Family", "Friends", "Work", "School", "Romantic Partner", "Health", "Finances",
    "Sleep", "Exercise", "Diet", "Social Media", "Environment", "Alone Time",
    "Productivity", "Weather", "Spirituality", "Hobbies", "Personal Growth",
];

export default function Index() {
    const [step, setStep] = useState(0);
    const [mood, setMood] = useState(2);
    const [factors, setFactors] = useState([]);
    const [entry, setEntry] = useState("");
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const response = await axios.post("/api/log-entry", {
                mood,
                factors,
                entry,
            });
            setFeedback(response.data.feedback || "Thanks for sharing! 🌱");
            setStep(3);
        } catch (e) {
            setFeedback("Something went wrong. Please try again later.");
            setStep(3);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box p={4} display="flex" flexDirection="column" alignItems="center">
            {step === 0 && (
                <>
                    <Typography variant="h5" mb={2}>How are you feeling?</Typography>
                    <Box sx={{
                        display: "flex",
                        flexDirection: "row",
                    }}>
                        <Slider
                            orientation="vertical"
                            min={0}
                            max={4}
                            step={1}
                            value={mood}
                            onChange={(e, val) => setMood(val)}
                            marks={moodData.map(m => ({value: m.value, label: m.label}))}
                            sx={{
                                height: 250,
                            }}
                        />
                        <Box display="flex" flexDirection="column" alignItems="center">
                            <Typography mt={2}>{moodData[mood].name}</Typography>
                            <img
                                src={`/flowers/${moodData[mood].flower}`}
                                alt={moodData[mood].flower}
                                style={{width: 180, height: 180, transition: "all 0.4s ease"}}
                            />
                        </Box>
                    </Box>
                    <Button onClick={() => setStep(1)} sx={{mt: 3}} variant="contained">Next</Button>
                </>
            )}

            {step === 1 && (
                <>
                    <Typography variant="h6" mb={2}>What factors influenced your mood?</Typography>
                    <Box display="flex" flexWrap="wrap" gap={1} justifyContent="center">
                        {impactingFactors.map(factor => (
                            <Chip
                                key={factor}
                                label={factor}
                                onClick={() =>
                                    setFactors(factors.includes(factor)
                                        ? factors.filter(f => f !== factor)
                                        : [...factors, factor])}
                                color={factors.includes(factor) ? "primary" : "default"}
                                clickable
                            />
                        ))}
                    </Box>
                    <Button onClick={() => setStep(2)} sx={{mt: 3}} variant="contained">Next</Button>
                </>
            )}

            {step === 2 && (
                <>
                    <Typography variant="h6" mb={2}>Describe your emotions and thoughts</Typography>
                    <TextField
                        multiline
                        minRows={4}
                        maxRows={8}
                        fullWidth
                        value={entry}
                        onChange={(e) => setEntry(e.target.value)}
                        placeholder="Write anything you'd like to reflect on..."
                    />
                    <Button onClick={handleSubmit} sx={{mt: 3}} variant="contained" disabled={loading}>
                        {loading ? <CircularProgress size={24}/> : "Submit"}
                    </Button>
                </>
            )}

            {step === 3 && (
                <>
                    <Typography variant="h5" textAlign="center" mb={2}>{feedback}</Typography>
                    <Button onClick={() => window.location.href = "/"} variant="outlined">Close</Button>
                </>
            )}
        </Box>
    );
}
