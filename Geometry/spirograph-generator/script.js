const canvas = document.getElementById("spirographCanvas");
const ctx = canvas.getContext("2d");
const defaultBtn = document.getElementById("default");
const clearBtn = document.getElementById("clear");
const playPauseBtn = document.getElementById("playPauseBtn");

const inputs = document.querySelectorAll('input[type="number"], input[type="color"]');

let animationId = null;
let currentIteration = 0;
let patternCount = 0;
let isPlaying = false;

function drawSpirograph(outerRadius, innerRadius, offset, iterations, color) {
  const x0 = canvas.width / 2;
  const y0 = canvas.height / 2;
  
  ctx.beginPath();
  ctx.strokeStyle = color;

  for (let i = 0; i <= currentIteration; i++) {
    const t = (i / iterations) * Math.PI * 2;
    const x = (outerRadius - innerRadius) * Math.cos(t) + offset * Math.cos((outerRadius - innerRadius) * t / innerRadius);
    const y = (outerRadius - innerRadius) * Math.sin(t) - offset * Math.sin((outerRadius - innerRadius) * t / innerRadius);
    
    if (i === 0) {
      ctx.moveTo(x0 + x, y0 + y);
    } else {
      ctx.lineTo(x0 + x, y0 + y);
    }
  }

  ctx.stroke();

  if (currentIteration < iterations) {
    currentIteration += 5; // Adjust this value to change the drawing speed
    animationId = requestAnimationFrame(() => drawSpirograph(outerRadius, innerRadius, offset, iterations, color));
  } else {
    // Start a new spirograph with slightly different parameters
    patternCount++;
    currentIteration = 0;
    const newOuterRadius = outerRadius + Math.sin(patternCount * 0.1) * 10;
    const newInnerRadius = innerRadius + Math.cos(patternCount * 0.1) * 5;
    const newOffset = offset + Math.sin(patternCount * 0.2) * 3;
    const newColor = `hsl(${patternCount * 10 % 360}, 100%, 50%)`;
    animationId = requestAnimationFrame(() => drawSpirograph(newOuterRadius, newInnerRadius, newOffset, iterations, newColor));
  }
}

function setDefaultValues() {
  document.getElementById("outerRadius").value = 200;
  document.getElementById("innerRadius").value = 100;
  document.getElementById("offset").value = 80;
  document.getElementById("iterations").value = 1000;
  document.getElementById("color").value = "#ff0000";
  
  startAnimation();
}

function startAnimation() {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }

  const outerRadius = parseInt(document.getElementById("outerRadius").value);
  const innerRadius = parseInt(document.getElementById("innerRadius").value);
  const offset = parseInt(document.getElementById("offset").value);
  const iterations = parseInt(document.getElementById("iterations").value);
  const color = document.getElementById("color").value;

  drawSpirograph(outerRadius, innerRadius, offset, iterations, color);
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  currentIteration = 0;
  patternCount = 0;
  isPlaying = false;
  updatePlayPauseButton();
}

function resizeCanvas() {
  const containerWidth = canvas.parentElement.clientWidth;
  const containerHeight = window.innerHeight - document.getElementById("controls").offsetHeight - 20;
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
  canvas.width = containerWidth;
  canvas.height = containerHeight;
  
  ctx.putImageData(imageData, 0, 0);
  
  if (isPlaying) {
    startAnimation();
  }
}

function togglePlayPause() {
  isPlaying = !isPlaying;
  if (isPlaying) {
    startAnimation();
  } else {
    cancelAnimationFrame(animationId);
  }
  updatePlayPauseButton();
}

function updatePlayPauseButton() {
  playPauseBtn.innerHTML = isPlaying
    ? '<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>'
    : '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
}

defaultBtn.addEventListener("click", setDefaultValues);
clearBtn.addEventListener("click", clearCanvas);
playPauseBtn.addEventListener("click", togglePlayPause);

inputs.forEach(input => {
  input.addEventListener('input', function() {
    if (isPlaying) {
      startAnimation();
    }
  });
});

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Initial setup
setDefaultValues();
updatePlayPauseButton();
