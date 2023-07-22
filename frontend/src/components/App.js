import React, { Component } from "react";
import { render } from "react-dom";
import HomePage from "./HomePage";
import RoomJoinPage from "./RoomJoinPage";
import CreateRoomPage from "./CreateRoomPage";

// entry point for app is this component: (usually called App)
export default class App extends Component {
    constructor(props) {
        super(props);
    }

    // this returns the actual html content to be displayed on the page
    render() {
        return (
            // center the entire app
            <div className="center">
                <HomePage />
            </div>
        );
    }
}

const appDiv = document.getElementById("app");

// render App component inside of appDiv section from index.html
render(<App />, appDiv);
