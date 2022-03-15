import React, { Component } from "react";
import axios from "axios";

import Layout from "../components/Layout/Layout";
import "./App.css";

class App extends Component {
  hideUI = false;
  state = {
    // request: '/r/pics.json',
    request: window.location.pathname + ".json",
    posts: [],
    currentPost: -1,
    prevPost: 0,
    currentEndedPlaying: false,
    after: "", // to be sent as a part of a request, see reddit api docs
    awaitingResponse: false,
    showTitle: true, // show image title at top left
    showInfo: true, // show info and buttons at bottom right
    auto: false, // autoplay
    sound: false,
    hideUI: this.hideUI,
    hideUIChecked: this.hideUI,
    showNSWF: true,
    touchStartX: 0, // used for swipe gestures in mobile
  };

  /**
   * This makes sure we access the right reddit url based on how the user
   * accesses our website.
   */
  componentDidMount = () => {
    // Get initial posts via http, set state
    if (!this.state.awaitingResponse) {
      this.setState({ awaitingResponse: true });
      axios
        .get(this.state.request)
        .then((response) => {
          // posts are in response.data.data.children
          const after = response.data.data.after;
          this.getPosts(response.data.data.children)
            .then((posts) => {
              // console.log('after', after);
              // console.log('reduced posts', posts);
              this.setState({
                posts: [...posts],
                after: after,
                currentPost: 0,
                awaitingResponse: false,
                // interval: setInterval(this.nextSlideHandler, 2000)
              });
              if (this.state.auto) {
                this.setState({ interval: setInterval(() => this.nextSlideHandler(false), 5000) });
              }
              // console.log("initialized state", this.state);
            })
            .catch(function (error) {
              console.log(error);
            });
        })
        .catch(function (error) {
          console.log(error);
        });
    }
    document.addEventListener("mousemove", this.mouseMoveHandler);
    document.addEventListener("keydown", this.keyDownHandler);
  };

  /**
   * Prevent unnecessary rerenders.
   */
  shouldComponentUpdate = (nextProps, nextState) => {
    /**
     * Do not rerender on touch start
     * the touch start event modifies the state but it doesn't have an impact
     * on the elements being shown.
     */
    if (this.state.touchStartX !== nextState.touchStartX) {
      return false;
    }
    return true;
  };

  /**
   * Handle key presses.
   * A or arrow left to go left, D or arrow right to go right.
   */
  keyDownHandler = (event) => {
    if (event.key === "ArrowLeft" || event.code === "KeyA") {
      this.prevSlideHandler();
    } else if (event.key === "ArrowRight" || event.code === "KeyD") {
      this.nextSlideHandler(true);
    }
  };

  /**
   * Get posts from a server response
   *
   * post {
   *  title:
   *  id:
   *  url:
   *  urlToComments:
   *  nsfw: (true/false)
   * }
   */
  getPosts = (children) => {
    // Filter and map at the same time
    const posts = children.reduce(this.filterPosts, []);
    // Update the posts, get urls to gfycat mp4s (see updatePosts fore more info).
    const updatedPosts = this.updatePosts(posts);
    // console.log('updated posts', updatedPosts);
    return updatedPosts;
  };

  /**
   * Map an array of reddit posts so as to only keep relevant information,
   *  and filter self posts, posts with unsuppored exentensions, etc.
   */
  filterPosts = (filtered, child) => {
    // is_self is true for self posts
    if (!child.data.is_self) {
      // Will return either a filter url or null if url is invalid
      const filteredUrl = this.filterUrl(child.data.url);
      if (filteredUrl) {
        filtered.push({
          title: child.data.title,
          id: child.data.id,
          nsfw: child.data.over_18,
          urlToComments: "https://www.reddit.com" + child.data.permalink,
          link: filteredUrl.url,
          extension: filteredUrl.extension,
        });
      }
    }
    // console.log("returning filterPosts");
    return filtered;
  };

  /**
   * Only keep valid urls and extensions.
   * Returns a valid url or null if url parameter isn't valid.
   * Not secure urls are transformed to https.
   */
  filterUrl = (url) => {
    // Transform http to https
    url = url.replace("http://", "https://");

    const domain = url.match(/:\/\/(.+)\//)[1];
    const extPattern = /\.[0-9a-z]+$/i;
    const match = url.match(extPattern);
    const fileExt = match ? match[0] : null;
    const supportedExtensions = [".jpg", ".jpeg", ".png", ".bmp", ".gif", ".gifv"];
    if (domain === "gfycat.com" || supportedExtensions.includes(fileExt)) {
      return { url, extension: fileExt };
    }
    if (domain === "imgur.com") {
      return { url: url + ".jpg", extension: fileExt };
    }
    return null;
  };

  /**
   * This is mainly to make sure we get the right gfycat url.
   * This is because gfycats urls on reddit will have the form
   * "https://gfycat.com/somewords" in lowercase, so we must get the .mp4
   * link, which is case sensitive (i.e. "https://giant.gfycat.com/SomeWords.mp4").
   * We do this by calling the gfycat API, see:
   *    https://developers.gfycat.com/api/#getting-gfycats
   */
  updatePosts = async (posts) => {
    // console.log(posts);
    // posts.forEach( async (post) => {
    let counter = 0;
    for (const post of posts) {
      // console.log(post1);
      const domain = post.link.match(/:\/\/(.+)\//)[1];

      // In order to play gfycat videos we must get the mp4 url from the video id
      if (domain === "gfycat.com") {
        const gfyId = post.link.match(/([.0-9a-zA-Z]+)(-|$)/)[1];
        /*
         * gfyId regex clarification: sometimes gfys have dashes ('-') in their url.
         *  These are not part of the gfy ID.
         */

        // Wait until some images are correct so we can render something
        if (counter < 3) {
          const response = await axios.get("https://api.gfycat.com/v1/gfycats/" + gfyId);
          post.link = response.data.gfyItem.mp4Url;
        } else {
          axios
            .get("https://api.gfycat.com/v1/gfycats/" + gfyId)
            .then((response) => {
              post.link = response.data.gfyItem.mp4Url;
            })
            .catch(function (error) {
              console.log(error);
            });
        }
        const extPattern = /\.[0-9a-z]+$/i;
        const match = post.link.match(extPattern);
        const fileExt = match ? match[0] : null;
        post.extension = fileExt;
        if (fileExt === ".gifv" || fileExt === ".mp4") {
          post.isVideo = true;
        } else {
          post.isVideo = false;
        }
        counter++;
      }
    }
    return posts;
  };

  /**
   * Go to previous slide.
   */
  prevSlideHandler = () => {
    if (this.state.currentPost > 0) {
      this.setState((prevState, props) => {
        return {
          prevPost: prevState.currentPost,
          currentPost: prevState.currentPost - 1,
        };
      });
    }
    console.log("Prev");
  };

  /**
   * Handle nextSlide event. If it was fired manually, always go to next slide.
   * If it was fired automatically and we are playing a video, go to next slide only
   * if current video has finished playing.
   */
  nextSlideHandler = (manual, e) => {
    // do nothing if current video didn't end playing
    const currentIsVideo = this.state.posts[this.state.currentPost].isVideo;
    if (!manual && currentIsVideo && !this.state.currentEndedPlaying) {
      console.log("Current video still playing!");
      return;
    }

    if (this.state.currentPost < this.state.posts.length - 1) {
      this.setState((prevState, props) => {
        return {
          prevPost: prevState.currentPost,
          currentPost: prevState.currentPost + 1,
        };
      });
    }

    // Load more posts when close to reaching the end
    if (this.state.currentPost > this.state.posts.length - 4) {
      if (!this.state.awaitingResponse) {
        this.setState({ awaitingResponse: true });
        console.log("fetching aditional posts");
        axios
          .get(this.state.request + "?after=" + this.state.after)
          .then((response) => {
            // console.log(response); // posts are in response.data.data.children
            const after = response.data.data.after;
            this.getPosts(response.data.data.children)
              .then((posts) => {
                // console.log('after', after);
                // console.log('reduced posts', posts);
                this.setState((state, props) => {
                  return {
                    posts: [...state.posts, ...posts],
                    after: after,
                    awaitingResponse: false,
                  };
                });
              })
              .catch(function (error) {
                console.log(error);
              });
          })
          .catch(function (error) {
            console.log(error);
          });
      }
    }
    this.setState({ currentEndedPlaying: false });
    console.log("Next");
  };

  /**
   * Hide/show title at the top right.
   */
  toggleTitleHandler = () => {
    this.setState((state, props) => {
      return {
        showTitle: !state.showTitle,
      };
    });
  };

  /**
   * Hide/show info panel at the bottom left.
   */
  toggleInfoHandler = () => {
    console.log("toggle info");
    this.setState((state, props) => {
      return {
        showInfo: !state.showInfo,
      };
    });
  };

  /**
   * Handle autoplay checkbox.
   */
  autoCheckboxHandler = (event) => {
    if (event.target.checked) {
      this.setState({
        auto: true,
        interval: setInterval(() => this.nextSlideHandler(false), 5000),
      });
    } else {
      this.setState({ auto: false });
      clearInterval(this.state.interval);
    }
  };

  /**
   * Handle sound checkbox.
   */
  soundCheckboxHandler = (event) => {
    if (event.target.checked) {
      this.setState({
        sound: true
      });
    } else {
      this.setState({ sound: false });
    }
  };

  /**
   * Handle hideUI checkbox.
   */
  hideUICheckboxHandler = (event) => {
    if (event.target.checked) {
      this.setState({
        hideUI: true,
        hideUIChecked: true,
      });
    } else {
      this.setState({
        hideUI: false,
        hideUIChecked: false,
      });
      clearInterval(this.state.interval);
    }
  };

  /**
   * Handle nsfw checkbox.
   */
  nsfwCheckboxHandler = (event) => {
    this.setState({ showNSWF: event.target.checked });
  };

  /**
   * Handle mouse movement.
   * If UI is hidden, this should show the UI, then hide it again after some time
   */
  mouseMoveHandler = () => {
    if (this.state.hideUI) {
      this.setState({ hideUI: false });
      setTimeout(this.hideUI, 3000);
    }
  };

  /**
   * Hide UI, this method should be called from the timer created in
   * mouseMoveHandler only.
   * It's necessary to check if the user has unchecked the hideUI checkbox
   * after moving the mouse so as not to hide the UI in that case.
   */
  hideUI = () => {
    if (this.state.hideUIChecked) {
      this.setState({ hideUI: true });
    }
  };

  /**
   * On touch start, save position on state.
   * This will be later compared to touch end position for swipe gestures.
   */
  touchStartHandler = (event) => {
    this.setState({ touchStartX: event.targetTouches[0].clientX });
  };

  /**
   * On touch end, compare touch position to touch start (saved in state).
   * Change slides if both points are far enough.
   */
  touchEndHandler = (event) => {
    if (event.changedTouches[0].clientX < this.state.touchStartX - 50) {
      this.nextSlideHandler(true);
    } else if (event.changedTouches[0].clientX > this.state.touchStartX + 50) {
      this.prevSlideHandler();
    }
  };

  currentEndedPlayingHandler = () => {
    this.setState({ currentEndedPlaying: true });
  };

  render() {
    return (
      <div className="App">
        <Layout
          className="App"
          post={this.state.posts.length ? this.state.posts[this.state.currentPost] : null}
          prev={this.state.posts.length ? this.state.posts[this.state.prevPost] : null}
          prevHandler={this.prevSlideHandler}
          nextHandler={(e) => this.nextSlideHandler(true, e)}
          showTitle={this.state.showTitle}
          showInfo={this.state.showInfo}
          titleClick={this.toggleTitleHandler}
          infoClick={this.toggleInfoHandler}
          autoPlay={this.state.auto}
          autoCheckboxHandler={this.autoCheckboxHandler}
          sound={this.state.sound}
          soundCheckboxHandler={this.soundCheckboxHandler}
          hideUI={this.state.hideUI}
          hideUIChecked={this.state.hideUIChecked}
          hideUICheckboxHandler={this.hideUICheckboxHandler}
          nsfwCheckboxHandler={this.nsfwCheckboxHandler}
          nsfwChecked={this.state.showNSWF}
          touchStart={this.touchStartHandler}
          touchEnd={this.touchEndHandler}
          currentEndedPlaying={this.currentEndedPlayingHandler}
        />
      </div>
    );
  }
}

export default App;
