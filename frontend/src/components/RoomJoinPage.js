import React, { Component, useState } from "react";
import { TextField, Button, Grid, Typography } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";

export default function RoomJoinPage(props) {
    const navigate = useNavigate();
    const [roomState, setRoomState] = useState({ roomCode: "", error: "" });

    const handleTextFieldChange = (e) => {
        setRoomState({
            ...roomState, // spread over room state and get current values
            roomCode: e.target.value,
        });
    };
    const handleRoomButtonPressed = () => {
        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                code: roomState.roomCode,
            }),
        };
        fetch("/api/join-room", requestOptions)
            .then((response) => {
                if (response.ok) {
                    navigate("/room/" + roomState.roomCode);
                } else {
                    setRoomState({
                        ...roomState,
                        error: "Room Not Found.",
                    });
                }
            })
            .catch((error) => {
                console.log(error);
            });
    };
    return (
        <Grid container spacing={1}>
            <Grid item xs={12} align="center">
                <Typography variant="h4" component="h4">
                    Join a Room
                </Typography>
            </Grid>
            <Grid item xs={12} align="center">
                <TextField
                    error={!!roomState.error} // error prop here must be a boolean
                    label="Code"
                    placeholder="Enter a Room Code"
                    value={roomState.roomCode}
                    helperText={roomState.error}
                    variant="outlined"
                    onChange={handleTextFieldChange}
                />
            </Grid>

            <Grid item xs={12} align="center">
                <Button
                    variant="contained"
                    color="primary"
                    to="/"
                    onClick={handleRoomButtonPressed}
                >
                    Enter Room
                </Button>
            </Grid>
            <Grid item xs={12} align="center">
                <Button
                    variant="contained"
                    color="secondary"
                    to="/"
                    component={Link}
                >
                    Back
                </Button>
            </Grid>
        </Grid>
    );
}
