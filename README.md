# reddit-slideshow
Site that displays a slideshow with images/gifs obtained from reddit. By default images will be fetched from reddit frontpage.

Currently hosted at https://redditslideshow.com/

## Usage
You can go to the previous/next slide by pressing `A` or `D` respectively, or by using the arrow keys.

You can add, for example, `/r/pics` to the url and data will be fetched from reddit.com/r/pics. Try the following URLs:

- https://redditslideshow.com/r/pics
- https://redditslideshow.com/r/art
- https://redditslideshow.com/r/aww

## Todo
- Detect / handle invalid URLs.
- Better error handling.
- Add tests.
- NSFW filter (some logic already implemented).
- Audio on WebMs.

---

Made with React using `create-react-app`, based on http://redditp.com/
