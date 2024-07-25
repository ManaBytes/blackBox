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

  let maxRight = 0;
  let maxBottom = 0;

  currentComponents.forEach((component, index) => {
    const xml = EstuaryComponents.createComponent(
      component.type,
      component.properties
    );
    xmlContent += xml + "\n\n";

    const previewElement = document.createElement("div");
    previewElement.className = `preview-component preview-${component.type}`;

    // Set position and size
    const left = parseInt(component.properties.left) || 0;
    const top = parseInt(component.properties.top) || 0;
    const width = parseInt(component.properties.width) || 100;
    const height = parseInt(component.properties.height) || 50;

    previewElement.style.left = `${left}px`;
    previewElement.style.top = `${top}px`;
    previewElement.style.width = `${width}px`;
    previewElement.style.height = `${height}px`;

    // Update maxRight and maxBottom
    maxRight = Math.max(maxRight, left + width);
    maxBottom = Math.max(maxBottom, top + height);

    // Set content based on component type
    switch (component.type) {
      case "button":
        previewElement.textContent = component.properties.label || "Button";
        break;
      case "label":
        previewElement.textContent = component.properties.label || "Label";
        break;
      case "image":
        previewElement.innerHTML =
          '<div style="width: 100%; height: 100%; background: #555; display: flex; align-items: center; justify-content: center;">Image</div>';
        break;
      case "list":
        previewElement.innerHTML = `
                    <div style="padding: 5px; border-bottom: 1px solid rgba(255,255,255,0.3);">List Item 1</div>
                    <div style="padding: 5px; border-bottom: 1px solid rgba(255,255,255,0.3);">List Item 2</div>
                    <div style="padding: 5px;">List Item 3</div>
                `;
        break;
      case "homeMenu":
        previewElement.innerHTML = `
                    <div style="padding: 5px; border-bottom: 1px solid rgba(255,255,255,0.3);">Movies</div>
                    <div style="padding: 5px; border-bottom: 1px solid rgba(255,255,255,0.3);">TV Shows</div>
                    <div style="padding: 5px;">Music</div>
                `;
        break;
      case "weatherWidget":
        previewElement.innerHTML = `
                    <div style="font-size: 18px; margin-bottom: 5px;">☀️ 72°F</div>
                    <div>Sunny</div>
                `;
        break;
      case "mediaInfoPanel":
        previewElement.innerHTML = `
                    <div style="font-weight: bold; margin-bottom: 5px;">Movie Title</div>
                    <div>2023 | 2h 15min | Action, Adventure</div>
                    <div style="margin-top: 5px;">Director: John Doe</div>
                `;
        break;
    }

    previewDiv.appendChild(previewElement);
  });

  // Set the preview div's size to accommodate all components
  previewDiv.style.width = `${maxRight + 20}px`;
  previewDiv.style.height = `${maxBottom + 20}px`;

  xmlOutput.value = xmlContent;
}

// Initialize
updateComponentProperties();
updatePreview();
