const ipcRenderer = require('electron').ipcRenderer
const inputField = document.querySelector("#text-input")
const searchBtn = document.querySelector('#searchBtn')
let searchAmount = 8

searchBtn.addEventListener('click', () => {
  searchAmount = 8
  const input = [inputField.value.replace(/\s+/g, " ").split(" ").join("+"),searchAmount]
  ipcRenderer.send('getGifWithBtn',input)  
});

ipcRenderer.on('returnGifBtn', (event, args) => {
  const resultGifs = document.querySelector(".resultGif")

  while (resultGifs.hasChildNodes()) {
    resultGifs.removeChild(resultGifs.childNodes[0])
  }
  
  for(let i = args.length - 8; i<args.length;i++){
    const gifWrapper = document.createElement("DIV")
    const resGif = document.createElement("IMG")
    const source = args[i].images.original.url

    resGif.setAttribute("src",source)
    gifWrapper.appendChild(resGif)
    resultGifs.appendChild(gifWrapper)
  }
});

ipcRenderer.on('returnGifScroll', (event, args) => {
  const resultGifs = document.querySelector(".resultGif")
  
  for(let i = args.length - 8; i<args.length;i++){
    const gifWrapper = document.createElement("DIV")
    const resGif = document.createElement("IMG")
    const source = args[i].images.original.url

    resGif.setAttribute("src",source)
    gifWrapper.appendChild(resGif)
    resultGifs.appendChild(gifWrapper)
  }
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
