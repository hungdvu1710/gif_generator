const { 
  app, 
  BrowserWindow,
  ipcMain,
  dialog,
  clipboard } = require('electron')
const fetch = require('electron-fetch').default
const fs = require('fs')
const path = require('path')
const axios = require('axios')
const pLimit = require('p-limit')

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
  win = new BrowserWindow({
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
  getGifWithBtn(event,args).catch(console.log)
})

ipcMain.on('getGifWithScroll', (event, args) => {
  getGifWithScroll(event,args).catch(console.log)
})

ipcMain.once('window-ready', () => {
  forwardClipboardContent()
})

ipcMain.on('clear-clipboard', ()=>{
  clipboard.clear()
})

ipcMain.on('invalid-input', ()=>{
  dialog.showMessageBox(win,{
    type: "error",
    message: "Invalid Input"
  }).catch(console.log)
})

ipcMain.on('no-item-to-download',()=>{
  dialog.showMessageBox(win,{
    type: "error",
    message: "No favorite items to download"
  }).catch(console.log)
})

ipcMain.on('export',(event,args)=>{
  dialog.showOpenDialog(win,{
    properties: ['openDirectory']
  }).then((data)=>{
    if(!data.filePaths[0]) return
    downloadAllFiles(data.filePaths[0],args)
      .then(() => {
        dialog.showMessageBox(win,{
          title: "Message",
          message: "Download Done"
        }).catch(console.log)
      })
      .catch(console.log)
  })
})

app.whenReady().then(createWindow)

function forwardClipboardContent(){
  if (win.isDestroyed()) return

  win.webContents.send('clipboard-updated', {
    text: clipboard.readText(),
  })

  setTimeout(forwardClipboardContent, 100)
}


const downloadOne = ({ url, filePath }) => {
  
  return new Promise(async (resolve, reject) => {
    const response = await axios({
      responseType: 'stream',
      method: 'GET',
      url: url,
    })

    const ws = fs.createWriteStream(filePath)
    ws.once('close', resolve)
    ws.once('error', reject)
    response.data.pipe(ws)
  })
}

function downloadAllFiles(folder, storage) {
  // const limit = pLimit(7)
  if(!folder) return
  const images = Object.keys(storage).map(imageKey => {
    const filePath = path.resolve(folder, `${imageKey}.gif`)

    return {
      filePath,
      url: storage[imageKey],
    }
  })

  return Promise.all(images.map(image => downloadOne(image)))
    .catch((e) => {console.info(e)})
}
