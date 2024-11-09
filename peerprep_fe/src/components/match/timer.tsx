import React, { useEffect, useState } from "react";

type TimerProps = {
  onClose: () => void; // Callback to close the modal
};

const Timer: React.FC<TimerProps> = ({ onClose }) => {
  const [time, setTime] = useState<number>(0);
  const duration = 30; // Set total duration in seconds

  // Format time as MM:SS
  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;

    return `${minutes < 10 ? "0" + minutes : minutes}:${
      seconds < 10 ? "0" + seconds : seconds
    }`;
  };

  useEffect(() => {
    // Start the timer
    const intervalId: NodeJS.Timeout = setInterval(() => {
      setTime((prevTime) => {
        if (prevTime >= duration) {
          clearInterval(intervalId); // Stop the timer
          onClose(); // Close the modal if necessary
          return prevTime; // Return the final time
        }
        return prevTime + 1; // Increment the timer
      });
    }, 1000);

    return () => clearInterval(intervalId); // Cleanup the interval on unmount
  }, [onClose]);

  // Calculate the stroke dash offset for the circular loader
  const radius = 80; // Set radius to 80
  const strokeDasharray = 2 * Math.PI * radius; // Circumference of the circle
  const strokeDashoffset = ((duration - time) / duration) * strokeDasharray;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="text-2xl font-bold text-black dark:text-white mb-2">
        Matching...
      </div>
      <div className="relative">
        <svg width="200" height="200" className="mb-4">
          {" "}
          {/* Increased size of SVG */}
          <circle
            className="stroke-gray-300 dark:stroke-white"
            cx="100"
            cy="100"
            r={radius}
            strokeWidth="5"
            fill="none"
          />
          <circle
            cx="100"
            cy="100"
            r={radius}
            stroke="rgba(0 ,0 ,255, 0.5)"
            strokeWidth="5"
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>
        <div className={`timer text-black dark:text-white`}>
          {formatTime(time)}
        </div>
      </div>
      {time < duration && (
        <div className="loader">
          <i className="fas fa-spinner fa-spin text-white text-2xl"></i>{" "}
          {/* Loading icon */}
        </div>
      )}
    </div>
  );
};

export default Timer;
