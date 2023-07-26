// import { touchRippleClasses } from "@mui/material";
// import React, { Component } from "react";
// import { useParams } from "react-router-dom";

// export default class Room extends Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//             votesToSkip: 2,
//             guestCanPause: false,
//             isHost: false,
//         };
//         // props.match stores information of how we get this element from react router
//         // we get roomCode from the url, format specified in HomePage.js
//         // this.roomCode = this.props.match.params.roomCode;
//         const { roomCode } = useParams();
//     }

//     render() {
//         return (
//             <div>
//                 <h3>{roomCode}</h3>
//                 <p>Votes: {this.state.votesToSkip}</p>
//                 <p>Guest Can Pause: {this.state.guestCanPause}</p>
//                 <p>Host: {this.state.isHost}</p>
//             </div>
//         );
//     }
// }

import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Grid, Button, Typography } from "@mui/material";
import CreateRoomPage from "./CreateRoomPage";

export default function Room(props) {
    const navigate = useNavigate();
    const [roomData, setRoomData] = useState({
        votesToSkip: 2,
        guestCanPause: "false",
        isHost: false,
        showSettings: false,
    });
    const { roomCode } = useParams();

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
            });
    }
    // this is equivalent to getRoomDetails()
    useEffect(() => {
        getRoomDetails();
    }, [roomCode]); //It renders when the object changes .If we use roomData and/or roomCode then it rerenders infinite times

    if (roomData.showSettings) {
        return renderSettings();
    }
    return (
        <Grid container spacing={1}>
            <Grid item xs={12} align="center">
                <Typography variant="h4" component="h4">
                    Code: {roomCode}
                </Typography>
            </Grid>
            <Grid item xs={12} align="center">
                <Typography variant="h6" component="h6">
                    Votes: {roomData.votesToSkip}
                </Typography>
            </Grid>
            <Grid item xs={12} align="center">
                <Typography variant="h6" component="h6">
                    Guest Can Pause: {roomData.guestCanPause.toString()}
                </Typography>
            </Grid>
            <Grid item xs={12} align="center">
                <Typography variant="h6" component="h6">
                    Host: {roomData.isHost.toString()}
                </Typography>
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
