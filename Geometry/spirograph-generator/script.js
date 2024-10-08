const canvas = document.getElementById("spirographCanvas");
const ctx = canvas.getContext("2d");
const defaultBtn = document.getElementById("default");
const clearBtn = document.getElementById("clear");
const playPauseBtn = document.getElementById("playPauseBtn");

const inputs = document.querySelectorAll('input[type="number"], input[type="color"]');

let animationId = null;
let currentIteration = 0;
let isPlaying = false;

function drawSpirograph(outerRadius, innerRadius, offset, baseColor) {
  const x0 = canvas.width / 2;
  const y0 = canvas.height / 2;
  
  ctx.beginPath();

  if (currentIteration === 0) {
    const t = 0;
    const x = (outerRadius - innerRadius) * Math.cos(t) + offset * Math.cos((outerRadius - innerRadius) * t / innerRadius);
    const y = (outerRadius - innerRadius) * Math.sin(t) - offset * Math.sin((outerRadius - innerRadius) * t / innerRadius);
    ctx.moveTo(x0 + x, y0 + y);
  }

  for (let i = 0; i < 100; i++) { // Draw 100 points per frame
    currentIteration++;
    const t = (currentIteration / 1000) * Math.PI * 2; // Adjust 1000 to change the density of the pattern
    const x = (outerRadius - innerRadius) * Math.cos(t) + offset * Math.cos((outerRadius - innerRadius) * t / innerRadius);
    const y = (outerRadius - innerRadius) * Math.sin(t) - offset * Math.sin((outerRadius - innerRadius) * t / innerRadius);
    
    // Calculate color based on currentIteration
    const hue = (currentIteration / 10) % 360;
    ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
    
    ctx.lineTo(x0 + x, y0 + y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x0 + x, y0 + y);
  }

  if (isPlaying) {
    animationId = requestAnimationFrame(() => drawSpirograph(outerRadius, innerRadius, offset, baseColor));
  }
}

function setDefaultValues() {
  document.getElementById("outerRadius").value = 200;
  document.getElementById("innerRadius").value = 100;
  document.getElementById("offset").value = 80;
  document.getElementById("color").value = "#ff0000";
  
  startAnimation();
}

function startAnimation() {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }

  const outerRadius = parseFloat(document.getElementById("outerRadius").value);
  const innerRadius = parseFloat(document.getElementById("innerRadius").value);
  const offset = parseFloat(document.getElementById("offset").value);
  const baseColor = document.getElementById("color").value;

  drawSpirograph(outerRadius, innerRadius, offset, baseColor);
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  currentIteration = 0;
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
