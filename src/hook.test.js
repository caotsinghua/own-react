import OwnReact from "./OwnReact.js";
/** @jsx OwnReact.createElement */
function App(props) {
  const [value, setValue] = OwnReact.useState(10);

  return (
    <div style="border:1px solid;">
      <p>{value}</p>
      <button
        onClick={() => {
          setValue(value + 1);
        }}
      >
        +1
      </button>
      <h1>{props.name}</h1>
    </div>
  );
}
const element = <App name="foo" />;
const container = document.getElementById("root");
OwnReact.render(element, container);
