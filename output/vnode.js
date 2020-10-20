const tNode = {
  type: "div",
  props: {
    key: 0,
    ref: {},
    style: "",
    className: "",
    customAttr: "",
    children: []
  }
};
export const TEXT_ELEMENT = Symbol.for("text_element");
export function createElement(type, config, ...children) {
  const node = {
    type,
    props: { ...config,
      children: children.map(item => {
        return typeof item === "object" ? item : createTextElement(item);
      })
    }
  };
  return node;
}

function createTextElement(text) {
  const node = {
    type: TEXT_ELEMENT,
    props: {
      nodeValue: text,
      children: []
    }
  };
  return node;
}