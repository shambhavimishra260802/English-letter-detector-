import logo from './logo.svg';
import './App.css';

/*function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;*/
import React, { useEffect, useRef } from "react"; 
import HandLandMarker from "./components/HandLandMarker"; 
import { DrawingUtils, HandLandmarker as abc } from "@mediapipe/tasks-vision"; 
 
const App = () => { 
  const canvasRef = useRef(null); 
  const contextRef = useRef(null); 
  const inputVideoRef = useRef(null); 
 
  useEffect(() => { 
    const canvas = canvasRef.current; 
    const videoRef = inputVideoRef.current; 
    let gesture = ""; 
 
    if (canvas) { 
      contextRef.current = canvas.getContext("2d"); 
    } 
 
    if (contextRef.current && canvas && videoRef) { 
      createHandLandmarker().then((handLandmarker) => { 
        console.log(handLandmarker); 
        const drawingUtils = new DrawingUtils(contextRef.current); 
        let lastVideoTime = -1; 
        let results = undefined; 
 
        function predict() { 
          canvas.style.width = videoRef.videoWidth; 
          canvas.style.height = videoRef.videoHeight; 
          canvas.width = videoRef.videoWidth; 
          canvas.height = videoRef.videoHeight; 
 
          let startTimeMs = performance.now(); 
          if (lastVideoTime !== videoRef.currentTime) { 
            lastVideoTime = videoRef.currentTime; 
            results = handLandmarker.detectForVideo(videoRef, startTimeMs); 
            console.log(results); 
            // Perform gesture recognition 
            const recognizedGesture = recognizeGesture(results); 
            gesture = recognizedGesture ? recognizedGesture : ""; 
          } 
 
          contextRef.current.save(); 
          contextRef.current.clearRect(0, 0, canvas.width, canvas.height); 
          if (results.landmarks) { 
            for (const landmarks of results.landmarks) { 
              drawingUtils.drawConnectors(landmarks, abc.HAND_CONNECTIONS, { 
                color: "#FFF000", 
                lineWidth: 5, 
              }); 
 
              drawingUtils.drawLandmarks(landmarks, { 
                color: "#00FF00", 
                lineWidth: 5, 
              }); 
            } 
          } 
 
          // Display recognized gesture 
          contextRef.current.font = "30px Arial"; 
          contextRef.current.fillStyle = "#FFFFFF"; 
          contextRef.current.fillText(`Recognized Gesture: ${gesture}`, 10, 30); 
          contextRef.current.restore(); 
 
          window.requestAnimationFrame(predict); 
        } 
 
        navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => { 
          videoRef.srcObject = stream; 
          videoRef.addEventListener("loadeddata", predict); 
        }); 
      }); 
    } 
  }, []); 
 
  const createHandLandmarker = async () => { 
    const handLandmarker = await HandLandMarker(); 
    return handLandmarker; 
  }; 
 
  const recognizeGesture = (results) => { 
    if (results.landmarks && results.landmarks.length > 0) { 
      const landmarks = results.landmarks[0]; // Assuming only one hand is detected 
   
      if (landmarks.length >= 21) { 
        const thumbTip = landmarks[4]; // Thumb tip landmark 
        const indexTip = landmarks[8]; // Index finger tip landmark 
        const middleTip = landmarks[12]; // Middle finger tip landmark 
        const ringTip = landmarks[16]; // Ring finger tip landmark 
        const pinkyTip = landmarks[20]; // Pinky finger tip landmark 
   
        const fingerTips = [thumbTip, indexTip, middleTip, ringTip, pinkyTip]; 
   
        // Distance threshold to classify a finger as raised (arbitrary value) 
        const raisedThreshold = 0.06; 
   
        // Calculate the distances between each finger tip and the thumb tip 
        const distances = fingerTips.map((fingerTip) => { 
          const dx = fingerTip.x - thumbTip.x; 
          const dy = fingerTip.y - thumbTip.y; 
          const distance = Math.sqrt(dx * dx + dy * dy); 
          return distance; 
        }); 
   
        // Check if fingers are raised or not 
        const raisedFingers = distances.map((distance) => distance > raisedThreshold); 
   
        // Check for specific gestures 
        if (raisedFingers[1] &&!raisedFingers[2] && !raisedFingers[3] && !raisedFingers[4]) { 
          return "I"; 
        } else if (raisedFingers[1] && !raisedFingers[2] && !raisedFingers[3] && raisedFingers[4]) { 
          return "A"; 
        } else if (raisedFingers[1] && !raisedFingers[2] && raisedFingers[3] && !raisedFingers[4]) { 
          return "L"; 
        } else if (raisedFingers[1] && raisedFingers[2] && !raisedFingers[3] && !raisedFingers[4]) { 
          return "V"; 
         } else if (!raisedFingers[1] && !raisedFingers[2] && !raisedFingers[3] && !raisedFingers[4]) { 
            return "O";
          } else if (raisedFingers[1] && raisedFingers[2] && raisedFingers[3] && !raisedFingers[4]) { 
            return "W";
        } else { 
          return ""; 
        } 
      } 
    } 
   
    return ""; 
  }; 
   
 
  return ( 
    <> 
      <div style={{ position: "relative" }}> 
        <video 
          id="webcam" 
          style={{ position: "absolute" }} 
          autoPlay 
          playsInline 
          ref={inputVideoRef} 
        ></video> 
        <canvas 
          ref={canvasRef} 
          id="output_canvas" 
          style={{ position: "absolute", left: "0px", top: "0px" }} 
        ></canvas> 
      </div> 
    </> 
  ); 
}; 
 
export default App;