const canvas = document.getElementById("spirographCanvas");
const ctx = canvas.getContext("2d");
const defaultBtn = document.getElementById("default");
const clearBtn = document.getElementById("clear");
const onRadio = document.getElementById("on");
const offRadio = document.getElementById("off");

let animationId = null;
let currentIteration = 0;

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
  }
}

function setDefaultValues() {
  document.getElementById("outerRadius").value = 200;
  document.getElementById("innerRadius").value = 100;
  document.getElementById("offset").value = 80;
  document.getElementById("iterations").value = 1000;
  document.getElementById("color").value = "#ff0000";
  
  if (onRadio.checked) {
    startAnimation();
  }
}

function startAnimation() {
  // Stop any ongoing animation
  if (animationId) {
    cancelAnimationFrame(animationId);
  }

  const outerRadius = parseInt(document.getElementById("outerRadius").value);
  const innerRadius = parseInt(document.getElementById("innerRadius").value);
  const offset = parseInt(document.getElementById("offset").value);
  const iterations = parseInt(document.getElementById("iterations").value);
  const color = document.getElementById("color").value;

  // Reset iteration counter
  currentIteration = 0;

  // Start new animation
  drawSpirograph(outerRadius, innerRadius, offset, iterations, color);
}

function clearCanvas() {
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Stop any ongoing animation
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  
  // Reset iteration counter
  currentIteration = 0;
  
  // Set radio button to "Off"
  offRadio.checked = true;
}

defaultBtn.addEventListener("click", setDefaultValues);
clearBtn.addEventListener("click", clearCanvas);

onRadio.addEventListener("change", function() {
  if (this.checked) {
    startAnimation();
  }
});

offRadio.addEventListener("change", function() {
  if (this.checked && animationId) {
    cancelAnimationFrame(animationId);
  }
});

// Set initial canvas size
function resizeCanvas() {
  canvas.width = window.innerWidth * 0.8;
  canvas.height = window.innerHeight * 0.6;
}

resizeCanvas();

// Redraw on window resize
window.addEventListener("resize", () => {
  resizeCanvas();
  handleGenerate();
});

// Initial setup
setDefaultValues();
