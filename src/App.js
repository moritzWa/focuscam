import "./App.css";
import React from "react";

import Navbar from "./Navbar.js";

import FocusCam from "./FocusCam.js";

import { createMuiTheme } from "@material-ui/core/styles";

const theme = createMuiTheme({
	palette: {
		primary: {
			main: "#00e676",
		},
		secondary: {
			main: "#ffc400",
		},
	},
});

function App() {
	return (
		<div className="App">
			<Navbar />
			<FocusCam />
		</div>
	);
}

export default App;
