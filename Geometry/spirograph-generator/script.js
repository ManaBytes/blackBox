const canvas = document.getElementById("spirographCanvas");
const ctx = canvas.getContext("2d");
const generateBtn = document.getElementById("generate");
const defaultBtn = document.getElementById("default");

function drawSpirograph(outerRadius, innerRadius, offset, iterations, color) {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  for (let i = 0; i <= iterations; i++) {
    const t = (i / iterations) * Math.PI * 2;
    const x =
      (outerRadius - innerRadius) * Math.cos(t) +
      offset * Math.cos(((outerRadius - innerRadius) * t) / innerRadius);
    const y =
      (outerRadius - innerRadius) * Math.sin(t) -
      offset * Math.sin(((outerRadius - innerRadius) * t) / innerRadius);

    if (i === 0) {
      ctx.moveTo(centerX + x, centerY + y);
    } else {
      ctx.lineTo(centerX + x, centerY + y);
    }
  }

  ctx.stroke();
}

function setDefaultValues() {
  document.getElementById("outerRadius").value = 200;
  document.getElementById("innerRadius").value = 100;
  document.getElementById("offset").value = 80;
  document.getElementById("iterations").value = 1000;
  document.getElementById("color").value = "#ff0000";

  // Generate spirograph with default values
  handleGenerate();
}

function handleGenerate() {
  const outerRadius = parseInt(document.getElementById("outerRadius").value);
  const innerRadius = parseInt(document.getElementById("innerRadius").value);
  const offset = parseInt(document.getElementById("offset").value);
  const iterations = parseInt(document.getElementById("iterations").value);
  const color = document.getElementById("color").value;

  // Clear previous drawing
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw new spirograph
  drawSpirograph(outerRadius, innerRadius, offset, iterations, color);
}

generateBtn.addEventListener("click", handleGenerate);
defaultBtn.addEventListener("click", setDefaultValues);

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

// Initial draw with default values
setDefaultValues();
