import "./App.css";
import React, { useRef, useEffect, useState, useCallback } from "react";

import {
	Switch,
	Button,
	InputLabel,
	MenuItem,
	Select,
	Typography,
	Card,
	CardContent,
	Grid,
	Slider,
} from "@material-ui/core";

import VolumeDown from "@material-ui/icons/VolumeDown";
import VolumeUp from "@material-ui/icons/VolumeUp";

import juntos_sound from "./resources/juntos-607.mp3";

import Webcam from "react-webcam";
import {
	calculatePredsAverage,
	getMaxClassName,
	takeSnapshot,
	models,
} from "./utilities";

function FocusCam() {
	const defaultMonitorSetup = 1;

	const [monitorSetup, setMonitorSetup] = useState(models[defaultMonitorSetup]);
	const [topPrediction, setTopPrediction] = useState("detecting...");
	const [distractionDuration, setDistractionDuration] = useState(null);
	const [pausedDuration, setPausedDuration] = useState(0);

	const [focusCamOn, setFocusCamOn] = useState(false);
	const [sound, setSound] = useState(false);
	const [standby, setStandby] = useState(false);
	const [volume, setVolume] = React.useState(30);

	const webcamRef = useRef(null);

	const notificationSound = useCallback(() => {
		new Audio(juntos_sound);
	}, []);

	notificationSound.volume = volume / 100;

	/* navigator.mediaDevices
		.enumerateDevices()
		.then((devices) =>
			console.log(devices.InputDeviceInfo ? devices.InputDeviceInfo.kind : null)
		); */

	useEffect(() => {
		let stackSize = 0;
		let attached = true;

		async function run() {
			const video = webcamRef.current?.video;

			if (
				video?.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA &&
				focusCamOn
			) {
				await takeSnapshot(monitorSetup.name, video);

				if (stackSize++ >= 50) {
					let topPreduction = getMaxClassName(calculatePredsAverage());
					setTopPrediction(topPreduction);
					if (
						standby &&
						(topPrediction === "distracted" || topPrediction === "focused")
					) {
						setStandby(false);
					}

					if (topPrediction === "distracted") {
						let newDistractionCount = distractionDuration + 1;
						console.log("new", newDistractionCount);

						setDistractionDuration(newDistractionCount);
						if (sound) return notificationSound.play();
					}

					if (topPrediction === "paused") {
						if (pausedDuration > 5) {
							setStandby(true);
						}

						let newPausedDuration = pausedDuration + 1;
						setPausedDuration(newPausedDuration);
					}

					stackSize = 0;
				}

				// pause 10ms or 30s untill next snapshot
				if (attached) {
					setTimeout(run, standby ? 1800 : 10);
				}
			} else {
				if (attached) {
					// try to run again after waiting
					setTimeout(run, 5000);
				}
			}
		}

		run();

		return () => (attached = false);
	}, [
		focusCamOn,
		distractionDuration,
		topPrediction,
		monitorSetup.name,
		standby,
		sound,
		pausedDuration,
		notificationSound,
	]);

	return (
		<>
			<div className="header">
				<div className="header__left">
					<div>
						<Typography variant="h1" gutterBottom>
							💡 FocusCam
						</Typography>
						<Typography variant="h4" gutterBottom>
							A web app that helps you improve your focus using computer vision.
						</Typography>
					</div>

					<div className="header__left__bottom">
						<div className="header__left__bottom__metrics">
							<Typography variant="h6">
								You are currently{" "}
								<i>{focusCamOn ? topPrediction : "not detecting"}</i>
							</Typography>
							<Typography variant="h6">
								You have been distracted for{" "}
								{distractionDuration ? distractionDuration : "0"} Seconds
							</Typography>
						</div>
						<Button
							size="large"
							className="btn-xl"
							variant="contained"
							color={focusCamOn ? "secondary" : "primary"}
							onClick={() => setFocusCamOn(!focusCamOn)}
						>
							{focusCamOn ? "Turn Detection Off" : "Turn Detection On"}
						</Button>
					</div>
				</div>

				<div className="header__right">
					<div className="cam__container">
						<div
							className={
								focusCamOn ? "cam__overlay cam__overlay-" + topPrediction : null
							}
						></div>
						<Webcam
							className="cam"
							ref={webcamRef}
							audio={false}
							mirrored={false}
							onUserMedia={() => (webcamRef.current.audio = false)}
						/>
					</div>
				</div>
			</div>

			<div className="content">
				<Card>
					<CardContent>
						<Typography variant="h4" gutterBottom>
							Settings
						</Typography>
						<div className="settings__item">
							<Typography gutterBottom>
								{" "}
								Choose your Monitor and Webcam Setup
							</Typography>
							<InputLabel id="demo-simple-select-label"></InputLabel>

							<Select
								labelId="Monitor Setup Name"
								id="demo-simple-select"
								value={monitorSetup.name}
								onChange={(e) =>
									setMonitorSetup(
										models.find((value) => value.name === e.target.value)
									)
								}
							>
								<MenuItem value="laptop">Laptop Webcam</MenuItem>
								<MenuItem value="external">
									Laptop Webcam with external Monitor
								</MenuItem>
							</Select>
						</div>

						<div className="settings__item">
							<Typography gutterBottom>Distraction Notification</Typography>
							<Switch
								checked={sound}
								onChange={() => setSound(!sound)}
								name=""
								inputProps={{ "aria-label": "secondary checkbox" }}
							/>
						</div>

						<div className="settings__item">
							<Typography id="continuous-slider" gutterBottom>
								Volume
							</Typography>
							<Grid container spacing={2}>
								<Grid item>
									<VolumeDown />
								</Grid>
								<Grid item xs>
									<Slider
										value={volume}
										onChange={(event, volume) => setVolume(volume)}
										aria-labelledby="continuous-slider"
									/>
								</Grid>
								<Grid item>
									<VolumeUp />
								</Grid>
							</Grid>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent>
						<Typography variant="h4" gutterBottom>
							About
						</Typography>
						<Typography variant="body1">
							This app was build using{" "}
							<a href="https://www.tensorflow.org/js" target="blank_">
								Tensorflow.js
							</a>
							. As a next step I plan to replace the model with the{" "}
							<a
								href="https://google.github.io/mediapipe/solutions/iris"
								target="blank_"
							>
								MediaPipe Iris model
							</a>{" "}
							presented in the paper{" "}
							<a href="https://arxiv.org/pdf/2006.11341.pdf" target="blank_">
								Real-time Pupil Tracking from Monocular Video for Digital
								Puppetry
							</a>{" "}
							last june.
						</Typography>
					</CardContent>
				</Card>
			</div>
		</>
	);
}

export default FocusCam;
