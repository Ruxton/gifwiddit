var ipc = require('ipc');
var searchInput = document.querySelector('.js-search')
var title = document.querySelector('h1')
var images = []

var searching = false

function isCompatibleURL(str) {
  var pattern = /^https?:\/\/(?:[a-z0-9\-]+\.)+[a-z]{2,6}(?:\/[^\/#?]+)+\.(?:jpe?g|gif|png|bmp)$/i
  return pattern.test(str);
}

function search (query) {
  if (searching) {
    clearTimeout(searching)
  }
  if(query.trim() == '') {
    addImageResults(images)
  } else {
    searching = setTimeout(function () {
      var results = images.filter(function(image){
        return ((image.keywords.match(query) || image.url.match(query)) && image)
      });
      addImageResults(results)
      if(results.length == 0) {
        if(isCompatibleURL(query)) {
          setupAddNewImage(query);
        }
      }
    }, 100)
  }
}

function addToLibrary() {
  var url = searchInput.value
  var tags = document.getElementById('tags').value

  var obj = {
    'url': url,
    'keywords': tags
  }

  ipc.send("add-to-library",obj)
}

function setupAddNewImage(query) {
  var button = document.createElement("button")
  button.innerText = "Add to library.."
  button.setAttribute("id","add-to-library");
  button.setAttribute("onclick","addToLibrary()")

  var input = document.createElement("input")
  input.setAttribute("id","tags")
  input.setAttribute("type","text")

  var text1 = document.createElement("p")
  text1.innerText = "Enter tags "
  text1.appendChild(input)

  var text2 = document.createElement("p")
  text2.innerText = "Hit enter to "
  text2.appendChild(button)

  document.getElementById('images').appendChild(text1)
  document.getElementById('images').appendChild(text2)
}

function addImageResult(element, index, array) {
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

function addImageResults(data) {
  var node = document.getElementById("images");
  var last;
  while (last = node.lastChild) node.removeChild(last);
  data.forEach(addImageResult)
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
      killEvent(event)
    }
  } else if(event.keyCode == 40) {
    if(event.target.className.match('js-search')) {
      first.focus();
      killEvent(event)
    } else if (event.target.className.match('wrapper')) {
      element = event.target.nextSibling;
      element.focus();
      element.scrollIntoView();
      killEvent(event)
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
