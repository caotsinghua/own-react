import { TEXT_ELEMENT } from "./vnode.js"
const EFFECT_TAGS = {
    UPDATE:'UPDATE',
    PLACEMENT:"PLACEMENT",// 创建
    DELETION:"DELETION" 
}
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
    // work in progreess root,在内存中完成更新
    // 最终commit
    wipRoot = {
        dom:container,
        props:{
            children:[vnode]
        },
        alternate:currentRoot // 引用old fiber
    }
    deletions = [] // init
    nextUnitOfWork = wipRoot
}
let wipRoot = null
let currentRoot = null
let nextUnitOfWork = null
let deletions = null

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
    if(!nextUnitOfWork && wipRoot){
        // 处理完毕
        // patch真实dom
        commitRoot()
    }
    requestIdleCallback(workLoop)
}
requestIdleCallback(workLoop)

// 会返回next fiber
// 构造fiber树
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
    reconcileChildren(fiber,elements)

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

function reconcileChildren(wipFiber,elements){
    let index = 0
    let prevSibling = null
    let oldFiber = wipFiber.alternate && wipFiber.alternate.child // 上次渲染的
    // 创建子节点fiber
    while(index < elements.length || oldFiber != null){
        const element = elements[index]
        // 开始比较fiber一致性
        let newFiber = null
        const sameType = oldFiber && element && element.type === oldFiber.type

        if(sameType){
            // 更新数据
            newFiber = {
                type:element.type,
                props:element.props,
                parent:wipFiber,
                dom:oldFiber.dom,
                alternate:oldFiber,
                effectTag:EFFECT_TAGS.UPDATE
            }
        }
        if(element && !sameType){
            // 添加新节点
            newFiber = {
                type:element.type,
                props:element.props,
                parent:wipFiber,
                dom:null,
                alternate:null,
                effectTag:EFFECT_TAGS.PLACEMENT
            }
        }
        if(oldFiber && !sameType){
            // 移除旧节点
            oldFiber.effectTag = EFFECT_TAGS.DELETION
            deletions.push(oldFiber)
        }
        
        if(index ===0){
            // 第一个child
            wipFiber.child = newFiber // 相当于children head
        }else{
            prevSibling.sibling = newFiber
        }
        prevSibling = newFiber // children
        index++
    }
}

function commitRoot(){
    // 移除所有节点
    deletions.forEach(commitWork)
    commitWork(wipRoot.child)
    // 保存上一次处理的fiber树
    currentRoot = wipRoot
    wipRoot = null
}
// start commit
function commitWork(fiber){
    if(!fiber){
        return;
    }
    const domParent = fiber.parent.dom // 容器
    domParent.appendChild(fiber.dom) // 将当前fiber的元素挂载
    commitWork(fiber.child) // 继续对child递归
    commitWork(fiber.sibling) // 没有子节点，递归兄弟节点
    // 整体来看，是个深度遍历
}

export {
    render
}