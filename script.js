// script.js

const img = new Image(); // used to load image from <input> and draw to canvas
const canvas = document.getElementById('user-image');
const ctx = canvas.getContext('2d'); 
const img_in = document.getElementById('image-input');

const form = document.getElementById('generate-meme');


const submit = document.getElementsByTagName('button')[0]
const clear = document.getElementsByTagName('button')[1]
const read = document.getElementsByTagName('button')[2]

const topT = document.getElementById('text-top');
const botT = document.getElementById('text-bottom');

const vol_group = document.getElementById('volume-group');

var synth = window.speechSynthesis;
var voiceSelect = document.getElementById('voice-selection');

var voices = [];
var vol = 100;
var myvoice;

function populateVoiceList() {
  if(typeof speechSynthesis === 'undefined') {
    return;
  }

  voices = speechSynthesis.getVoices();
  voiceSelect.innerHTML = '';

  for(var i = 0; i < voices.length; i++) {
    var option = document.createElement('option');
    option.textContent = voices[i].name + ' (' + voices[i].lang + ')';

    if(voices[i].default) {
      option.textContent += ' -- DEFAULT';
    }

    option.setAttribute('data-lang', voices[i].lang);
    option.setAttribute('data-name', voices[i].name);
    voiceSelect.appendChild(option);
  }

  voiceSelect.selectedIndex = 0;
}

populateVoiceList();
if (synth.onvoiceschanged !== undefined) {
  synth.onvoiceschanged = populateVoiceList;
}

vol_group.addEventListener('input', () => {
  let vol_img = document.querySelector('img')
  vol = document.getElementsByTagName('input')[3].value;

  if (vol > 66) {
    vol_img.src = "icons/volume-level-3.svg";
  }
  else if (vol > 33){
    vol_img.src = "icons/volume-level-2.svg";
  }
  else if (vol > 0) {
    vol_img.src = "icons/volume-level-1.svg";
  }
  else {
    vol_img.src = "icons/volume-level-0.svg";
  }

});



// Fires whenever the img object loads a new image (such as with img.src =)
img.addEventListener('load', () => {
  // TODO

  ctx.clearRect(0,0,canvas.width, canvas.height);
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  form.reset();

  let img_dimen = getDimmensions(canvas.width, canvas.height, img.width, img.height);
  ctx.drawImage(img, img_dimen.startX, img_dimen.startY, img_dimen.width, img_dimen.height)

  clear.disabled = true;
  read.disabled = true;


  // Some helpful tips:
  // - Fill the whole Canvas with black first to add borders on non-square images, then draw on top
  // - Clear the form when a new image is selected
  // - If you draw the image to canvas here, it will update as soon as a new image is selected
});

// upload image
img_in.addEventListener('change', () => {

  img.src = URL.createObjectURL(img_in.files[0]);
  img.alt = img_in.files[0].name;
  submit.disabled = false;
});


form.addEventListener('submit', (event) => {
  
  event.preventDefault();

  clear.disabled = false;
  read.disabled = false;

  ctx.font = '30px Arial';
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.strokeStyle = 'black';

  ctx.fillText(topT.value, canvas.width/2, canvas.height*0.08);
  ctx.strokeText(topT.value, canvas.width/2, canvas.height*0.08)
  ctx.fillText(botT.value, canvas.width/2,canvas.height*0.98);
  ctx.strokeText(botT.value, canvas.width/2,canvas.height*0.98);

  voiceSelect.disabled = false;
  
});

clear.addEventListener('click', () => {
  ctx.clearRect(0,0, canvas.width, canvas.height);

  submit.disabled = false;
  clear.disabled = true;
  read.disabled = true; 
  voiceSelect.disabled = true;
});

read.addEventListener('click', () => {

  //let sentences = topT.value + botT.value;
  let utterance = new SpeechSynthesisUtterance(topT.value + ' ' + botT.value);
  var selectedOption = voiceSelect.selectedOptions[0].getAttribute('data-name');

  for(let i = 0; i < voices.length ; i++) {
    if(voices[i].name === selectedOption) {
      utterance.voice = voices[i];
    }
  }

  utterance.volume = vol/100;
  synth.speak(utterance);  
});


/**
 * Takes in the dimensions of the canvas and the new image, then calculates the new
 * dimensions of the image so that it fits perfectly into the Canvas and maintains aspect ratio
 * @param {number} canvasWidth Width of the canvas element to insert image into
 * @param {number} canvasHeight Height of the canvas element to insert image into
 * @param {number} imageWidth Width of the new user submitted image
 * @param {number} imageHeight Height of the new user submitted image
 * @returns {Object} An object containing four properties: The newly calculated width and height,
 * and also the starting X and starting Y coordinate to be used when you draw the new image to the
 * Canvas. These coordinates align with the top left of the image.
 */
function getDimmensions(canvasWidth, canvasHeight, imageWidth, imageHeight) {
  let aspectRatio, height, width, startX, startY;

  // Get the aspect ratio, used so the picture always fits inside the canvas
  aspectRatio = imageWidth / imageHeight;

  // If the apsect ratio is less than 1 it's a verical image
  if (aspectRatio < 1) {
    // Height is the max possible given the canvas
    height = canvasHeight;
    // Width is then proportional given the height and aspect ratio
    width = canvasHeight * aspectRatio;
    // Start the Y at the top since it's max height, but center the width
    startY = 0;
    startX = (canvasWidth - width) / 2;
    // This is for horizontal images now
  } else {
    // Width is the maximum width possible given the canvas
    width = canvasWidth;
    // Height is then proportional given the width and aspect ratio
    height = canvasWidth / aspectRatio;
    // Start the X at the very left since it's max width, but center the height
    startX = 0;
    startY = (canvasHeight - height) / 2;
  }

  return { 'width': width, 'height': height, 'startX': startX, 'startY': startY }
}
