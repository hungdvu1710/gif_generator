const ipcRenderer = require('electron').ipcRenderer
const inputField = document.querySelector("#text-input")
const searchBtn = document.querySelector('#searchBtn')
const resultGifs = document.querySelector(".resultGif")
const favTab = document.querySelector("#favorites")
const searchTab = document.querySelector("#search")
const favPage = document.querySelector(".favoritesPage")
const searchPage = document.querySelector(".searchPage")

let searchAmount = 10
let favoriteCount = 0 

searchTab.addEventListener("click",switchToSearchPage)
favTab.addEventListener("click",switchToFavoritePage)

switchToSearchPage()

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

searchBtn.addEventListener('click', () => {
  searchAmount = 8
  const input = [inputField.value.replace(/\s+/g, " ").split(" ").join("+"),searchAmount]
  ipcRenderer.send('getGifWithBtn',input)  
});

function addImgSearchPage(args){
  for(let i = args.length - 8; i<args.length;i++){
    const gifWrapper = document.createElement("DIV")
    const gif = document.createElement("IMG")
    const source = args[i].images.original.url
    const {id} = args[i]

    gifWrapper.setAttribute("class","gifWrapper")
    gif.setAttribute("src",source)
    gif.setAttribute("id",id)
    gifWrapper.appendChild(gif)
    resultGifs.appendChild(gifWrapper)

    gif.addEventListener("click",handleFavoritedSearchPage)
  }
}
function handleFavoritedSearchPage(){
  const id = this.id
  const url = this.src
  if(localStorage.getItem(id)) removeFavourite(id,this)
  else addFavourite(id,url,this)
}

function removeFavourite(id,tag){
  document.querySelector(`#favPage_${id}`).parentNode.remove()
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
  favPage.appendChild(gifWrapper)

  gif.addEventListener("click",removeFavoritedFavPage)
}

ipcRenderer.on('returnGifBtn', (event, args) => {
  while (resultGifs.hasChildNodes()) {
    resultGifs.removeChild(resultGifs.childNodes[0])
  }
  
  addImgSearchPage(args)
  addImgFavPage()
});

ipcRenderer.on('returnGifScroll', (event, args) => {
  addImgSearchPage(args)
});

const FETCH_CD_MS = 1000
let lastFetched = 0

window.addEventListener("scroll", (e) => {
  if(document.scrollingElement.scrollTop + window.innerHeight >= document.body.clientHeight) {
    if(Date.now() - lastFetched < FETCH_CD_MS)  return
    lastFetched = Date.now()

    searchAmount += 8
    const input = [inputField.value.replace(/\s+/g, " ").split(" ").join("+"),searchAmount]
    ipcRenderer.send('getGifWithScroll',input)  
  }
})

function addImgFavPage(){
  for(let imageKey of Object.keys(localStorage)){
    const gifWrapper = document.createElement("DIV")
    const gif = document.createElement("IMG")
    const source = localStorage.getItem(imageKey)

    gifWrapper.setAttribute("class","gifWrapper")
    gif.setAttribute("src",source)
    gif.setAttribute("id",`favPage_${imageKey}`)
    gifWrapper.appendChild(gif)
    favPage.appendChild(gifWrapper)

    if(document.querySelector(`#${imageKey}`)){
      document.querySelector(`#${imageKey}`).setAttribute("class","favorited")
    }
    
    gif.addEventListener("click",removeFavoritedFavPage)
  }
}

function removeFavoritedFavPage(){
  const id = this.id
  const gifId = id.substring(8)
  document.querySelector(`#${gifId}`).removeAttribute("class")
  localStorage.removeItem(gifId)
  this.parentNode.remove()
}