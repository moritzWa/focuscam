import React from "react";

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
//import Button from "@material-ui/core/Button";
//import IconButton from "@material-ui/core/IconButton";
//import MenuIcon from "@material-ui/icons/Menu";

import GitHubButton from "react-github-btn";

import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
	root: {
		flexGrow: 1,
	},
	logo: {
		marginRight: theme.spacing(2),
	},
	title: {
		flexGrow: 1,
		fontSize: "17px",
	},
}));

const Navbar = () => {
	const classes = useStyles();

	return (
		<AppBar position="static">
			<Toolbar>
				<Typography
					variant="h5"
					edge="start"
					className={classes.logo}
					color="inherit"
					aria-label="menu"
				>
					FocusCam
				</Typography>
				<Typography className={classes.title}></Typography>
				<GitHubButton
					href="https://github.com/moritzWa/focuscam"
					data-size="large"
					aria-label="Star moritzWa/focuscam on GitHub"
				>
					View On Github
				</GitHubButton>
			</Toolbar>
		</AppBar>
	);
};

export default Navbar;
