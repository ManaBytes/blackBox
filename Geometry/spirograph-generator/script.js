const canvas = document.getElementById("spirographCanvas");
const ctx = canvas.getContext("2d");
const defaultBtn = document.getElementById("default");
const clearBtn = document.getElementById("clear");
const onRadio = document.getElementById("on");
const offRadio = document.getElementById("off");

const inputs = document.querySelectorAll('input[type="number"], input[type="color"]');

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

  currentIteration = 0;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawSpirograph(outerRadius, innerRadius, offset, iterations, color);
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  currentIteration = 0;
  offRadio.checked = true;
}

function resizeCanvas() {
  const containerWidth = canvas.parentElement.clientWidth;
  const containerHeight = window.innerHeight - document.getElementById("controls").offsetHeight - 20;
  
  canvas.width = containerWidth;
  canvas.height = containerHeight;
  
  if (onRadio.checked) {
    startAnimation();
  }
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

inputs.forEach(input => {
  input.addEventListener('input', function() {
    if (onRadio.checked) {
      startAnimation();
    }
  });
});

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Initial setup
setDefaultValues();
