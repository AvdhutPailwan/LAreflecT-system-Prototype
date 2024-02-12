document.addEventListener("DOMContentLoaded", function () {
  let isTracking = false;
  let isRecording = false;

  const startBtn = document.getElementById("startBtn");
  const stopBtn = document.getElementById("stopBtn");

  startBtn.addEventListener("click", startTracking);
  stopBtn.addEventListener("click", stopTracking);

  let gazeData = [];

  function startTracking() {
    isTracking = true;
    startBtn.disabled = true;
    stopBtn.disabled = false;

    webgazer
      .setGazeListener(function (data, elapsedTime) {
        console.log(data);
        gazeData.push({ x: data.x, y: data.y });
        if (isRecording && data && data.x !== null && data.y !== null) {
          gazeDataStore.push({ x: data.x, y: data.y });
        }
      })
      .begin();
  }

  function stopTracking() {
    isTracking = false;
    startBtn.disabled = false;
    stopBtn.disabled = true;
    webgazer.end();
    console.log("Data Revied :-) \n\n");
    console.log(gazeData);
    sendDataToServer();
  }

  function sendDataToServer() {
    
    const url = "http://localhost:3000/api/gaze";

    const data = { gazeData: gazeData };

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Server response:", data);
        console.log("Data Recived Sucessfully ");
      })
      .catch((error) => {
        console.error("Error during POST request:", error);
      });
  }
});
