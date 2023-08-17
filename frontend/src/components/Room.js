import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Grid, Button, Typography } from "@mui/material";
import CreateRoomPage from "./CreateRoomPage";
import MusicPlayer from "./MusicPlayer";

export default function Room(props) {
    const navigate = useNavigate();
    const [roomData, setRoomData] = useState({
        votesToSkip: 2,
        guestCanPause: "false",
        isHost: false,
        showSettings: false,
    });
    const [song, setSong] = useState({});
    const { roomCode } = useParams();

    // this is equivalent to getRoomDetails()
    useEffect(() => {
        getRoomDetails();
    }, [roomCode, setRoomData]); //It renders when the object changes .If we use roomData and/or roomCode then it rerenders infinite times

    const authenticateSpotify = () => {
        fetch("/spotify/is-authenticated")
            .then((response) => response.json())
            .then((data) => {
                if (!data.status) {
                    fetch("/spotify/get-auth-url")
                        .then((response) => response.json())
                        .then((data) => {
                            // redirect to spotify authentication page
                            window.location.replace(data.url);
                        });
                }
            });
    };

    const getCurrentSong = () => {
        fetch("/spotify/current-song")
            .then((response) => {
                if (!response.ok) {
                    return {};
                } else {
                    return response.json();
                }
            })
            .then((data) => {
                setSong(data);
                console.log(data);
            });
    };

    const leaveButtonPressed = (e) => {
        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        };
        fetch("/api/leave-room", requestOptions).then((response) => {
            if (response.ok) {
                props.leaveRoomCallback();
                navigate("/");
            }
        });
    };

    const updateShowSettings = (value) => {
        setRoomData({
            ...roomData,
            showSettings: value,
        });
    };

    const renderSettingsButton = () => {
        return (
            <Grid item xs={12} align="center">
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => updateShowSettings(true)}
                >
                    Settings
                </Button>
            </Grid>
        );
    };

    const renderSettings = () => {
        return (
            <Grid container spacing={1}>
                <Grid item xs={12} align="center">
                    <CreateRoomPage
                        update={true}
                        votesToSkip={roomData.votesToSkip}
                        guestCanPause={roomData.guestCanPause.toString()}
                        roomCode={roomCode}
                        updateCallback={getRoomDetails}
                    ></CreateRoomPage>
                </Grid>
                <Grid item xs={12} align="center">
                    <Button
                        color="secondary"
                        variant="contained"
                        onClick={() => updateShowSettings(false)} // close button sets showsettings to false
                    >
                        Close
                    </Button>
                </Grid>
            </Grid>
        );
    };

    function getRoomDetails() {
        fetch("/api/get-room" + "?code=" + roomCode)
            .then((response) => {
                if (!response.ok) {
                    // if loading a room that doesnt exist:
                    props.leaveRoomCallback();
                    navigate("/");
                }
                return response.json();
            })
            .then((data) => {
                setRoomData({
                    ...roomData,
                    votesToSkip: data.votes_to_skip,
                    guestCanPause: data.guest_can_pause,
                    isHost: data.is_host,
                });
                if (data.is_host) {
                    console.log(roomData);
                    console.log("authenticating...");
                    authenticateSpotify();
                }
            });
    }

    if (roomData.showSettings) {
        return renderSettings();
    }

    getCurrentSong();
    return (
        <Grid container spacing={1}>
            <Grid item xs={12} align="center">
                <Typography variant="h4" component="h4">
                    Code: {roomCode}
                </Typography>
            </Grid>
            <Grid item xs={12} align="center">
                <Typography variant="h6" component="h6">
                    Votes: {roomData.votesToSkip.toString()}
                </Typography>
            </Grid>
            <Grid item xs={12} align="center">
                <Typography variant="h6" component="h6">
                    Guest Can Pause: {roomData.guestCanPause.toString()}
                </Typography>
            </Grid>

            <Grid item xs={12} align="center">
                <MusicPlayer {...{ ...song }}></MusicPlayer>
            </Grid>

            {roomData.isHost ? renderSettingsButton() : null}
            <Grid item xs={12} align="center">
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={leaveButtonPressed}
                >
                    Leave Room
                </Button>
            </Grid>
        </Grid>
    );
}
