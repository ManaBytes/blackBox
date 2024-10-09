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
  let fadeOutInterval;

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
    visualizerCtx.clearRect(
      0,
      0,
      visualizerCanvas.width,
      visualizerCanvas.height
    );

    const x0 = visualizerCanvas.width / 2;
    const y0 = visualizerCanvas.height / 2;

    visualizerCtx.globalAlpha = opacity;

    // Draw the outer circle
    visualizerCtx.beginPath();
    visualizerCtx.arc(x0, y0, outerRadius, 0, Math.PI * 2);
    visualizerCtx.strokeStyle = "rgba(200, 200, 200, 0.5)";
    visualizerCtx.stroke();

    // Draw the inner circle
    const innerX = x0 + (outerRadius - innerRadius);
    const innerY = y0;
    visualizerCtx.beginPath();
    visualizerCtx.arc(innerX, innerY, innerRadius, 0, Math.PI * 2);
    visualizerCtx.strokeStyle = "rgba(150, 150, 150, 0.5)";
    visualizerCtx.stroke();

    // Draw the offset line
    visualizerCtx.beginPath();
    visualizerCtx.moveTo(innerX, innerY);
    visualizerCtx.lineTo(innerX + offset, innerY);
    visualizerCtx.strokeStyle = "rgba(255, 0, 0, 0.7)";
    visualizerCtx.stroke();

    // Draw the tracing point
    visualizerCtx.beginPath();
    visualizerCtx.arc(innerX + offset, innerY, 3, 0, Math.PI * 2);
    visualizerCtx.fillStyle = "red";
    visualizerCtx.fill();

    // Highlight specific elements based on the type
    switch (type) {
      case "outer":
        visualizerCtx.strokeStyle = "rgba(0, 255, 0, 0.7)";
        visualizerCtx.beginPath();
        visualizerCtx.arc(x0, y0, outerRadius, 0, Math.PI * 2);
        visualizerCtx.stroke();
        break;
      case "inner":
        visualizerCtx.strokeStyle = "rgba(0, 0, 255, 0.7)";
        visualizerCtx.beginPath();
        visualizerCtx.arc(innerX, innerY, innerRadius, 0, Math.PI * 2);
        visualizerCtx.stroke();
        break;
      case "offset":
        // The offset is already highlighted in red
        break;
    }
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

  let isUpdating = false;

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
            if (isPlaying) {
              startAnimation();
            } else {
              drawSpirograph(outerRadius, innerRadius, offset);
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
