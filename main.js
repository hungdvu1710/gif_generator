const { app, BrowserWindow,ipcMain } = require('electron')
const fetch = require('electron-fetch').default

async function getGifWithBtn(event,args){
  let xhr = await fetch(`http://api.giphy.com/v1/gifs/search?q=${args[0]}&api_key=jjkPZL63udWj11nnwd35vSYQk8YbV25g&limit=${args[1]}`).catch(console.log)
  const {data} = await xhr.json().catch(console.log)
  event.sender.send('returnGifBtn',data)
}

async function getGifWithScroll(event,args){
  let xhr = await fetch(`http://api.giphy.com/v1/gifs/search?q=${args[0]}&api_key=jjkPZL63udWj11nnwd35vSYQk8YbV25g&limit=${args[1]}`).catch(console.log)
  const {data} = await xhr.json().catch(console.log)
  event.sender.send('returnGifScroll',data)
}

function createWindow () {
  // Create the browser window.
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  win.loadFile('index.html')
  // Open the DevTools.
  win.webContents.openDevTools()
}

ipcMain.on('getGifWithBtn', (event, args) => {
  console.log(args)
  getGifWithBtn(event,args).catch(console.log)
})

ipcMain.on('getGifWithScroll', (event, args) => {
  console.log(args)
  getGifWithScroll(event,args).catch(console.log)
})

app.whenReady().then(createWindow)