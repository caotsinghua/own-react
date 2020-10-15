import { TEXT_ELEMENT } from "./vnode.js"

// 简单的mount 
// 只包含了element type 和 text
function createDom(fiber){
    let dom = null
    if(typeof fiber.type === 'string'){
        // host 
        dom = document.createElement(fiber.type)
    }else if(fiber.type === TEXT_ELEMENT){
        dom = document.createTextNode("")
    }
    function isProperty(name){
        return !['children'].includes(name)
    }
    Object.keys(fiber.props).filter(isProperty).forEach(name=>{
        dom[name] = fiber.props[name]
    })
    return dom
}

function render(vnode,container){
    // root fiber tree
    // work in progreess root
    wipRoot = {
        dom:container,
        props:{
            children:[vnode]
        }
    }
    nextUnitOfWork = wipRoot
}
let wipRoot = null
let nextUnitOfWork = null

let stop = 0

// concurrrent mode
function workLoop(deadline){
    
    console.log(" -- run workloop --")
    // console.log(deadline,deadline.timeRemaining())
    let shouldYield = false
    while(nextUnitOfWork && !shouldYield){
        // console.log(shouldYield)
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
        shouldYield = deadline.timeRemaining() < 1
    }
    requestIdleCallback(workLoop)
}
requestIdleCallback(workLoop)

// 会返回next fiber
function performUnitOfWork(fiber){
    stop++;
    // add dom node
    // create new fibers
    // retuen next unit of work
    console.log("--- 处理单元 ---",fiber)
    if(!fiber.dom){
        fiber.dom = createDom(fiber)
    }

    // 每次处理到这个fiber的时候，都会把dom插入进去
    // 在画完整个tree前，浏览器可能中断绘制过程
    // 用户会看到不完整的ui
    // 因此需要移除
    // if(fiber.parent){
    //     fiber.parent.dom.appendChild(fiber.dom)
    // }
    const elements = fiber.props.children;
    let index = 0
    let prevSibling = null
    // 创建子节点fiber
    while(index < elements.length){
        const element = elements[index]
        const newFiber = {
            type:element.type,
            props:element.props,
            parent:fiber,
            dom:null
        }
        if(index ===0){
            // 第一个child
            fiber.child = newFiber // 相当于children head
        }else{
            prevSibling.sibling = newFiber
        }
        prevSibling = newFiber // children
        index++
    }

    if(fiber.child){
        // 首先返回child
        return fiber.child
    }
    let nextFiber = fiber
    // 没有child了
    // 如果有邻居，返回sibling
    // 否则继续往parent寻找
    while(nextFiber){
        if(nextFiber.sibling){
            return nextFiber.sibling
        }
        nextFiber = nextFiber.parent // 赋值parent后，寻找parent的sibling，因为parent已经处理过了
    }

}
export {
    render
}