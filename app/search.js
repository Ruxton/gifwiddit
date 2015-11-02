var ipc = require('ipc');
var searchInput = document.querySelector('.js-search')
var title = document.querySelector('h1')
var images = []

var searching = false

function search (query) {
  if (searching) {
    clearTimeout(searching)
  }
  if(query.trim() == '') {
    addImages(images)
  } else {
    searching = setTimeout(function () {
      var results = images.filter(function(image){
        return (image.keywords.match(query) && image)
      });
      addImages(results)
    }, 100)
  }
}

function addImage(element, index, array) {
  // var wrap = document.createElement("div");

  var elem = document.createElement("img");
  elem.setAttribute("src", element.url);
  elem.setAttribute("width", "100%");

  var wrap = document.createElement("a");
  wrap.setAttribute("class","wrapper");
  wrap.setAttribute("href","#");
  wrap.addEventListener("click",killEvent)
  wrap.addEventListener("dblclick",sendImageDblClick);

  var tags = document.createElement("p");
  tags.innerText = element.keywords

  wrap.appendChild(elem);
  wrap.appendChild(tags);


  document.getElementById('images').appendChild(wrap);
}

function killEvent(event) {
  event.preventDefault();
}

function sendImageDblClick(event) {
  var element = event.currentTarget.children[0];
  sendImage(element);
}

function sendImage(element) {
  ipc.send("url-to-clipboard",element.src);
}

function addImages(data) {
  var node = document.getElementById("images");
  var last;
  while (last = node.lastChild) node.removeChild(last);
  data.forEach(addImage)
}

searchInput.focus()
searchInput.addEventListener('input', function (event) {
  search(this.value)
})

document.getElementById('quit').addEventListener('click', function (event) {
  ipc.send("quit")
})

document.getElementById('open-config').addEventListener('click', function (event) {
  ipc.send("open-config")
})

document.addEventListener('keydown', function (event) {
  var node = document.getElementById("images")
  var first = node.querySelector('a.wrapper');
  if(event.keyCode == 38) {
    if(event.target.className.match('wrapper')) {
      element = event.target.previousSibling;
      element.focus();
      element.scrollIntoView();
      event.preventDefault();
    }
  } else if(event.keyCode == 40) {
    if(event.target.className.match('js-search')) {
      first.focus();
      event.preventDefault()
    } else if (event.target.className.match('wrapper')) {
      element = event.target.nextSibling;
      element.focus();
      element.scrollIntoView();
      event.preventDefault();
    }
  } else if(event.keyCode == 13 && event.target.className.match('wrapper')) {
    sendImage(event.target.children[0]);
  }
});


ipc.on('data-added', function(data) {
  images = data
  search('')
});

ipc.on('show', function () {
  searchInput.focus();
  window.scrollTo(0,0)
});
