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
  let folder
  dialog.showOpenDialog(win,{
    properties: ['openDirectory']
  }).then((data)=>{
    download(data.filePaths[0],args).then(console.log("Download Done")).catch(console.log)
    console.log(data.canceled)
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

async function download(folder,storage){
  console.log(storage)
  const downloadUnit = await Promise.all(Object.keys(storage).map((imageKey)=>{
    const url = storage[imageKey]
    const directory = path.resolve(folder,`${imageKey}.gif`)
    return axios({
      method: 'GET',
      url: url,
      responseType: 'stream'
    })
  })).then((response) => {
    response.data.pipe(fs.createWriteStream(directory))
  }).catch((e) => {console.log(e)})
  
  // for(let imageKey of Object.keys(storage)){
  //   const url = storage[imageKey]
  // }
  // // const url = 'https://p.bigstockphoto.com/eIdTXLbqQilMs9xbjvcs_bigstock-Aerial-View-Of-Sandy-Beach-Wit-256330393.jpg'
  // const url = 'https://media2.giphy.com/media/SpMPCMfa1L87m/giphy.gif?cid=34dce8657419f88bfdb4871287e8cd8049cc0c7c3d6f840f&rid=giphy.gif'
  // const directory = path.resolve(folder,'test.gif')

  // const response = await axios({
  //   method: 'GET',
  //   url: url,
  //   responseType: 'stream'
  // })

  // response.data.pipe(fs.createWriteStream(directory))

  return new Promise((resolve,reject)=>{
    downloadUnit.data.on('end', ()=>{
      resolve()
    })
    downloadUnit.data.on('error', (e)=>{
      reject(e)
    })
  })
}

