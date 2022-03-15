import React, { useState } from "react";

import "./Slide.css";

const Slide = (props) => {
  // how many time has the video played?
  const [loopCount, setLoopCount] = useState(0);

  const fileExt = props.extension;
  
  if (props.classes.includes("current")) {
    console.log("Attempting to show", props.url);
  }
  
  const endedHandler = () => {
    if (props.classes.includes("current")) {
      if (loopCount === 1 && props.currentEndedPLaying) {
        props.currentEndedPLaying();
      }
      setLoopCount(loopCount + 1);
    }
  };

  if (fileExt) {
    // Imgur videos can be linked by using .mp4 extension instead of .gifv
    if (fileExt === ".gifv") {
      return (
        <video autoPlay loop muted className={props.classes.join(" ") + " video"} onPlaying={endedHandler}>
          <source src={props.url.replace(".gifv", ".mp4")} type="video/mp4" />
        </video>
      );
    } else if (fileExt === ".mp4") {
      return (
        <video autoPlay loop muted className={props.classes.join(" ") + " video"} onPlaying={endedHandler}>
          <source src={props.url.replace(".mp4", ".webm")} type="video/webm" />
          <source src={props.url} type="video/mp4" />
        </video>
      );
    }
    // Regular picture
    const mystyle = { backgroundImage: `url(${props.url})` };
    return <div style={mystyle} className={props.classes.join(" ")} />;
  }

  return <div>Something went wrong.</div>;
};

export default Slide;
