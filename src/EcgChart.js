import React, { useState, useEffect, useRef } from 'react';
import './EcgChart.css';

const EcgChart = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [data, setData] = useState([]);
  const [position, setPosition] = useState(0);
  const [minValue, setMinValue] = useState(0);
  const [maxValue, setMaxValue] = useState(0);
  const requestRef = useRef();
  const graphSheetHeight = 550; // Height of the graph sheet in pixels
  const numGridLines = 11; // Number of grid lines on the graph sheet

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/ecgData.json');
      const result = await response.json();
      const samples = result.data.flatMap(item => item.ecg.Samples);
      setData(samples);
      setMinValue(Math.min(...samples));
      setMaxValue(Math.max(...samples));
    };

    fetchData();
  }, []);

  const animate = () => {
    setPosition(prevPosition => (prevPosition + 1) % data.length);
    requestRef.current = requestAnimationFrame(animate);
  };


  useEffect(() => {
    if (isRunning) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(requestRef.current);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isRunning, animate]);

  

  const startAnimation = () => {
    setIsRunning(true);
  };

  const stopAnimation = () => {
    setIsRunning(false);
  };

  const drawWaveform = () => {
    const points = [];
    for (let x = 0; x < 800; x++) {
      const index = (position + x) % data.length;
      const y = data[index];
      points.push(`${x},${graphSheetHeight - ((y - minValue) / (maxValue - minValue) * graphSheetHeight)}`); // Adjust y position and scaling as needed
    }
    return points.join(' ');
  };

  return (
    <div className="container">
      <div className="ecg-container" style={{ height: `${graphSheetHeight}px` }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox={`-50 0 850 ${graphSheetHeight}`}>
          <rect width="100%" height="100%" fill="#fff" />
          <g className="grid">
            {[...Array(20)].map((_, i) => (
              <g key={i}>
                <line x1={i * 40} y1="0" x2={i * 40} y2={graphSheetHeight} stroke="#eee" />
                <text x={i * 40 - 5} y={graphSheetHeight + 15} fill="#666" fontSize="10">{i * 40}</text>
              </g>
            ))}
            {[...Array(numGridLines)].map((_, i) => (
              <g key={i}>
                <line x1="0" y1={(i / numGridLines) * graphSheetHeight} x2="800" y2={(i / numGridLines) * graphSheetHeight} stroke="#eee" />
                {/* Map voltage values to heart rate range */}
                <text x="-50" y={(i / numGridLines) * graphSheetHeight + 5} fill="#666" fontSize="10">{Math.round(40 + i * 16)}</text>
              </g>
            ))}
            {/* Draw reference lines at normal, median, and danger heart rate ranges */}
            <line x1="0" y1={graphSheetHeight / 2 - 80} x2="800" y2={graphSheetHeight / 2 - 80} className="grid line normal-range" strokeWidth="2" />
            <text x="820" y={graphSheetHeight / 2 - 20} className="reference-label">Normal Range</text>


            <line x1="0" y1={graphSheetHeight / 2+20} x2="800" y2={graphSheetHeight / 2+20} className="grid line median-range" strokeWidth="2" />
            <text x="820" y={graphSheetHeight / 2} className="reference-label">Median Range</text>


            <line x1="0" y1={graphSheetHeight / 2 +70} x2="800" y2={graphSheetHeight / 2 +70} className="grid line danger-range" strokeWidth="2" />
            <text x="820" y={graphSheetHeight / 2 + 20} className="reference-label">Danger Range</text>

          </g>
          <polyline
            fill="none"
            stroke="#00f"
            strokeWidth="1.2"
            points={drawWaveform()}
          />
        </svg>
      </div>
      <div className="controls">
        <button onClick={startAnimation} disabled={isRunning}>
          Start
        </button>
        <button onClick={stopAnimation} disabled={!isRunning}>
          Stop
        </button>
      </div>

      <div className="color-palette">
        {/* Color palette box and reference line names */}
        <div className="color-box normal-range"></div>
        <span className="reference-label">Normal Range</span>
        <div className="color-box median-range"></div>
        <span className="reference-label">Median Range</span>
        <div className="color-box danger-range"></div>
        <span className="reference-label">Danger Range</span>
      </div>
    </div>



    // </div>
  );
};

export default EcgChart;




