// Kodi Skin Component Library - Estuary Components

const EstuaryComponents = {
  // Basic Controls
  button: {
    name: "Button",
    xmlStructure: `<control type="button">
      <left>0</left>
      <top>0</top>
      <width>300</width>
      <height>90</height>
      <align>center</align>
      <aligny>center</aligny>
      <font>font13</font>
      <textcolor>white</textcolor>
      <focusedcolor>blue</focusedcolor>
      <texturefocus colordiffuse="button_focus">buttons/button-fo.png</texturefocus>
      <texturenofocus>buttons/button-nofo.png</texturenofocus>
      <label>Button Text</label>
    </control>`,
    customizableProperties: [
      "left",
      "top",
      "width",
      "height",
      "label",
      "textcolor",
      "focusedcolor",
    ],
  },

  label: {
    name: "Label",
    xmlStructure: `<control type="label">
      <left>0</left>
      <top>0</top>
      <width>300</width>
      <height>40</height>
      <font>font13</font>
      <textcolor>grey</textcolor>
      <align>left</align>
      <aligny>center</aligny>
      <label>Label Text</label>
    </control>`,
    customizableProperties: [
      "left",
      "top",
      "width",
      "height",
      "label",
      "textcolor",
      "align",
    ],
  },

  image: {
    name: "Image",
    xmlStructure: `<control type="image">
      <left>0</left>
      <top>0</top>
      <width>300</width>
      <height>200</height>
      <texture>image.png</texture>
      <aspectratio>keep</aspectratio>
    </control>`,
    customizableProperties: [
      "left",
      "top",
      "width",
      "height",
      "texture",
      "aspectratio",
    ],
  },

  // Complex Controls
  list: {
    name: "List",
    xmlStructure: `<control type="list" id="50">
      <left>0</left>
      <top>0</top>
      <width>950</width>
      <height>700</height>
      <onleft>9000</onleft>
      <onright>60</onright>
      <onup>50</onup>
      <ondown>50</ondown>
      <viewtype label="535">list</viewtype>
      <pagecontrol>60</pagecontrol>
      <scrolltime>200</scrolltime>
      <itemlayout height="90" width="950">
        <control type="label">
          <left>30</left>
          <top>0</top>
          <width>900</width>
          <height>90</height>
          <font>font13</font>
          <textcolor>grey</textcolor>
          <selectedcolor>selected</selectedcolor>
          <label>$INFO[ListItem.Label]</label>
        </control>
      </itemlayout>
      <focusedlayout height="90" width="950">
        <control type="image">
          <left>0</left>
          <top>0</top>
          <width>950</width>
          <height>90</height>
          <texture colordiffuse="button_focus">lists/focus.png</texture>
          <visible>Control.HasFocus(50)</visible>
        </control>
        <control type="label">
          <left>30</left>
          <top>0</top>
          <width>900</width>
          <height>90</height>
          <font>font13</font>
          <textcolor>white</textcolor>
          <selectedcolor>selected</selectedcolor>
          <label>$INFO[ListItem.Label]</label>
        </control>
      </focusedlayout>
    </control>`,
    customizableProperties: [
      "left",
      "top",
      "width",
      "height",
      "onleft",
      "onright",
      "onup",
      "ondown",
    ],
  },

  // Layouts
  homeMenu: {
    name: "Home Menu",
    xmlStructure: `<include name="HomeMenu">
      <control type="grouplist" id="9000">
        <left>0</left>
        <top>110</top>
        <width>400</width>
        <height>700</height>
        <onleft>9000</onleft>
        <onright>50</onright>
        <onup>9000</onup>
        <ondown>9000</ondown>
        <itemgap>0</itemgap>
        <control type="button" id="1">
          <include>HomeMenuButton</include>
          <label>$LOCALIZE[31502]</label>
        </control>
        <control type="button" id="2">
          <include>HomeMenuButton</include>
          <label>$LOCALIZE[31503]</label>
        </control>
        <control type="button" id="3">
          <include>HomeMenuButton</include>
          <label>$LOCALIZE[31504]</label>
        </control>
      </control>
    </include>`,
    customizableProperties: ["left", "top", "width", "height"],
  },

  // Estuary-specific components
  weatherWidget: {
    name: "Weather Widget",
    xmlStructure: `<control type="group">
      <left>20</left>
      <top>20</top>
      <control type="image">
        <left>0</left>
        <top>0</top>
        <width>80</width>
        <height>80</height>
        <texture>$INFO[Weather.Conditions]</texture>
      </control>
      <control type="label">
        <left>90</left>
        <top>10</top>
        <width>300</width>
        <height>25</height>
        <label>$LOCALIZE[31050] $INFO[Weather.Temperature]</label>
        <font>font13</font>
      </control>
    </control>`,
    customizableProperties: ["left", "top"],
  },

  mediaInfoPanel: {
    name: "Media Info Panel",
    xmlStructure: `<control type="group">
      <left>20</left>
      <top>20</top>
      <control type="image">
        <left>0</left>
        <top>0</top>
        <width>300</width>
        <height>450</height>
        <texture>$INFO[ListItem.Art(poster)]</texture>
        <aspectratio>keep</aspectratio>
      </control>
      <control type="label">
        <left>320</left>
        <top>10</top>
        <width>600</width>
        <height>30</height>
        <label>$INFO[ListItem.Label]</label>
        <font>font14</font>
      </control>
      <control type="label">
        <left>320</left>
        <top>50</top>
        <width>600</width>
        <height>25</height>
        <label>$INFO[ListItem.Year]$INFO[ListItem.Duration, • , $LOCALIZE[12391]]</label>
        <font>font12</font>
      </control>
      <control type="textbox">
        <left>320</left>
        <top>100</top>
        <width>600</width>
        <height>150</height>
        <label>$INFO[ListItem.Plot]</label>
        <font>font12</font>
        <autoscroll time="3000" delay="4000" repeat="5000">true</autoscroll>
      </control>
    </control>`,
    customizableProperties: ["left", "top"],
  },

  // Functions to manipulate components
  createComponent: function (type, properties) {
    if (!this[type]) {
      throw new Error(`Component type '${type}' not found`);
    }

    let xml = this[type].xmlStructure;

    for (let prop in properties) {
      if (this[type].customizableProperties.includes(prop)) {
        const regex = new RegExp(`<${prop}>.*?</${prop}>`, "g");
        xml = xml.replace(regex, `<${prop}>${properties[prop]}</${prop}>`);
      }
    }

    return xml;
  },

  getAllComponentTypes: function () {
    return Object.keys(this).filter(
      (key) => typeof this[key] === "object" && this[key].name
    );
  },
};

// Example usage
console.log(
  EstuaryComponents.createComponent("button", {
    left: 50,
    top: 100,
    label: "Custom Button",
    textcolor: "yellow",
  })
);
console.log(EstuaryComponents.getAllComponentTypes());
