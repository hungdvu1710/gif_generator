const ipcRenderer = require('electron').ipcRenderer
const fs = require('fs')
const path = require('path')
const axios = require('axios')

const inputField = document.querySelector("#text-input")
const searchBtn = document.querySelector('#searchBtn')
const resultGifSearchPage = document.querySelector(".resultGif")
const favTab = document.querySelector("#favorites")
const searchTab = document.querySelector("#search")
const favPage = document.querySelector(".favoritesPage")
const searchPage = document.querySelector(".searchPage")
const exportBtn = document.querySelector("#export")

document.querySelector("form").addEventListener("submit", (e) => e.preventDefault())

let searchAmount = 8

exportBtn.addEventListener("click",handleExport)
searchTab.addEventListener("click",switchToSearchPage)
favTab.addEventListener("click",switchToFavoritePage)
inputField.addEventListener('focus',clearClipboard)
inputField.addEventListener('change',() => {
  searchAmount = 8
  const input = [inputField.value.replace(/\s+/g, " ").split(" ").join("+"),searchAmount]
  ipcRenderer.send('getGifWithBtn',input) 
  window.addEventListener("scroll", handleScroll)
})
searchBtn.addEventListener('click', ()=>{
  searchAmount = 8
  const input = [inputField.value.replace(/\s+/g, " ").split(" ").join("+"),searchAmount]
  ipcRenderer.send('getGifWithBtn',input) 
  window.addEventListener("scroll", handleScroll)
})

function handleExport(){
  if(!localStorage.length){
    ipcRenderer.send('no-item-to-download')
  }
  ipcRenderer.send('export',localStorage)
}

function clearClipboard(){
  ipcRenderer.send('clear-clipboard')
}

ipcRenderer.send('window-ready')

function switchToSearchPage(){
  favPage.className = favPage.className.replace(" active","")
  searchPage.className = searchPage.className.replace(" active","")
  searchPage.className += " active"

  favTab.className = favTab.className.replace(" active","")
  searchTab.className = searchTab.className.replace(" active","")
  searchTab.className += " active"
}

function switchToFavoritePage(){
  favPage.className = favPage.className.replace(" active","")
  searchPage.className = searchPage.className.replace(" active","")
  favPage.className += " active"

  favTab.className = favTab.className.replace(" active","")
  searchTab.className = searchTab.className.replace(" active","")
  favTab.className += " active"
}

ipcRenderer.on('returnGifBtn', (event, args) => {
  while (resultGifSearchPage.hasChildNodes()) {
    resultGifSearchPage.removeChild(resultGifSearchPage.childNodes[0])
  }
  addImgSearchPage(args)
});

ipcRenderer.on('export-request',handleExport)

ipcRenderer.on('returnGifScroll', (event, args) => {
  addImgSearchPage(args)
});

ipcRenderer.on('clipboard-updated', (_, clipboard) => {
  if(!clipboard.text) return

  if (inputField.value !== clipboard.text) {
    inputField.value = clipboard.text
  }
})

function addImgSearchPage(args){
  console.log(args)
  if(!args){
    ipcRenderer.send('invalid-input')
    return
  }
  if(!args[0]){
    ipcRenderer.send('invalid-input')
    return
  }
  if(args.length < 8 || args.length%8 != 0){
    for(let i = args.length - args.length%8; i<args.length;i++){
      addOneImgSearchPage(args[i])
    }
    ipcRenderer.send('out-of-results')
    window.removeEventListener('scroll', handleScroll)
    return
  }
  for(let i = args.length - 8; i<args.length;i++){
    addOneImgSearchPage(args[i])
  }
}

function addOneImgSearchPage(img){
  const gifWrapper = document.createElement("DIV")
  const gif = document.createElement("IMG")
  const source = img.images.original.url
  const {id} = img

  gifWrapper.setAttribute("style","background-image: url(loading.gif)") 
  gifWrapper.setAttribute("class","gifWrapper")
  gif.setAttribute("src",source)
  gif.setAttribute("id",id)
  gifWrapper.appendChild(gif)
  resultGifSearchPage.appendChild(gifWrapper)

  if(localStorage.getItem(id)){
    gif.setAttribute("class","favorited")
  }

  gif.addEventListener("click",handleFavoritedSearchPage)
}

function handleFavoritedSearchPage(){
  const id = this.id
  const url = this.src
  if(localStorage.getItem(id)) removeFavouriteInSearchPage(id,this)
  else addFavourite(id,url,this)
}

function removeFavouriteInSearchPage(id,tag){
  document.getElementById(`favPage_${id}`).parentNode.remove()
  localStorage.removeItem(id)
  tag.removeAttribute("class")
}

function addFavourite(id,url,tag){
  localStorage.setItem(id,url)
  tag.setAttribute("class","favorited")

  const gifWrapper = document.createElement("DIV")
  const gif = document.createElement("IMG")

  gifWrapper.setAttribute("class","gifWrapper")
  gif.setAttribute("src",url)
  gif.setAttribute("id",`favPage_${id}`)
  gifWrapper.appendChild(gif)
  document.querySelectorAll(".resultGif")[1].appendChild(gifWrapper)

  gif.addEventListener("click",removeFavoritedInFavPage)
}

const FETCH_CD_MS = 1000
let lastFetched = 0

function handleScroll(){
  if(favPage.className === "favoritesPage active") return

  if(document.scrollingElement.scrollTop + window.innerHeight >= document.body.clientHeight) {
    if(Date.now() - lastFetched < FETCH_CD_MS)  return

    lastFetched = Date.now()
    searchAmount += 8

    const input = [inputField.value.replace(/\s+/g, " ").split(" ").join("+"),searchAmount]
    ipcRenderer.send('getGifWithScroll',input)  
  }
}

function addImgFavPage(){
  for(let imageKey of Object.keys(localStorage)){
    if(document.getElementById(`${imageKey}`)){
      document.getElementById(`#${imageKey}`).setAttribute("class","favorited")
    }
    if(document.querySelectorAll(".resultGif")[1].contains(document.querySelector(`#wrapper_${imageKey}`))) continue

    const gifWrapper = document.createElement("DIV")
    const gif = document.createElement("IMG")
    const source = localStorage.getItem(imageKey)

    gifWrapper.setAttribute("class","gifWrapper")
    gif.setAttribute("src",source)
    gif.setAttribute("id",`favPage_${imageKey}`)
    gifWrapper.appendChild(gif)
    gifWrapper.setAttribute("id",`wrapper_${imageKey}`)
    document.querySelectorAll(".resultGif")[1].appendChild(gifWrapper)
    
    gif.addEventListener("click",removeFavoritedInFavPage)
  }
}

function removeFavoritedInFavPage(){
  const id = this.id
  const gifId = id.substring(8)

  if(document.getElementById(`${gifId}`)){
    document.getElementById(`${gifId}`).removeAttribute("class")
  }
  localStorage.removeItem(gifId)
  this.parentNode.remove()
}

//load search page first when we start the app
switchToSearchPage()
//preload every favorite images
addImgFavPage()