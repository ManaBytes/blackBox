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

  currentComponents.forEach((component) => {
    const xml = EstuaryComponents.createComponent(
      component.type,
      component.properties
    );
    xmlContent += xml + "\n\n";

    const previewElement = document.createElement("div");
    previewElement.className = `preview-component preview-${component.type}`;

    // Set position and size
    previewElement.style.left = `${component.properties.left || 0}px`;
    previewElement.style.top = `${component.properties.top || 0}px`;
    previewElement.style.width = `${component.properties.width || 100}px`;
    previewElement.style.height = `${component.properties.height || 50}px`;

    // Set content based on component type
    switch (component.type) {
      case "button":
      case "label":
        previewElement.textContent =
          component.properties.label || "Sample Text";
        break;
      case "image":
        previewElement.textContent = "Image";
        break;
      case "list":
        previewElement.textContent = "List";
        break;
      case "homeMenu":
        previewElement.textContent = "Home Menu";
        break;
      case "weatherWidget":
        previewElement.textContent = "Weather";
        break;
      case "mediaInfoPanel":
        previewElement.textContent = "Media Info";
        break;
    }

    previewDiv.appendChild(previewElement);
  });

  xmlOutput.value = xmlContent;
}

// Initialize
updateComponentProperties();
updatePreview();
