const searchBox = document.querySelector(".city-input input");
const projectName = document.querySelector(".welcome-text");
const middleWrap = document.querySelector(".middle-wrap");
const locationName = document.querySelector(".location-timezone");

const temperatureDescription = document.querySelector(
  ".temperature-description"
);
const temperatureDegree = document.querySelector(".temperature-degree");
const temperatureSection = document.querySelector(".temperature-section");
const temperatureSpan = document.querySelector(".temperature-section span");

let typingTimer; //timer identifier
let doneTypingInterval = 500; //time in ms (5 seconds)
let arr = [];

function searchForLocations() {
  var a,
    b,
    i,
    val = searchBox.value;
  /*close any already open lists of autocompleted values*/
  closeAllLists();
  if (!val) {
    return false;
  }
  currentFocus = -1;
  /*create a DIV element that will contain the items (values):*/
  a = document.createElement("DIV");
  a.setAttribute("id", searchBox.id + "autocomplete-list");
  a.setAttribute("class", "autocomplete-items");
  /*append the DIV element as a child of the autocomplete container:*/
  searchBox.parentNode.appendChild(a);
  /*for each item in the array...*/
  for (i = 0; i < arr.length; i++) {
    /*check if the item starts with the same letters as the text field value:*/
    if (arr[i].text.substr(0, val.length).toUpperCase() == val.toUpperCase()) {
      /*create a DIV element for each matching element:*/
      b = document.createElement("DIV");
      /*make the matching letters bold:*/
      b.innerHTML =
        "<strong>" + arr[i].text.substr(0, val.length) + "</strong>";
      b.innerHTML += arr[i].text.substr(val.length);
      /*insert a input field that will hold the current array item's value:*/
      b.innerHTML += "<input type='hidden' value='" + arr[i].text + "'>";
      /*execute a function when someone clicks on the item value (DIV element):*/
      b.addEventListener("click", function(e) {
        /*insert the value for the autocomplete text field:*/
        searchBox.value = this.getElementsByTagName("input")[0].value;
        getWeather();
        /*close the list of autocompleted values,
              (or any other open lists of autocompleted values:*/
        closeAllLists();
      });
      a.appendChild(b);
    }
  }
}

/*the autocomplete function takes two arguments,
  the text field element and an array of possible autocompleted values:*/
var currentFocus;
/*execute a function when someone writes in the text field:*/
searchBox.addEventListener("input", e => {
  closeAllLists();
  clearTimeout(typingTimer);
  if (searchBox.value) {
    typingTimer = setTimeout(() => search(e), doneTypingInterval);
  }
});

/*execute a function presses a key on the keyboard:*/
searchBox.addEventListener("keydown", function(e) {
  var x = document.getElementById(this.id + "autocomplete-list");
  if (x) x = x.getElementsByTagName("div");
  if (e.keyCode == 40) {
    /*If the arrow DOWN key is pressed,
        increase the currentFocus variable:*/
    currentFocus++;
    /*and and make the current item more visible:*/
    addActive(x);
  } else if (e.keyCode == 38) {
    //up
    /*If the arrow UP key is pressed,
        decrease the currentFocus variable:*/
    currentFocus--;
    /*and and make the current item more visible:*/
    addActive(x);
  } else if (e.keyCode == 13) {
    /*If the ENTER key is pressed, prevent the form from being submitted,*/
    e.preventDefault();
    if (currentFocus > -1) {
      /*and simulate a click on the "active" item:*/
      if (x) x[currentFocus].click();

      // call the weather function
      getWeather();
    }
  }
});
function addActive(x) {
  /*a function to classify an item as "active":*/
  if (!x) return false;
  /*start by removing the "active" class on all items:*/
  removeActive(x);
  if (currentFocus >= x.length) currentFocus = 0;
  if (currentFocus < 0) currentFocus = x.length - 1;
  /*add class "autocomplete-active":*/
  x[currentFocus].classList.add("autocomplete-active");
}
function removeActive(x) {
  /*a function to remove the "active" class from all autocomplete items:*/
  for (var i = 0; i < x.length; i++) {
    x[i].classList.remove("autocomplete-active");
  }
}
function closeAllLists(elmnt) {
  /*close all autocomplete lists in the document,
    except the one passed as an argument:*/
  var x = document.getElementsByClassName("autocomplete-items");
  for (var i = 0; i < x.length; i++) {
    if (elmnt != x[i] && elmnt != searchBox) {
      x[i].parentNode.removeChild(x[i]);
    }
  }
}
/*execute a function when someone clicks in the document:*/
document.addEventListener("click", function(e) {
  closeAllLists(e.target);
});

const listResult = data => {
  const result = data.results.map(item => {
    return {
      mgrs: item.annotations.MGRS,
      text: item.formatted,
      geometry: item.geometry
    };
  });
  arr = result;
};

const search = e => {
  const src = e.target.value;
  fetch(
    `https://api.opencagedata.com/geocode/v1/json?q=${src}&key=059a3fd1806f46b69d55a4ec4bec4943`
  )
    .then(response => {
      return response.json();
    })
    .then(data => {
      listResult(data);
      searchForLocations();
    });
};

function getWeather() {
  const text = searchBox.value;
  const el = arr.find(item => item.text === text);

  if (el) {
    const lat = el.geometry.lat;
    const lng = el.geometry.lng;

    const proxy = "https://cors-anywhere.herokuapp.com/";
    // const proxy = "";

    const api = `${proxy}https://api.darksky.net/forecast/d98e42d4e7143b4bcc558ce699d5bfac/${lat},${lng}`;
    middleWrap.classList.add("slide-left");
    fetch(api)
      .then(response => {
        return response.json();
      })
      .then(data => {
        const { currently } = data;
        const { temperature, summary, icon } = currently;

        const celsius = ((temperature - 32) * (5 / 9)).toFixed(1);

        // Set the results
        locationName.textContent = el.text;
        temperatureDegree.textContent = celsius;
        temperatureDescription.textContent = summary;

        // Set icon
        setIcons(icon, document.querySelector(".icon"));
      });
  }

  function setIcons(icon, iconID) {
    const skycons = new Skycons({ color: "white" });
    const currentIcon = icon.replace(/-/g, "_").toUpperCase();
    skycons.play();
    return skycons.set(iconID, Skycons[currentIcon]);
  }
}
