import React, { useState, Component } from "react";
import {
    Grid,
    Typography,
    Button,
    TextField,
    FormHelperText,
    FormControl,
    Radio,
    RadioGroup,
    FormControlLabel,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";

// export default class CreateRoomPage extends Component {
//     defaultVotes = 2;
//     constructor(props) {
//         super(props);
//         this.state = {
//             guestCanPause: true,
//             votesToSkip: this.defaultVotes,
//         };

//         // bind method to the class so that it has access to 'this' keyword
//         this.handleVotesChange = this.handleVotesChange.bind(this);
//         this.handleGuestCanPauseChange =
//             this.handleGuestCanPauseChange.bind(this);
//         this.handleRoomButtonPressed = this.handleRoomButtonPressed.bind(this);
//     }

//     handleVotesChange(e) {
//         this.setState({
//             votesToSkip: e.target.value,
//         });
//     }
//     handleGuestCanPauseChange(e) {
//         // if value is true, then set as true. otherwise, set as false
//         this.setState({
//             guestCanPause: e.target.value === "true" ? true : false,
//         });
//     }
//     handleRoomButtonPressed() {
//         // post request json payload
//         const requestOptions = {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//                 votes_to_skip: this.state.votesToSkip, // field names must match the ones in views.py
//                 guest_can_pause: this.state.guestCanPause,
//             }),
//         };
//         // send to api endpoint
//         fetch("/api/create-room", requestOptions)
//             .then((response) => response.json()) // convert response to json object
//             .then((data) => this.props.history.push("/room/" + data.code)); // redirect to the new room url
//         // this pulls the code from the json response data
//     }
export default function CreateRoomPage(props) {
    const navigate = useNavigate();

    const [defaultVotes, setdefaultVotes] = useState(2);
    const [guestCanPause, setguestCanPause] = useState(true);
    const [votesToSkip, setgvotesToSkip] = useState(defaultVotes);

    const handleVotesChange = (e) => {
        setgvotesToSkip(e.target.value);
    };

    const handleGuestCanPauseChange = (e) => {
        setguestCanPause(e.target.value === "true" ? true : false);
    };

    const handleRoomButtonPressed = () => {
        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                votes_to_skip: votesToSkip,
                guest_can_pause: guestCanPause,
            }),
        };
        fetch("/api/create-room", requestOptions)
            .then((response) => response.json())
            .then((data) => navigate("/room/" + data.code));
    };

    // render() {
    return (
        <Grid container spacing={1}>
            <Grid item xs={12} align="center">
                {/* max width for item is 12 */}
                <Typography component="h4" variant="h4">
                    Create A Room
                </Typography>
            </Grid>

            <Grid item xs={12} align="center">
                <FormControl component="fieldset">
                    <FormHelperText component="div">
                        <div align="center">
                            Guest Control of Playback State
                        </div>
                    </FormHelperText>
                    <RadioGroup
                        row
                        defaultValue="true"
                        // when this is changed, call handler function for changing value
                        onChange={handleGuestCanPauseChange}
                    >
                        <FormControlLabel
                            value="true"
                            control={<Radio color="primary" />}
                            label="Play/Pause"
                            labelPlacement="bottom"
                        ></FormControlLabel>
                        <FormControlLabel
                            value="false"
                            control={<Radio color="secondary" />}
                            label="No Control"
                            labelPlacement="bottom"
                        ></FormControlLabel>
                    </RadioGroup>
                </FormControl>
            </Grid>
            <Grid item xs={12} align="center">
                <FormControl>
                    <FormHelperText component="div">
                        <div align="center">Votes Required To Skip Song</div>
                    </FormHelperText>
                    <TextField
                        required={true}
                        type="number"
                        defaultValue={defaultVotes}
                        inputProps={{
                            min: 1,
                            style: { textAlign: "center" },
                        }}
                        onChange={handleVotesChange}
                    />
                </FormControl>
            </Grid>
            <Grid item xs={12} align="center">
                <Button
                    color="primary"
                    variant="contained"
                    onClick={handleRoomButtonPressed}
                >
                    Create A Room
                </Button>
            </Grid>
            <Grid item xs={12} align="center">
                <Button
                    color="secondary"
                    variant="contained"
                    to="/"
                    component={Link}
                >
                    Back
                </Button>
            </Grid>
        </Grid>
    );
}
// }
