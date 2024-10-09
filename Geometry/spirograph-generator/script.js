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
  let isUpdating = false;
  let fadeOutInterval;
  let offsetVisualizerTimeout;

  // Create a separate canvas for the visualizer
  const visualizerCanvas = document.createElement("canvas");
  document.body.appendChild(visualizerCanvas); // Add the visualizer canvas to the DOM
  visualizerCanvas.style.position = "absolute"; // Position it absolutely
  visualizerCanvas.style.pointerEvents = "none"; // Prevent it from intercepting mouse events

  const visualizerCtx = visualizerCanvas.getContext("2d");

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

  function drawVisualizer(outerRadius, innerRadius, offset, type, opacity = 1) {
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = visualizerCanvas.width;
    tempCanvas.height = visualizerCanvas.height;
    const tempCtx = tempCanvas.getContext("2d");

    const x0 = tempCanvas.width / 2;
    const y0 = tempCanvas.height / 2;

    tempCtx.globalAlpha = opacity;

    // Draw the outer circle
    tempCtx.beginPath();
    tempCtx.arc(x0, y0, outerRadius, 0, Math.PI * 2);
    tempCtx.strokeStyle = "rgba(200, 200, 200, 0.5)";
    tempCtx.stroke();

    // Draw the inner circle
    const innerX = x0 + (outerRadius - innerRadius);
    const innerY = y0;
    tempCtx.beginPath();
    tempCtx.arc(innerX, innerY, innerRadius, 0, Math.PI * 2);
    tempCtx.strokeStyle = "rgba(150, 150, 150, 0.5)";
    tempCtx.stroke();

    // Draw the offset line
    tempCtx.beginPath();
    tempCtx.moveTo(innerX, innerY);
    tempCtx.lineTo(innerX + offset, innerY);
    tempCtx.strokeStyle = "rgba(255, 0, 0, 0.7)";
    tempCtx.stroke();

    // Draw the tracing point
    tempCtx.beginPath();
    tempCtx.arc(innerX + offset, innerY, 3, 0, Math.PI * 2);
    tempCtx.fillStyle = "red";
    tempCtx.fill();

    // Highlight specific elements based on the type
    switch (type) {
      case "outer":
        tempCtx.strokeStyle = "rgba(0, 255, 0, 0.7)";
        tempCtx.beginPath();
        tempCtx.arc(x0, y0, outerRadius, 0, Math.PI * 2);
        tempCtx.stroke();
        break;
      case "inner":
        tempCtx.strokeStyle = "rgba(0, 0, 255, 0.7)";
        tempCtx.beginPath();
        tempCtx.arc(innerX, innerY, innerRadius, 0, Math.PI * 2);
        tempCtx.stroke();
        break;
      case "offset":
        // The offset is already highlighted in red
        break;
    }

    visualizerCtx.clearRect(
      0,
      0,
      visualizerCanvas.width,
      visualizerCanvas.height
    );
    visualizerCtx.drawImage(tempCanvas, 0, 0);
  }

  function drawOffsetVisualizer(outerRadius, innerRadius, offset, opacity = 1) {
    drawVisualizer(outerRadius, innerRadius, offset, "offset", opacity);
  }

  function drawOuterRadiusVisualizer(
    outerRadius,
    innerRadius,
    offset,
    opacity = 1
  ) {
    drawVisualizer(outerRadius, innerRadius, offset, "outer", opacity);
  }

  function drawInnerRadiusVisualizer(
    outerRadius,
    innerRadius,
    offset,
    opacity = 1
  ) {
    drawVisualizer(outerRadius, innerRadius, offset, "inner", opacity);
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

    const outerRadius = parseFloat(
      document.getElementById("outerRadius").value
    );
    const innerRadius = parseFloat(
      document.getElementById("innerRadius").value
    );
    const offset = parseFloat(document.getElementById("offset").value);
    const baseColor = document.getElementById("color").value;

    currentIteration = 0;
    // Don't clear the canvas here
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

    // Update visualizer canvas size and position
    visualizerCanvas.width = canvas.width;
    visualizerCanvas.height = canvas.height;
    const canvasRect = canvas.getBoundingClientRect();
    visualizerCanvas.style.left = `${canvasRect.left}px`;
    visualizerCanvas.style.top = `${canvasRect.top}px`;

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
      if (isUpdating) return;
      isUpdating = true;

      const wasPlaying = isPlaying; // Store the current play state

      if (isPlaying) {
        cancelAnimationFrame(animationId); // Pause the drawing
        isPlaying = false; // Update the play state
        updatePlayPauseButton(); // Update the play/pause button
      }

      setTimeout(() => {
        startAnimation();
        if (wasPlaying) {
          isPlaying = true; // Restore the play state
          startAnimation();
        }
        updatePlayPauseButton(); // Update the play/pause button on resume
        isUpdating = false;
      }, 500); // Adjust the delay time as needed
    });
  });

  function addVisualizerToInput(inputId, visualizerFunction) {
    document.getElementById(inputId).addEventListener("input", function () {
      const outerRadius = parseFloat(
        document.getElementById("outerRadius").value
      );
      const innerRadius = parseFloat(
        document.getElementById("innerRadius").value
      );
      const offset = parseFloat(document.getElementById("offset").value);

      // Clear any existing fade out interval
      clearInterval(fadeOutInterval);

      // Clear any existing timeout
      clearTimeout(offsetVisualizerTimeout);

      // Immediately draw the visualizer at full opacity
      visualizerFunction(outerRadius, innerRadius, offset, 1);

      // Set a new timeout for 1.5 seconds
      offsetVisualizerTimeout = setTimeout(() => {
        let opacity = 1;

        fadeOutInterval = setInterval(() => {
          opacity -= 0.1;
          if (opacity <= 0) {
            clearInterval(fadeOutInterval);
            // Clear the visualizer canvas
            visualizerCtx.clearRect(
              0,
              0,
              visualizerCanvas.width,
              visualizerCanvas.height
            );
            // Redraw spirograph only if it's playing
            if (isPlaying) {
              startAnimation();
            }
          } else {
            visualizerFunction(outerRadius, innerRadius, offset, opacity);
          }
        }, 50); // 20 steps over 1 second
      }, 1500); // Start fading after 1.5 seconds

      // If playing, update the animation
      if (isPlaying) {
        startAnimation();
      }
    });
  }

  // Add visualizers to inputs
  addVisualizerToInput("outerRadius", drawOuterRadiusVisualizer);
  addVisualizerToInput("innerRadius", drawInnerRadiusVisualizer);
  addVisualizerToInput("offset", drawOffsetVisualizer);

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  // Initial setup
  setDefaultValues();
  updatePlayPauseButton();
});
