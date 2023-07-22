import React, { Component, useState, useEffect } from "react";
import RoomJoinPage from "./RoomJoinPage";
import CreateRoomPage from "./CreateRoomPage";
import Room from "./Room";
import { Grid, Button, ButtonGroup, Typography } from "@mui/material";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Link,
    Redirect,
    Navigate,
    useNavigate,
} from "react-router-dom";

export default function HomePage(props) {
    const [roomState, setRoomState] = useState({ roomCode: null });

    useEffect(() => {
        async function checkUserInRoom() {
            fetch("/api/user-in-room") // fetch response from user-in-room view
                .then((response) => response.json())
                .then((data) => {
                    setRoomState({
                        roomCode: data.code,
                    });
                    // if there is no room code, then this just updates code to null again
                });
        }
        checkUserInRoom();
    }, []);

    // function to clear the room code, use when host leaves room
    const clearRoomCode = () => {
        setRoomState({
            roomCode: null,
        });
    };

    const renderHomePage = () => {
        if (roomState.roomCode) {
            return (
                <Navigate to={`/room/${roomState.roomCode}`} replace={true} />
            );
        } else {
            return (
                <Grid container spacing={3}>
                    <Grid item xs={12} align="center">
                        <Typography variant="h3" compact="h3">
                            House Party
                        </Typography>
                    </Grid>
                    <Grid item xs={12} align="center">
                        <ButtonGroup
                            disableElevation
                            variant="contained"
                            color="primary"
                        >
                            <Button color="primary" to="/join" component={Link}>
                                Join a Room
                            </Button>
                            <Button
                                color="secondary"
                                to="/create"
                                component={Link}
                            >
                                Create a Room
                            </Button>
                        </ButtonGroup>
                    </Grid>
                </Grid>
            );
        }
    };

    return (
        <Router>
            <Routes>
                <Route exact path="/" element={renderHomePage()} />
                <Route path="/join" element={<RoomJoinPage />} />
                <Route path="/create" element={<CreateRoomPage />} />
                <Route
                    path="/room/:roomCode"
                    element={<Room leaveRoomCallback={clearRoomCode} />}
                />
            </Routes>
        </Router>
    );
}
