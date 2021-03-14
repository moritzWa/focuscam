import "./App.css";
import React from "react";

import Navbar from "./Navbar.js";

import FocusCam from "./FocusCam.js";

import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";

const theme = createMuiTheme({
	palette: {
		primary: {
			main: "#009688",
		},
		secondary: {
			main: "#f73378",
		},
	},
});

function App() {
	return (
		<div className="App">
			<ThemeProvider theme={theme}>
				<Navbar />
				<FocusCam />
			</ThemeProvider>
		</div>
	);
}

export default App;
