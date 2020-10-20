import * as Didact from './OwnReact';
/** @jsx Didact.createElement */

function App(props) {
  return Didact.createElement("h1", null, "Hi ", props.name);
}

const element = Didact.createElement(App, {
  name: "foo"
});
const container = document.getElementById("root");
Didact.render(element, container);