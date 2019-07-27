import React from 'react';

import './Slide.css'

const slide = (props) => {

  // get file extension
  const extPattern = /\.[0-9a-z]+$/i;
  const match = props.url.match(extPattern);
  const fileExt = match ? match[0] : null;
  if (props.classes.includes('current')) {
    console.log("Attempting to show", props.url);
  }
  // console.log (props.classes);
  // console.log('extension', fileExt);

  // console.log('domain', domain);

  // imgur urls are case sensitive!
  // const afterDomain = props.url.match(/[.0-9a-zA-Z]+$/)[0];
  // console.log('afterdomain', afterDomain);

  if (fileExt) {
    // Imgur videos can be linked by using .mp4 extension instead of .gifv
    if ( fileExt === ".gifv" ) {
      return (
        <video autoPlay muted loop className= { props.classes.join(' ') + ' video' }>
          <source src={ props.url.replace(".gifv", ".mp4") } type="video/mp4"/>
        </video>
      );
    } else if ( fileExt === ".mp4" ) {
      return (
        <video autoPlay muted loop className= { props.classes.join(' ') + ' video' }>
          <source src={ props.url.replace('.mp4', '.webm') } type="video/webm"/>
          <source src={ props.url } type="video/mp4"/>
        </video>
      );
    }
    // Regular picture
    const mystyle= { backgroundImage:`url(${props.url})` };
    return <div style={ mystyle } className= { props.classes.join(' ') } />;
  }

  return(
    <div>Something went wrong.</div>
  );
};

export default slide;
