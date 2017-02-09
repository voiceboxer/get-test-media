# get-test-media

Generate a dummy MediaStream instance. This is useful for testing purposes where a media stream from `getUserMedia` is expected (e.g. in a `RTCPeerConnection`). This only works in modern browsers that support the `Canvas.captureStream` method.

    npm install get-test-media

See the [live demo](https://voiceboxer.github.io/get-test-media/demo/index.html).

# Usage

The exported function accepts an options object somewhat similar to `getUserMedia` constraints (see example). It's also possible to pass a `canvas` element which will be used for drawing. Otherwise an element is created, attached to the body and hidden outside the screen by using absolute positioning.

```javascript
var getTestMedia = require('get-test-media');

// Check if the browser supports the required APIs.
if(!getTestMedia.supported) console.error('Not supported');

var media = getTestMedia({
  audio: true,
  video: {
    width: 400,
    height: 300,
    frameRate: 24
  }
});

var pc = new RTCPeerConnection();
pc.addStream(media.stream);

// Cleanup when the stream is no longer in use.
media.close();
```

The object returned from `getTestMedia` has two properties. The `stream` property contains the MediaStream instance, while the `close` method cleans up the underlying resources and should be called when the stream is no longer in use.
