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

  let isTrailingEnabled = false; // New variable to toggle trailing
  let previewCanvas = document.createElement("canvas");
  let previewCtx = previewCanvas.getContext("2d");
  document.body.appendChild(previewCanvas);
  previewCanvas.style.position = "absolute";
  previewCanvas.style.pointerEvents = "none";

  function drawSpirograph(outerRadius, innerRadius, offset, baseColor, targetCtx, startIteration = 0) {
    const x0 = canvas.width / 2;
    const y0 = canvas.height / 2;

    targetCtx.beginPath();

    const radiusDiff = outerRadius - innerRadius;
    const radiusRatio = radiusDiff / innerRadius;

    const t = (startIteration / 1000) * Math.PI * 2;
    const x = radiusDiff * Math.cos(t) + offset * Math.cos(radiusRatio * t);
    const y = radiusDiff * Math.sin(t) - offset * Math.sin(radiusRatio * t);
    targetCtx.moveTo(x0 + x, y0 + y);

    for (let i = 0; i < 100; i++) {
      currentIteration++;
      const t = (currentIteration / 1000) * Math.PI * 2;
      const x = radiusDiff * Math.cos(t) + offset * Math.cos(radiusRatio * t);
      const y = radiusDiff * Math.sin(t) - offset * Math.sin(radiusRatio * t);

      const hue = (currentIteration / 10) % 360;
      targetCtx.strokeStyle = `hsl(${hue}, 100%, 50%)`;

      targetCtx.lineTo(x0 + x, y0 + y);
      targetCtx.stroke();
      targetCtx.beginPath();
      targetCtx.moveTo(x0 + x, y0 + y);
    }

    if (isPlaying && targetCtx === ctx) {
      animationId = requestAnimationFrame(() =>
        drawSpirograph(outerRadius, innerRadius, offset, baseColor, targetCtx)
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

  function startAnimation(preview = false) {
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

    const targetCtx = preview ? previewCtx : ctx;
    const targetCanvas = preview ? previewCanvas : canvas;

    if (!preview || !isTrailingEnabled) {
      targetCtx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
    }

    currentIteration = preview ? 0 : currentIteration;
    drawSpirograph(outerRadius, innerRadius, offset, baseColor, targetCtx, currentIteration);
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

    // Update preview canvas size and position
    previewCanvas.width = canvas.width;
    previewCanvas.height = canvas.height;
    previewCanvas.style.left = `${canvasRect.left}px`;
    previewCanvas.style.top = `${canvasRect.top}px`;

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

  function toggleTrailing() {
    isTrailingEnabled = !isTrailingEnabled;
    document.getElementById("trailingBtn").textContent = isTrailingEnabled ? "Disable Trailing" : "Enable Trailing";
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

  function addVisualizerToInput(inputId, visualizerFunction) {
    document.getElementById(inputId).addEventListener("input", function () {
      const outerRadius = parseFloat(
        document.getElementById("outerRadius").value
      );
      const innerRadius = parseFloat(
        document.getElementById("innerRadius").value
      );
      const offset = parseFloat(document.getElementById("offset").value);

      clearInterval(fadeOutInterval);
      clearTimeout(offsetVisualizerTimeout);

      visualizerFunction(outerRadius, innerRadius, offset, 1);
      startAnimation(true);

      offsetVisualizerTimeout = setTimeout(() => {
        let opacity = 1;

        fadeOutInterval = setInterval(() => {
          opacity -= 0.1;
          if (opacity <= 0) {
            clearInterval(fadeOutInterval);
            visualizerCtx.clearRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);
            previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
            if (isPlaying) {
              startAnimation();
            } else {
              drawSpirograph(outerRadius, innerRadius, offset, null, ctx, currentIteration);
            }
          } else {
            visualizerFunction(outerRadius, innerRadius, offset, opacity);
            previewCtx.globalAlpha = opacity;
            previewCtx.drawImage(previewCanvas, 0, 0);
          }
        }, 50);
      }, 1500);

      if (isPlaying) {
        startAnimation(true);
      }
    });
  }

  // Add visualizers to inputs
  addVisualizerToInput("outerRadius", drawOuterRadiusVisualizer);
  addVisualizerToInput("innerRadius", drawInnerRadiusVisualizer);
  addVisualizerToInput("offset", drawOffsetVisualizer);

  // Add trailing toggle button
  const trailingBtn = document.createElement("button");
  trailingBtn.id = "trailingBtn";
  trailingBtn.textContent = "Enable Trailing";
  trailingBtn.addEventListener("click", toggleTrailing);
  document.getElementById("controls").appendChild(trailingBtn);

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  // Initial setup
  setDefaultValues();
  updatePlayPauseButton();
});