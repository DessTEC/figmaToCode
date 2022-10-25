import React, {useState} from 'react';
import '../styles/ui.css';
import '../styles/tag.css';

// ---- UI MATERIAL IMPORTS
/* ----*/ import Typography from '@mui/material/Typography';
/* ----*/ import {Grid} from '@mui/material';
/* ----*/ import Box from '@mui/material/Box';
/* ----*/ import {Card} from '@mui/material';

const TagTab = ({}) => {
    const [number, setNumber] = useState(0);

    const changeNumber = (passedNumber: number) => {
        setNumber(passedNumber);
    };

    return (
        <div className="TagDiv">
            <Box
                sx={{
                    textAlign: 'left',
                }}
            >
                <Typography variant="p">Manual tags</Typography>
            </Box>

            <Grid container rowSpacing={1} columnSpacing={{xs: 1, sm: 2, md: 3}}>
                <Grid item xs={3}>
                    <Card className="cardTag">1</Card>
                </Grid>
                <Grid item xs={3}>
                    <Card>2</Card>
                </Grid>
                <Grid item xs={3}>
                    <Card>3</Card>
                </Grid>
                <Grid item xs={3}>
                    <Card>4</Card>
                </Grid>
                <Grid item xs={3}>
                    <Card>5</Card>
                </Grid>
                <Grid item xs={3}>
                    <Card>6</Card>
                </Grid>
                <Grid item xs={3}>
                    <Card>7</Card>
                </Grid>
                <Grid item xs={3}>
                    <Card>8</Card>
                </Grid>
            </Grid>
        </div>
    );
};

export default TagTab;
