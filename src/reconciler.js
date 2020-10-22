import { TEXT_ELEMENT } from "./vnode.js";
const EFFECT_TAGS = {
  UPDATE: "UPDATE",
  PLACEMENT: "PLACEMENT", // 创建
  DELETION: "DELETION",
};
// 简单的mount
// 只包含了element type 和 text
function createDom(fiber) {
  let dom = null;
  if (typeof fiber.type === "string") {
    // host
    dom = document.createElement(fiber.type);
  } else if (fiber.type === TEXT_ELEMENT) {
    dom = document.createTextNode("");
  }

  updateDom(dom, null, fiber.props);
  return dom;
}

function render(vnode, container) {
  // root fiber tree
  // work in progreess root,在内存中完成更新
  // 最终commit
  wipRoot = {
    dom: container,
    props: {
      children: [vnode],
    },
    alternate: currentRoot, // 引用old fiber
  };
  deletions = []; // init
  nextUnitOfWork = wipRoot;
}
let wipRoot = null;
let currentRoot = null;
let nextUnitOfWork = null;
let deletions = null;

// concurrrent mode
function workLoop(deadline) {
  console.log(" -- run workloop --");
  // console.log(deadline,deadline.timeRemaining())
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    // console.log(shouldYield)
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }
  if (!nextUnitOfWork && wipRoot) {
    // 处理完毕
    // patch真实dom
    commitRoot();
  }
  requestIdleCallback(workLoop);
}
requestIdleCallback(workLoop);

// 会返回next fiber
// 构造fiber树
function performUnitOfWork(fiber) {
  // add dom node
  // create new fibers
  // retuen next unit of work
  console.log("--- 处理单元 ---", fiber);
  if (isFunctionComponent(fiber)) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }

  if (fiber.child) {
    // 首先返回child
    return fiber.child;
  }
  let nextFiber = fiber;
  // 没有child了
  // 如果有邻居，返回sibling
  // 否则继续往parent寻找
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent; // 赋值parent后，寻找parent的sibling，因为parent已经处理过了
  }
}
// 这里进行diff
function reconcileChildren(wipFiber, elements) {
  let index = 0;
  let prevSibling = null;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child; // 上次渲染的children头
  // 创建子节点fiber
  while (index < elements.length || oldFiber != null) {
    console.log(oldFiber);
    const element = elements[index];
    // 开始比较fiber一致性
    let newFiber = null;
    const sameType = oldFiber && element && element.type === oldFiber.type;

    if (sameType) {
      // 更新数据
      newFiber = {
        type: element.type,
        props: element.props,
        parent: wipFiber,
        dom: oldFiber.dom,
        alternate: oldFiber,
        effectTag: EFFECT_TAGS.UPDATE,
      };
    }
    if (element && !sameType) {
      // 添加新节点
      newFiber = {
        type: element.type,
        props: element.props,
        parent: wipFiber,
        dom: null,
        alternate: null,
        effectTag: EFFECT_TAGS.PLACEMENT,
      };
    }
    if (oldFiber && !sameType) {
      // 移除旧节点
      oldFiber.effectTag = EFFECT_TAGS.DELETION;
      deletions.push(oldFiber);
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling; // 继续下一个
    }
    if (index === 0) {
      // 第一个child
      wipFiber.child = newFiber; // 相当于children head
    } else {
      // 有oldfiber无el时
      // debugger
      // if(prevSibling){
      //     prevSibling.sibling = newFiber;
      // }
      if (element) {
        prevSibling.sibling = newFiber;
      }
    }
    prevSibling = newFiber; // children
    index++;
  }
}

function commitRoot() {
  console.log("commit root");
  // 每次commit时，移除所有待删除节点
  deletions.forEach(commitWork);
  commitWork(wipRoot.child);
  // 保存上一次处理的fiber树
  currentRoot = wipRoot;
  wipRoot = null;
}
// start commit
function commitWork(fiber) {
  if (!fiber) {
    return;
  }
  let domParentFiber = fiber.parent; // 容器
  while (!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent;
  }
  const domParent = domParentFiber.dom; // 一直往parent找到带有dom的fiber
  // function组件的fiber是没有dom的

  if (fiber.effectTag === EFFECT_TAGS.PLACEMENT && fiber.dom) {
    console.log("appendChild to", domParent, fiber);
    domParent.appendChild(fiber.dom); // 将当前fiber的元素挂载
  } else if (fiber.effectTag === EFFECT_TAGS.DELETION) {
    // domParent.removeChild(fiber.dom); //删除
    // 删除旧dom的时候，也要找到带dom的fiber再删除
    commitDeletion(fiber, domParent);
  } else if (fiber.effectTag === EFFECT_TAGS.UPDATE && fiber.dom != null) {
    // update dom
    updateDom(
      fiber.dom /*old el*/,
      fiber.alternate.props /**old props */,
      fiber.props /**new props */
    );
  }

  commitWork(fiber.child); // 继续对child递归
  commitWork(fiber.sibling); // 没有子节点，递归兄弟节点
  // 整体来看，是个深度遍历
}

// 更新宿主环境元素（更新、创建）
function updateHostComponent(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  // 每次处理到这个fiber的时候，都会把dom插入进去
  // 在画完整个tree前，浏览器可能中断绘制过程
  // 用户会看到不完整的ui
  // 因此需要移除
  // if(fiber.parent){
  //     fiber.parent.dom.appendChild(fiber.dom)
  // }
  // 而在commitroot阶段处理所有dom的插入更新等
  const elements = fiber.props.children;
  reconcileChildren(fiber, elements);
}

// 删除
function commitDeletion(fiber, parentDom) {
  if (fiber.dom) {
    parentDom.removeChild(fiber.dom);
  } else {
    commitDeletion(fiber.child, parentDom);
  }
}
/**
 *
 * @param {string} name
 */
function isEventType(name) {
  return name.startsWith("on");
}
/**
 *
 * @param {string} name
 */
function isProperty(name) {
  if (name === "children") return false;
  if (isEventType(name)) return false;
  return true;
}
/**
 *
 * @param {HTMLElement} element
 * @param {*} oldProps
 * @param {*} nextProps
 */
function updateDom(element, oldProps, nextProps) {
  // console.log("--- update dom ---")
  oldProps = oldProps || {};
  nextProps = nextProps || {};
  let oldKeys = Object.keys(oldProps).filter(isProperty);
  let nextKeys = Object.keys(nextProps).filter(isProperty);

  for (let k1 of nextKeys) {
    element[k1] = nextProps[k1];
  }
  for (let k2 of oldKeys) {
    if (!nextKeys.includes(k2)) {
      element[k2] = "";
    }
  }
  //   针对事件处理
  let oldEventKeys = Object.keys(oldProps).filter(isEventType);
  let nextEventKeys = Object.keys(nextProps).filter(isEventType);

  for (let e1 of oldEventKeys) {
    if (!nextEventKeys.includes(e1) || nextProps[e1] !== oldProps[e1]) {
      // removed or changed
      element.removeEventListener(e1.substring(2).toLowerCase(), oldProps[e1]);
    }
  }
  for (let e2 of nextEventKeys) {
    //   new key
    if (nextProps[e2]) {
      element.addEventListener(e2.substring(2).toLowerCase(), nextProps[e2]);
    }
  }
}
function isFunctionComponent(fiber) {
  return fiber && fiber.type instanceof Function;
}

let wipFiber = null;
let hookIndex = null;
// 更新函数组件
function updateFunctionComponent(fiber) {
  // 每次更新fiber都重新初始化
  wipFiber = fiber;
  hookIndex = 0;
  wipFiber.hooks = []; // 缓存的上次hook值
  const children = [fiber.type(fiber.props)];
  reconcileChildren(fiber, children); // 处理children的diff情况
}
function useState(initialValue) {
  const oldHook =
    wipFiber.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex]; // 上次相同组件的hook值
    // new hook value
  const hook = {
    state : oldHook ? oldHook.state : initialValue ,// 新的hook的值，用于这次render用
    // 如果没有oldhook，则使用初始值
    // 第一次渲染后，第二次就会使用上次得到的值
    queue:[]
  }
  const actions = oldHook && oldHook.queue || []
  // 执行对state的处理
  actions.forEach(f=>{
    hook.state = typeof f === 'function' ? f(hook.state) : f
  })
  /**
   * 
   * @param {(oldVal:any)=>any} action 
   */
  function setState(action){
    hook.queue.push(action)
    // 从root重新更新？
    wipRoot = {
      dom:currentRoot.dom,
      props:currentRoot.props,
      alternate:currentRoot
    }
    // 更新
    nextUnitOfWork = wipRoot
    deletions = []
  }

  wipFiber.hooks.push(hook)
  hookIndex++
  
  return [hook.state,setState];
}
export { render, useState };
