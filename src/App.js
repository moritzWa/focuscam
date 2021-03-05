import './App.css';
import React, { useRef, useEffect, useState } from "react";

import Webcam from "react-webcam"
import { clearStackAndCalculateResult, takeSnapshot, models } from './utilities';

function App() {
  const [monitorSetup, setMonitorSetup] = useState(models[0])
  const [topPrediction, setTopPrediction] = useState(null)

  const webcamRef = useRef(null)

  useEffect(() => {
    let stackSize = 0;
    let attached = true;

    async function run() {
      const video = webcamRef.current?.video;
      if (video?.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA) {
        await takeSnapshot(monitorSetup.name, video);

        if (stackSize++ >= 50) {
          console.log('update');
          setTopPrediction(clearStackAndCalculateResult());
          stackSize = 0;
        }

        if (attached) {
          setTimeout(run, 10);
        }
      } else {
        if (attached) {
          setTimeout(run, 10);
        }
      }
    }

    run();

    return () => attached = false;
  });

  return (
    <div className="App">
      <header className="App-header">
        <h1>Focuscam ={" "} {topPrediction}</h1>
        <p>A web app that tracks and helps you improv your focus using computer vision.
      </p>
        <div>
          Choose your Monitor Setup:
        <select value={monitorSetup.name} onChange={e => setMonitorSetup(models.find(value => value.name === e.currentTarget.value))}>
            <option value='laptop'>Laptop Webcam</option>
            <option value='external'>Laptop Webcam with external Monitor</option>
          </select>
        </div>
      </header>
      <Webcam ref={webcamRef} audio={false} onUserMedia={() => webcamRef.current.audio = false} />
    </div>
  );
}

export default App;
