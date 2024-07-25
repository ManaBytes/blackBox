// Initialize component select
const componentSelect = document.getElementById("componentSelect");
EstuaryComponents.getAllComponentTypes().forEach((type) => {
  const option = document.createElement("option");
  option.value = type;
  option.textContent = EstuaryComponents[type].name;
  componentSelect.appendChild(option);
});

// Global variable to store current components
let currentComponents = [];

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

  let currentTop = 20; // Start with some padding at the top

  currentComponents.forEach((component, index) => {
    const xml = EstuaryComponents.createComponent(
      component.type,
      component.properties
    );
    xmlContent += xml + "\n\n";

    const previewElement = document.createElement("div");
    previewElement.className = `preview-component preview-${component.type}`;

    // Set position and size
    const left = 20; // Fixed left margin
    const width = parseInt(component.properties.width) || 300;
    const height = parseInt(component.properties.height) || 50;

    previewElement.style.left = `${left}px`;
    previewElement.style.top = `${currentTop}px`;
    previewElement.style.width = `${width}px`;
    previewElement.style.height = `${height}px`;

    // Update currentTop for the next element
    currentTop += height + 20; // Add 20px margin between elements

    // Set content based on component type (same as before)
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

    previewDiv.appendChild(previewElement);
  });

  // Set the preview div's height to accommodate all components
  previewDiv.style.height = `${currentTop + 20}px`; // Add some padding at the bottom

  xmlOutput.value = xmlContent;
}

// Initialize
updateComponentProperties();
updatePreview();
