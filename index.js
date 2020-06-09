const ipcRenderer = require('electron').ipcRenderer
const inputField = document.querySelector("#text-input")
const searchBtn = document.querySelector('#searchBtn')
const resultGifs = document.querySelector(".resultGif")
const favTab = document.querySelector("#favorites")
const searchTab = document.querySelector("#search")
const favPage = document.querySelector(".favoritesPage")
const searchPage = document.querySelector(".searchPage")
let searchAmount = 8

searchTab.addEventListener("click",switchToSearchPage)
favTab.addEventListener("click",switchToFavoritePage)

switchToSearchPage()

function switchToSearchPage(){
  searchPage.style.visibility = "visible"
  favPage.style.visibility = "hidden"
  // favPage.className = favPage.className.replace(" active","")
  // searchPage.className = searchPage.className.replace(" active","")
  // searchPage.className += " active"

  favTab.className = favTab.className.replace(" active","")
  searchTab.className = searchTab.className.replace(" active","")
  searchTab.className += " active"
}

function switchToFavoritePage(){
  searchPage.style.visibility = "hidden"
  favPage.style.visibility = "visible"
  // favPage.className = favPage.className.replace(" active","")
  // searchPage.className = searchPage.className.replace(" active","")
  // favPage.className += " active"

  favTab.className = favTab.className.replace(" active","")
  searchTab.className = searchTab.className.replace(" active","")
  favTab.className += " active"
}

searchBtn.addEventListener('click', () => {
  searchAmount = 8
  const input = [inputField.value.replace(/\s+/g, " ").split(" ").join("+"),searchAmount]
  ipcRenderer.send('getGifWithBtn',input)  
});

function addImg(args){
  for(let i = args.length - 8; i<args.length;i++){
    const gifWrapper = document.createElement("DIV")
    const resGif = document.createElement("IMG")
    const source = args[i].images.original.url

    gifWrapper.setAttribute("class","gifWrapper")
    resGif.setAttribute("src",source)
    gifWrapper.appendChild(resGif)
    resultGifs.appendChild(gifWrapper)
  }
}

ipcRenderer.on('returnGifBtn', (event, args) => {
  while (resultGifs.hasChildNodes()) {
    resultGifs.removeChild(resultGifs.childNodes[0])
  }
  
  addImg(args)
});

ipcRenderer.on('returnGifScroll', (event, args) => {
  addImg(args)
});

window.addEventListener("scroll", (e) => {
  if(document.scrollingElement.scrollTop + window.innerHeight >= document.body.clientHeight) {
    searchAmount += 8
    const input = [inputField.value.replace(/\s+/g, " ").split(" ").join("+"),searchAmount]
    ipcRenderer.send('getGifWithScroll',input)  
  }
})
