const express = require("express");
const cors = require("cors");
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;


app.use(cors());
app.use(express.json());

app.get("/hello", (req, res) => {
  res.send("Hello World Ritesh Bakare");
});

let gazeDataStore = {};

app.post("/api/gaze", (req, res) => {
  gazeDataStore = req.body.gazeData;
  let intialGazeData = Object.keys(gazeDataStore);
  const gazeData = intialGazeData.map((item) => {
    let x = Number(item.split(",")[0]);
    let y = Number(item.split(",")[1]);
    let values = gazeDataStore[item];
    return { x, y, values };
  });

  // console.log(`the data points are ${gazeData}`);
  gazeData.forEach((item) => {
    console.log(`x : ${item['x']}, y : ${item['y']}, values : ${item['values']}`)
  })
  const keys = Object.keys(gazeData[0]).join(',') + '\n';
  

  const csvContent = [
    ...gazeData.map((obj) => Object.values(obj).join(",")), // Map objects to data rows
  ].join("\n");

  if(fs.existsSync("./public/csvData.csv")){
    fs.appendFileSync("./public/csvData.csv", '\n' + csvContent, function(err) {
      if (err) throw err;
      console.log("Saved!!!");
    });
  }else {
    fs.appendFileSync("./public/csvData.csv", keys + csvContent, function(err) {
      if (err) throw err;
      console.log("Saved!!!");
    });
  }
  

  res.status(200).json({ message: "Gaze data received successfully. " });
});

app.get("/api/gaze", (req, res) => {
  let intialGazeData = Object.keys(gazeDataStore);
  const gazeData = intialGazeData.map((item) => {
    let x = Number(item.split(",")[0]);
    let y = Number(item.split(",")[1]);
    let values = gazeDataStore[item];
    return { x, y, values };
  });
  res.sendFile(__dirname + '/public/csvData.csv');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
