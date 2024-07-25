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
    properties[prop] = ""; // Default empty value
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
  const previewDiv = document.getElementById("skinPreview");
  const xmlOutput = document.getElementById("xmlOutput");
  let xmlContent = "";

  currentComponents.forEach((component) => {
    const xml = EstuaryComponents.createComponent(
      component.type,
      component.properties
    );
    xmlContent += xml + "\n\n";
  });

  // For now, we'll just display the XML in the preview
  previewDiv.textContent = xmlContent;
  xmlOutput.value = xmlContent;
}

// Initialize
updateComponentProperties();
updatePreview();
