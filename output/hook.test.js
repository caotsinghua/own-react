import OwnReact from "./OwnReact.js";
/** @jsx OwnReact.createElement */

function App(props) {
  const [value, setValue] = OwnReact.useState(10);
  return OwnReact.createElement("div", {
    style: "border:1px solid;"
  }, OwnReact.createElement("p", null, value), OwnReact.createElement("button", {
    onClick: () => {
      setValue(value + 1);
    }
  }, "+1"), OwnReact.createElement("h1", null, props.name));
}

const element = OwnReact.createElement(App, {
  name: "foo"
});
const container = document.getElementById("root");
OwnReact.render(element, container);