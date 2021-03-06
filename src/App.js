import "./App.css";
import React, { useRef, useEffect, useState } from "react";

import juntos_sound from "./resources/juntos-607.mp3";

import Webcam from "react-webcam";
import {
	calculatePredsAverage,
	getMaxClassName,
	takeSnapshot,
	models,
} from "./utilities";

function App() {
	const [monitorSetup, setMonitorSetup] = useState(models[0]);
	const [topPrediction, setTopPrediction] = useState("detecting...");
	const [distractionDuration, setDistractionDuration] = useState(0);

	const webcamRef = useRef(null);
	const notificationSound = new Audio(juntos_sound);

	useEffect(() => {
		let stackSize = 0;
		let attached = true;

		async function run() {
			const video = webcamRef.current?.video;

			if (video?.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA) {
				await takeSnapshot(monitorSetup.name, video);

				if (stackSize++ >= 50) {
					console.log("update prediction");

					let topPreduction = getMaxClassName(calculatePredsAverage());
					setTopPrediction(topPreduction);

					if (topPrediction === "distracted") {
						let newDistractionCount = distractionDuration + 1;
						setDistractionDuration(newDistractionCount);
						notificationSound.play();
					}

					stackSize = 0;
				}

				//pause 1/100 of a secold untill next snapshot
				if (attached) {
					setTimeout(run, 10);
				}
			} else {
				if (attached) {
					// try to run again after waiting
					setTimeout(run, 10);
				}
			}
		}

		run();

		return () => (attached = false);
	});

	return (
		<div className="App">
			<header className="App-header">
				<h1>Focuscam = {topPrediction}</h1>

				<h2>You have been distracted for {distractionDuration} Seconds</h2>

				<p>
					A web app that tracks and helps you improv your focus using computer
					vision.
				</p>
				<div>
					Choose your Monitor Setup:
					<select
						value={monitorSetup.name}
						onChange={(e) =>
							setMonitorSetup(
								models.find((value) => value.name === e.currentTarget.value)
							)
						}
					>
						<option value="laptop">Laptop Webcam</option>
						<option value="external">
							Laptop Webcam with external Monitor
						</option>
					</select>
				</div>
			</header>
			<Webcam
				ref={webcamRef}
				audio={false}
				mirrored={false}
				onUserMedia={() => (webcamRef.current.audio = false)}
				style={{ display: "none" }}
			/>
		</div>
	);
}

export default App;
