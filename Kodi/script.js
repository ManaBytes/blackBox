// Kodi Skin Creator - Main Script

// Global variables
let currentComponents = [];
let isEditMode = false;
let isDragging = false;
let draggedElement = null;
let offsetX, offsetY;

// Initialize component select
document.addEventListener("DOMContentLoaded", () => {
  const componentSelect = document.getElementById("componentSelect");
  EstuaryComponents.getAllComponentTypes().forEach((type) => {
    const option = document.createElement("option");
    option.value = type;
    option.textContent = EstuaryComponents[type].name;
    componentSelect.appendChild(option);
  });

  document
    .getElementById("toggleEditMode")
    .addEventListener("click", toggleEditMode);
  document.addEventListener("mousemove", drag);
  document.addEventListener("mouseup", stopDragging);
});

function addComponent() {
  const type = componentSelect.value;
  if (!type) return;

  const component = EstuaryComponents[type];
  const properties = {};
  component.customizableProperties.forEach((prop) => {
    properties[prop] = prop === "label" ? "Sample Text" : "0";
  });

  currentComponents.push({ type, properties });
  updateComponentProperties();
  updatePreview();
}

function updateComponentProperties() {
  const propertiesDiv = document.getElementById("componentProperties");
  propertiesDiv.innerHTML = "";

  currentComponents.forEach((component, index) => {
    const componentDiv = document.createElement("div");
    componentDiv.innerHTML = `<h3>${
      EstuaryComponents[component.type].name
    }</h3>`;

    EstuaryComponents[component.type].customizableProperties.forEach((prop) => {
      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = prop;
      input.value = component.properties[prop];
      input.oninput = (e) => {
        component.properties[prop] = e.target.value;
        updatePreview();
      };
      componentDiv.appendChild(input);
    });

    propertiesDiv.appendChild(componentDiv);
  });
}

function updatePreview() {
  const previewDiv = document.getElementById("visualPreview");
  const xmlOutput = document.getElementById("xmlOutput");
  let xmlContent = "";

  previewDiv.innerHTML = "";

  let currentTop = 20;
  let maxWidth = 300;

  currentComponents.forEach((component, index) => {
    const xml = EstuaryComponents.createComponent(
      component.type,
      component.properties
    );
    xmlContent += xml + "\n\n";

    const previewElement = document.createElement("div");
    previewElement.className = `preview-component preview-${component.type}`;
    previewElement.dataset.index = index;

    const left = parseInt(component.properties.left) || 20;
    const top = parseInt(component.properties.top) || currentTop;
    const width = parseInt(component.properties.width) || 300;
    const height = parseInt(component.properties.height) || 50;

    previewElement.style.left = `${left}px`;
    previewElement.style.top = `${top}px`;
    previewElement.style.width = `${width}px`;
    previewElement.style.height = `${height}px`;

    maxWidth = Math.max(maxWidth, width + left + 20);
    currentTop = Math.max(currentTop, top + height + 20);

    // Set content based on component type
    switch (component.type) {
      case "button":
        previewElement.innerHTML = `
          <div class="button-content">
            <div class="button-text">${
              component.properties.label || "Button"
            }</div>
          </div>
        `;
        break;
      case "label":
        previewElement.innerHTML = `
          <div class="label-content" style="color: ${
            component.properties.textcolor || "white"
          }; text-align: ${component.properties.align || "left"};">
            ${component.properties.label || "Label"}
          </div>
        `;
        break;
      case "image":
        previewElement.innerHTML = `
          <div class="image-content" style="background-image: url('/api/placeholder/${width}/${height}'); background-size: cover;">
          </div>
        `;
        break;
      case "list":
        previewElement.innerHTML = `
          <div class="list-content">
            <div class="list-item">List Item 1</div>
            <div class="list-item">List Item 2</div>
            <div class="list-item">List Item 3</div>
          </div>
        `;
        break;
      case "homeMenu":
        previewElement.innerHTML = `
          <div class="home-menu-content">
            <div class="menu-item">Movies</div>
            <div class="menu-item">TV Shows</div>
            <div class="menu-item">Music</div>
          </div>
        `;
        break;
      case "weatherWidget":
        previewElement.innerHTML = `
          <div class="weather-widget-content">
            <div class="weather-icon">☀️</div>
            <div class="weather-info">
              <div class="temperature">72°F</div>
              <div class="condition">Sunny</div>
            </div>
          </div>
        `;
        break;
      case "mediaInfoPanel":
        previewElement.innerHTML = `
          <div class="media-info-content">
            <div class="poster" style="background-image: url('/api/placeholder/150/225');"></div>
            <div class="info">
              <h3>Movie Title</h3>
              <p>2023 • 2h 15min</p>
              <p class="plot">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            </div>
          </div>
        `;
        break;
    }

    previewElement.addEventListener("mousedown", startDragging);
    previewDiv.appendChild(previewElement);
  });

  previewDiv.style.width = `${maxWidth}px`;
  previewDiv.style.height = `${currentTop + 20}px`;

  xmlOutput.value = xmlContent;
}

function toggleEditMode() {
  isEditMode = !isEditMode;
  document.getElementById("toggleEditMode").textContent = isEditMode
    ? "Exit Edit Mode"
    : "Enter Edit Mode";
  document.getElementById("visualPreview").classList.toggle("edit-mode");
}

function startDragging(e) {
  if (!isEditMode) return;
  isDragging = true;
  draggedElement = e.target.closest(".preview-component");
  offsetX = e.clientX - draggedElement.getBoundingClientRect().left;
  offsetY = e.clientY - draggedElement.getBoundingClientRect().top;
  draggedElement.style.zIndex = "1000";
}

function stopDragging() {
  if (!isDragging) return;
  isDragging = false;
  draggedElement.style.zIndex = "";
  const index = parseInt(draggedElement.dataset.index);
  currentComponents[index].properties.left = parseInt(
    draggedElement.style.left
  );
  currentComponents[index].properties.top = parseInt(draggedElement.style.top);
  draggedElement = null;
  updatePreview();
}

function drag(e) {
  if (!isDragging) return;
  const previewRect = document
    .getElementById("visualPreview")
    .getBoundingClientRect();
  let newLeft = e.clientX - previewRect.left - offsetX;
  let newTop = e.clientY - previewRect.top - offsetY;

  // Ensure the element stays within the preview area
  newLeft = Math.max(
    0,
    Math.min(newLeft, previewRect.width - draggedElement.offsetWidth)
  );
  newTop = Math.max(
    0,
    Math.min(newTop, previewRect.height - draggedElement.offsetHeight)
  );

  draggedElement.style.left = `${newLeft}px`;
  draggedElement.style.top = `${newTop}px`;
}

// Initialize
updateComponentProperties();
updatePreview();
