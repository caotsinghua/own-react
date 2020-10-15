import OwnReact from './OwnReact.js'
const container = document.getElementById("root")

const App = OwnReact.createElement('div',null,[
    OwnReact.createElement('h1',null,[
        OwnReact.createElement('p',null,'this is p'),
        OwnReact.createElement('a',{href:'#!'},'this is a')
    ]),
    OwnReact.createElement('h2',null,'this h2')
])

OwnReact.render(App,container)