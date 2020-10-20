import OwnReact from './OwnReact.js'
const container = document.getElementById("root")

const App = OwnReact.createElement('div',null,[
    OwnReact.createElement('h1',null,[
        OwnReact.createElement('p',null,'this is p'),
        OwnReact.createElement('a',{href:'#!'},'this is a')
    ]),
    OwnReact.createElement('h2',{
        onClick:()=>{
            alert("click h2")
        },
        style:"color:red"
    },'this h2')
])

const App2 = OwnReact.createElement('div',null,[
    OwnReact.createElement('h1',null,[
        // OwnReact.createElement('p',null,'this is p'),
        OwnReact.createElement('p',{
            style:"color:blue"
        },'this is p22'),
        // OwnReact.createElement('a',{href:'#!'},'this is a')
    ]),
    OwnReact.createElement('h2',{
        // onClick:()=>{
        //     alert("click h2")
        // },
        // style:"color:red"
    },'this h2')
])

OwnReact.render(App,container)
setTimeout(()=>{
    OwnReact.render(App2,container)
},2000)