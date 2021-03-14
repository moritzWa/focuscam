import "./App.css";
import React, { useRef, useEffect, useState } from "react";

import {
	Switch,
	Button,
	InputLabel,
	MenuItem,
	Select,
	Typography,
	Card,
	CardContent,
} from "@material-ui/core";

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
	const [sound, setSound] = useState(false);

	const [focusCamOn, setFocusCamOn] = useState(false);
	const [standby, setStandby] = useState(false);

	const webcamRef = useRef(null);
	const notificationSound = new Audio(juntos_sound);

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
		notificationSound,
		pausedDuration,
	]);

	return (
		<>
			<div className="header">
				<div className="header__left">
					<div>
						<Typography variant="h1" gutterBottom>
							FocusCam
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
							<InputLabel id="demo-simple-select-label">
								Choose your Monitor Setup
							</InputLabel>
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
							<InputLabel id="demo-simple-select-label">
								Distraction Notification
							</InputLabel>
							<Switch
								checked={sound}
								onChange={() => setSound(!sound)}
								name=""
								inputProps={{ "aria-label": "secondary checkbox" }}
							/>
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
							.
						</Typography>
					</CardContent>
				</Card>
			</div>
		</>
	);
}

export default FocusCam;
