const ipcRenderer = require('electron').ipcRenderer
const inputField = document.querySelector("#text-input")
const searchBtn = document.querySelector('#searchBtn')
let searchAmount = 8
const resultGifs = document.querySelector(".resultGif")

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
    // let new_div = document.createElement("DIV")
    // new_div.innerText = "here"
    // console.log(document.scrollingElement.scrollTop)
    // document.querySelector(".resultGif").appendChild(new_div)
    searchAmount += 8
    const input = [inputField.value.replace(/\s+/g, " ").split(" ").join("+"),searchAmount]
    ipcRenderer.send('getGifWithScroll',input)  
  }
})
