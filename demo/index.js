var getTestMedia = require('../');

var unsupportedParagraph = document.getElementById('unsupported-paragraph');
var video = document.getElementById('video');
var stopButton = document.getElementById('stop-button');

if(!getTestMedia.supported) unsupportedParagraph.style.display = 'block';

var media = getTestMedia({
  audio: true,
  video: {
    width: 400,
    height: 300
  }
});

video.src = URL.createObjectURL(media.stream);

stopButton.onclick = function() {
  stopButton.onclick = null;
  media.close();
};
