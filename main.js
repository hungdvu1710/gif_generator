const { app, BrowserWindow,ipcMain } = require('electron')
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
  getGifWithBtn(event,args).catch(console.log)
})

ipcMain.on('getGifWithScroll', (event, args) => {
  getGifWithScroll(event,args).catch(console.log)
})

download().then(console.log).catch(console.log)
app.whenReady().then(createWindow)

async function download(){
  const url = 'https://p.bigstockphoto.com/eIdTXLbqQilMs9xbjvcs_bigstock-Aerial-View-Of-Sandy-Beach-Wit-256330393.jpg'
  // const url = 'https://media2.giphy.com/media/SpMPCMfa1L87m/giphy.gif?cid=34dce8657419f88bfdb4871287e8cd8049cc0c7c3d6f840f&rid=giphy.gif'
  const directory = path.resolve(__dirname,'downloads','test.jpg')

  const response = await axios({
    method: 'GET',
    url: url,
    responseType: 'stream'
  })

  response.data.pipe(fs.createWriteStream(directory))

  return new Promise((resolve,reject)=>{
    response.data.on('end', ()=>{
      resolve()
    })
    response.data.on('error', (e)=>{
      reject(e)
    })
  })
}

