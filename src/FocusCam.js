import "./App.css";
import React, { useRef, useEffect, useState } from "react";

import Button from "@material-ui/core/Button";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";

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
	const [distractionDuration, setDistractionDuration] = useState(0);
	const [pausedDuration, setPausedDuration] = useState(0);

	const [focusCamOn, setFocusCamOn] = useState(true);
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

					console.log("update prediction:", topPreduction);

					if (
						standby &&
						(topPrediction === "distracted" || topPrediction === "focused")
					) {
						console.log("standby OFF");
						setStandby(false);
					}

					if (topPrediction === "distracted") {
						let newDistractionCount = distractionDuration + 1;
						setDistractionDuration(newDistractionCount);
						notificationSound.play();
					}

					if (topPrediction === "paused") {
						if (pausedDuration > 5) {
							console.log("standby ON");
							setStandby(true);
						}

						let newPausedDuration = pausedDuration + 1;

						console.log(newPausedDuration);

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
	});

	return (
		<>
			<header className="App-header">
				{console.log(topPrediction)}
				<h1>FocusCam</h1>
				<p>
					You are currently{" "}
					<i>{focusCamOn ? topPrediction : "not detecting"}</i>
				</p>
				<p>You have been distracted for {distractionDuration} Seconds</p>

				<Button
					variant="contained"
					color={focusCamOn ? "secondary" : "primary"}
					onClick={() => setFocusCamOn(!focusCamOn)}
				>
					{focusCamOn ? "Turn Detection Off" : "Turn Detection On"}
				</Button>

				<p>
					A web app that tracks and helps you improv your focus using computer
					vision.
				</p>
				<div>
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
			</header>
			<Webcam
				ref={webcamRef}
				audio={false}
				mirrored={false}
				onUserMedia={() => (webcamRef.current.audio = false)}
				style={{ display: "none" }}
			/>
		</>
	);
}

export default FocusCam;
