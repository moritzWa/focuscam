import './App.css';
import React, { useRef, useEffect, useState } from "react";

import Webcam from "react-webcam"
import * as tf from '@tensorflow/tfjs';
import * as tmImage from '@teachablemachine/image';

function App() {

  const monitorSetups = [
    {
      name: "laptop",
      modelUrl: "https://teachablemachine.withgoogle.com/models/34tgAu-tp/",
    },
    {
      name: "external",
      modelUrl: "https://teachablemachine.withgoogle.com/models/aDUyx7SWA/",
    }
  ]
  const [monitorSetup, setMonitorSetup] = useState(monitorSetups[1])

  const [focusState, setFocusState] = useState(null)
  const [topPrediction, setTopPrediction] = useState(null)

  const webcamRef = useRef(null)

  let model, maxPredictions;


  const runFocuscam = async (modelUrl) => {
    const model = await loadModel(modelUrl)

    setInterval(() => {
      let predictions = detect(model)

      predictions.then(predictions => setFocusState(predictions))
      predictions.then(predictions => predictionsToState(predictions))

    }, 1000)
  }

  const loadModel = async (modelUrl) => {
    const modelURL = modelUrl + "model.json";
    const metadataURL = modelUrl + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
    return model
  }

  const detect = async (model) => {
    if (typeof webcamRef.current !== "undefined" && webcamRef.current !== null && webcamRef.current.video.readyState === 4) {

      //1. get video webcam properties
      const video = webcamRef.current.video

      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      //2. set video width
      webcamRef.current.audio = false
      webcamRef.current.video.width = videoWidth
      webcamRef.current.video.height = videoHeight

      //4. make detections
      const predictions = await model.predict(video)

      return predictions
    }
  }

  useEffect(() => {
    runFocuscam(monitorSetup.modelUrl)
  }, [monitorSetup])

  const predictionsToState = (focusState) => {

    if (focusState && focusState !== undefined) {

      /* 
      0: {className: "focused", probability: 0.1287619024515152}
      1: {className: "distracted", probability: 0.000007463340807589702}
      2: {className: "paused", probability: 0.00013265655434224755}
      3: {className: "fingers", probability: 0.0515095554292202}
      4: {className: "grinning", probability: 0.8195884227752686}
      */


      const topPredictionNumber = Math.max.apply(Math, focusState.map(function (o) { return o.probability; }))

      focusState.map(state => {
        if (state.probability === topPredictionNumber) {
          setTopPrediction(state.className)
          console.log(state.className)
        }
      })
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Focuscam ={" "} {topPrediction}</h1>
        <p>A web app that tracks and helps you improv your focus using computer vision.
      </p>
        <div>
          Choose your Monitor Setup:
        <select value={monitorSetup.name} onChange={e => setMonitorSetup(monitorSetups.find(value => value.name === e.currentTarget.value))}>
            <option value='laptop'>Laptop Webcam</option>
            <option value='external'>Laptop Webcam with external Monitor</option>
          </select>
        </div>
      </header>
      <Webcam ref={webcamRef} audio={false}
      />
    </div>
  );
}

export default App;
