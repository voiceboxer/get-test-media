var CANVAS_WIDTH = 640;
var CANVAS_HEIGHT = 360;
var CANVAS_FRAME_RATE = 24;
var AUDIO_SAMPLE_LENGTH = 3;

var supported = !!(
  window.CanvasRenderingContext2D &&
  window.requestAnimationFrame &&
  window.cancelAnimationFrame &&
  window.AudioContext &&
  window.MediaStreamAudioDestinationNode &&
  window.AudioBufferSourceNode
) && (function() {
  var canvas = document.createElement('canvas');
  return (typeof canvas.captureStream === 'function');
}());

var hide = function(size) {
  return -(size + 1000) + 'px';
};

module.exports = exports = function(options) {
  var stream = null;
  var closeVideo = null;
  var closeAudio = null;
  var close = function() {
    if(closeVideo) closeVideo();
    if(closeAudio) closeAudio();
  };

  if(options.video) {
    var width = options.video.width;
    var height = options.video.height;
    var frameRate = options.video.frameRate;
    var canvas = options.canvas;

    if(!canvas) {
      if(!width) width = CANVAS_WIDTH;
      if(!height) height = CANVAS_HEIGHT;

      canvas = document.createElement('canvas');
      canvas.style.position = 'absolute';
      canvas.style.left = hide(width);
      canvas.style.top = hide(height);

      document.body.appendChild(canvas);

      canvas.width = width;
      canvas.height = height;
    } else {
      if(width) canvas.width = width;
      else width = canvas.width;

      if(height) canvas.height = height;
      else height = canvas.height;
    }

    var context = canvas.getContext('2d');
    var request = requestAnimationFrame(function loop() {
      var image = context.createImageData(width, height);
      var data = image.data;

      for(var i = 0; i < data.length; i = i + 4) {
        var color = Math.floor(Math.random() * 0xffffff);
        data[i] = color & 0xff;
        data[i + 1] = (color & 0xff00) >>> 8;
        data[i + 2] = (color & 0xff0000) >>> 16;
        data[i + 3] = 255;
      }

      context.putImageData(image, 0, 0);
      request = requestAnimationFrame(loop);
    });

    closeVideo = function() {
      cancelAnimationFrame(request);
      if(!options.canvas) document.body.removeChild(canvas);
    };

    stream = canvas.captureStream(frameRate || CANVAS_FRAME_RATE);
  }
  if(options.audio) {
    var audioContext = options.audioContext || new AudioContext();
    var dest = audioContext.createMediaStreamDestination();
    var sampleRate = audioContext.sampleRate;
    var buffer = audioContext.createBuffer(1,
      AUDIO_SAMPLE_LENGTH * sampleRate, sampleRate);
    var data = buffer.getChannelData(0);

    for(var i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    var src = audioContext.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    src.connect(dest);
    src.start(0);

    closeAudio = function() {
      src.stop();
      src.disconnect();
      if(!options.audioContext) audioContext.close();
    };

    if(!stream) stream = dest.stream;
    else {
      var audioTracks = dest.stream.getAudioTracks();
      audioTracks.forEach(function(track) {
        stream.addTrack(track);
      });
    }
  }

  return {
    stream: stream,
    close: close
  };
};

exports.supported = supported;
