import {Card} from "@mui/material";

function EmotionalFeedback({feedback}){
    return (
        <Card sx={{m: '1rem', p: '0.5rem'}}>
            {feedback}
        </Card>
    );
}

export default EmotionalFeedback;
