document.addEventListener("DOMContentLoaded", function () {
  const canvas = document.getElementById("spirographCanvas");
  const ctx = canvas.getContext("2d");
  const defaultBtn = document.getElementById("default");
  const clearBtn = document.getElementById("clearBtn");
  const playPauseBtn = document.getElementById("playPauseBtn");

  const inputs = document.querySelectorAll(
    'input[type="number"], input[type="color"]'
  );

  let animationId = null;
  let currentIteration = 0;
  let isPlaying = false;
  let isChangingOffset = false;
  let offsetVisualizerTimeout;

  function drawSpirograph(outerRadius, innerRadius, offset, baseColor) {
    const x0 = canvas.width / 2;
    const y0 = canvas.height / 2;

    ctx.beginPath();

    // Pre-calculate constant values
    const radiusDiff = outerRadius - innerRadius;
    const radiusRatio = radiusDiff / innerRadius;

    if (currentIteration === 0) {
      const t = 0;
      const x = radiusDiff * Math.cos(t) + offset * Math.cos(radiusRatio * t);
      const y = radiusDiff * Math.sin(t) - offset * Math.sin(radiusRatio * t);
      ctx.moveTo(x0 + x, y0 + y);
    }

    for (let i = 0; i < 100; i++) {
      // Draw 100 points per frame
      currentIteration++;
      const t = (currentIteration / 1000) * Math.PI * 2; // Adjust 1000 to change the density of the pattern
      const x = radiusDiff * Math.cos(t) + offset * Math.cos(radiusRatio * t);
      const y = radiusDiff * Math.sin(t) - offset * Math.sin(radiusRatio * t);

      // Calculate color based on currentIteration
      const hue = (currentIteration / 10) % 360;
      ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;

      ctx.lineTo(x0 + x, y0 + y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x0 + x, y0 + y);
    }

    if (isPlaying) {
      animationId = requestAnimationFrame(() =>
        drawSpirograph(outerRadius, innerRadius, offset, baseColor)
      );
    }
  }

  function drawOffsetVisualizer(outerRadius, innerRadius, offset) {
    const x0 = canvas.width / 2;
    const y0 = canvas.height / 2;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Redraw the spirograph
    ctx.putImageData(ctx.getImageData(0, 0, canvas.width, canvas.height), 0, 0);

    // Draw the outer circle
    ctx.beginPath();
    ctx.arc(x0, y0, outerRadius, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(200, 200, 200, 0.5)";
    ctx.stroke();

    // Draw the inner circle
    const innerX = x0 + (outerRadius - innerRadius);
    const innerY = y0;
    ctx.beginPath();
    ctx.arc(innerX, innerY, innerRadius, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(150, 150, 150, 0.5)";
    ctx.stroke();

    // Draw the offset line
    ctx.beginPath();
    ctx.moveTo(innerX, innerY);
    ctx.lineTo(innerX + offset, innerY);
    ctx.strokeStyle = "rgba(255, 0, 0, 0.7)";
    ctx.stroke();

    // Draw the tracing point
    ctx.beginPath();
    ctx.arc(innerX + offset, innerY, 3, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();
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

    if (!isChangingOffset) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    const outerRadius = parseFloat(
      document.getElementById("outerRadius").value
    );
    const innerRadius = parseFloat(
      document.getElementById("innerRadius").value
    );
    const offset = parseFloat(document.getElementById("offset").value);
    const baseColor = document.getElementById("color").value;

    currentIteration = 0;
    drawSpirograph(outerRadius, innerRadius, offset, baseColor);
  }

  function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    currentIteration = 0;
  }

  function resizeCanvas() {
    const containerWidth = canvas.parentElement.clientWidth;
    const containerHeight =
      window.innerHeight -
      document.getElementById("controls").offsetHeight -
      20;

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
    const playPauseBtn = document.getElementById("playPauseBtn");
    if (!playPauseBtn) return;

    if (isPlaying) {
      playPauseBtn.innerHTML = `
        <svg viewBox="0 0 24 24">
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
        </svg>
      `;
    } else {
      playPauseBtn.innerHTML = `
        <svg viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      `;
    }
  }

  defaultBtn.addEventListener("click", setDefaultValues);
  clearBtn.addEventListener("click", clearCanvas);
  playPauseBtn.addEventListener("click", togglePlayPause);

  inputs.forEach((input) => {
    input.addEventListener("input", function () {
      if (isPlaying) {
        startAnimation();
      }
    });
  });

  document.getElementById("offset").addEventListener("input", function () {
    const outerRadius = parseFloat(
      document.getElementById("outerRadius").value
    );
    const innerRadius = parseFloat(
      document.getElementById("innerRadius").value
    );
    const offset = parseFloat(this.value);

    isChangingOffset = true;
    drawOffsetVisualizer(outerRadius, innerRadius, offset);

    clearTimeout(offsetVisualizerTimeout);
    offsetVisualizerTimeout = setTimeout(() => {
      isChangingOffset = false;
      if (isPlaying) {
        startAnimation();
      }
    }, 500);

    if (isPlaying) {
      startAnimation();
    }
  });

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  // Initial setup
  setDefaultValues();
  updatePlayPauseButton();
});