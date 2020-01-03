import React from 'react';

import Slide from '../Slide/Slide';
import './Layout.css';
import { ReactComponent as PrevSlideSVG } from '../../assets/prevSlide-24px.svg';
import { ReactComponent as NextSlideSVG } from '../../assets/nextSlide-24px.svg';
import { ReactComponent as LeftArrowSVG } from '../../assets/leftArrow-24px.svg';
import { ReactComponent as RightArrowSVG } from '../../assets/rightArrow-24px.svg';
import { ReactComponent as GithubLogo } from '../../assets/githubLogo.svg';

const layout = (props) => {
  const link = props.post ? props.post.link : null;
  const id = props.post ? props.post.id : null;
  const title = props.post ? props.post.title : null;
  const urlToComments = props.post ? props.post.urlToComments : null;
  const prevLink = props.prev ? props.prev.link : null;
  const prevId = props.prev ? props.prev.id : null;
  // nsfw: (true/false)
  // console.log('link', link);
  // console.log('post', props.post);

  const headerClasses = [ props.showTitle ? 'showTitle' : 'hideTitle'];

  const infoClasses = ['info'];
  infoClasses.push( props.showInfo ? 'showInfo' : 'hideInfo' );

  const uiClasses = ['ui'];
  uiClasses.push( props.hideUI ? 'hideUI' : 'showUI' );

  const slideClasses = ['slide'];
  if ( props.hideUI ) {
    slideClasses.push('hideCursor');
  }


  return (
    <div className="layout" onTouchStart={props.touchStart} onTouchEnd={props.touchEnd}>
      <div className={ uiClasses.join(' ') }>
        <header className={headerClasses.join(' ')}>
          <h1 className="title">
            {title}
          </h1>
          { props.showTitle
            ? <LeftArrowSVG aria-label="Hide title" className="toggleTitleButton toggleButton" onClick={props.titleClick}/>
            : <RightArrowSVG aria-label="Show title" className="toggleTitleButton toggleButton" onClick={props.titleClick}/> }
        </header>

        <NextSlideSVG aria-label="Next" className="navButton nextButton" onClick={ props.nextHandler }/>
        <PrevSlideSVG aria-label="Previous" className="navButton prevButton" onClick={ props.prevHandler }/>

        <div className={infoClasses.join(' ')}>
          <div className="infoButtons">
            <div className="infoRow">
              <a target="_blank" className="infoElement" href= { urlToComments } rel="noopener noreferrer">Comments</a>
              <a target="_blank" className="infoElement" href= { link } rel="noopener noreferrer">Direct link</a>
              {/*<div className="infoElement">
                <input type="checkbox" id="showNSFW" name="showNSFW" onChange={props.nsfwCheckboxHandler} checked={props.nsfwChecked}/><label htmlFor="showNSFW">NSFW</label>
              </div>*/}
            </div>
            <div className="infoRow">
              <div className="infoElement">
                <input type="checkbox" id="auto" name="auto" onChange={props.autoCheckboxHandler} checked={props.autoPlay}/>
                <label htmlFor="auto">Auto</label>
              </div>
              <div className="infoElement">
                <input type="checkbox" id="hideUI" name="hideUI" onChange={props.hideUICheckboxHandler} checked={props.hideUIChecked}/>
                <label htmlFor="hideUI">Hide UI</label>
              </div>
            </div>
          </div>
          { props.showInfo
            ? <LeftArrowSVG aria-label="Hide info panel" className="toggleInfoButton toggleButton" onClick={props.infoClick}/>
            : <RightArrowSVG aria-label="Show info panel" className="toggleInfoButton toggleButton" onClick={props.infoClick}/> }
        </div>
        
        <a href="https://github.com/ismaelpadilla/reddit-slideshow" aria-label="Source code" target="_blank" rel="noopener noreferrer">
          <GithubLogo className="githubLogo"/>
        </a>
      </div>

      { link ? <Slide url={ link } classes={ slideClasses.concat(['current']) } key={ id }/> : null }
      { props.prev !== props.post ? <Slide url={ prevLink } classes={ slideClasses.concat(['prev']) } key={ prevId } /> : null }
    </div>
  );
};

export default layout;
