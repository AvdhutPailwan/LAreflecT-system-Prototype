// let isTracking = false;
// let isRecording = false;
let visibleMap = false;

const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const showHeatMapButton = document.getElementById("seemap");

startBtn.addEventListener("click", startTracking);
stopBtn.addEventListener("click", stopTracking);
showHeatMapButton.addEventListener("click", showHeatMap);

let gazeData = {};

function startTracking() {
  // isTracking = true;
  startBtn.disabled = true;
  stopBtn.disabled = false;
  webgazer
    .begin()
    .then(function (results) {
      console.log("WebGazer initialized successfully!");
    })
    .catch(function (err) {
      console.log("Error:", err);
    });

  if (webgazer.detectCompatibility()) {
    webgazer.setGazeListener(function (data, elapsedTime) {
      console.log(data);
      console.log(elapsedTime);
      if (
        data &&
        data.x !== null &&
        data.y !== null &&
        data.x > 0 &&
        data.y > 0
      ) {
        let key = `${data.x},${data.y}`;
        const gazeText = `Gaze: X :: ${data.x}, Y :: ${data.y}`;
        document.getElementById("gaze-output").textContent = gazeText;
        if (gazeData.hasOwnProperty(key)) {
          gazeData[key] += 1; // Increment frequency if it exists
        } else {
          gazeData[key] = 1; // Add the point with frequency 1
        }
      }
    });
  }
}
function stopTracking() {
  // isTracking = false;
  startBtn.disabled = false;
  stopBtn.disabled = true;
  webgazer.end();
  console.log("Data Revied :-) \n\n");
  console.log(gazeData);
  sendDataToServer();
}

async function sendDataToServer() {
  const url = "http://localhost:3000/api/gaze";

  const data = { gazeData: gazeData };

  await fetch(url, {
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

function showHeatMap() {
  visibleMap = true;
  const allElements = document.querySelectorAll("*");
  for (const element of allElements) {
    if (
      element.tagName != "HTML" &&
      element.tagName != "BODY" &&
      element.tagName != "HEAD" &&
      element.tagName != "SCRIPT" &&
      element.getAttribute("id") != "my_dataviz"
    ) {
      element.style.display = "none";
    }
  }
  // width = `${window.visualViewport.width}px`;
  // height = `${window.visualViewport.height}px`;
  var margin = {top: 20, right: 30, bottom: 30, left: 30},
    width = window.visualViewport.width - margin.left - margin.right,
    height = window.visualViewport.height - margin.top - margin.bottom;

  var svg = d3
    .select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

  // .attr("padding", 0)
  // .attr("margin", 0)

  d3.csv(
    "http://localhost:3000/api/gaze",
    function (data) {
      // Get max and min of data
      var xLim = [4, 18];
      var yLim = [6, 20];

      // Add X axis
      var x = d3.scaleLinear().nice().domain(xLim).range([0, width]);
      svg
        .append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

      // Add Y axis
      var y = d3.scaleLinear().nice().domain(yLim).range([height, 0]);
      svg.append("g").call(d3.axisLeft(y));

      // Reformat the data: d3.rectbin() needs a specific format
      var inputForRectBinning = [];
      data.forEach(function (d) {
        inputForRectBinning.push([+d.x, +d.y]); // Note that we had the transform value of X and Y !
      });

      // Compute the rectbin
      var size = 0.5;
      var rectbinData = d3.rectbin().dx(size).dy(size)(inputForRectBinning);

      // Prepare a color palette
      var color = d3
        .scaleLinear()
        .domain([0, 350]) // Number of points in the bin?
        .range(["transparent", "#69a3b2"]);

      // What is the height of a square in px?
      heightInPx = y(yLim[1] - size);

      // What is the width of a square in px?
      var widthInPx = x(xLim[0] + size);

      // Now we can add the squares
      svg
        .append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)
        .attr("height", height);
      svg
        .append("g")
        .attr("clip-path", "url(#clip)")
        .selectAll("myRect")
        .data(rectbinData)
        .enter()
        .append("rect")
        .attr("x", function (d) {
          return x(d.x);
        })
        .attr("y", function (d) {
          return y(d.y) - heightInPx;
        })
        .attr("width", widthInPx)
        .attr("height", heightInPx)
        .attr("fill", function (d) {
          return color(d.length);
        })
        .attr("stroke", "black")
        .attr("stroke-width", "0.4");
    }
  );
}
window.addEventListener("resize", () => {
  if (visibleMap) {
    showHeatMap();
  }
});
