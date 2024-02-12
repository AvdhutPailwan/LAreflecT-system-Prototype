const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

app.get("/hello", (req, res) => {
  res.send("Hello World Ritesh Bakare");
});

let gazeDataStore = [];

app.post("/api/gaze", (req, res) => {
  const gazeData = req.body.gazeData;
  // console.log(`the data points are ${gazeData}`);
  gazeData.forEach((point) => {
    console.log(`x: ${point.x}, y: ${point.y}`);
    gazeDataStore.push(point.x, point.y);
  });

  res.status(200).json({ message: "Gaze data received successfully. " });
});



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
