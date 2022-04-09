var searchForm = document.querySelector("#search-form");
var inputCity = document.querySelector("#city");
var searchHistory = document.querySelector("#search-history");
var currentHeader = document.querySelector("#current-header");
var currentInfo = document.querySelector("#current-info");
var currentDisplay = document.querySelector("#current-display");
var forecastHeader = document.querySelector("#forecast-header");
var forecastCards = document.querySelector("#forecast-cards");
var forecastDisplay = document.querySelector("#forecast");
var recentSearches = JSON.parse(localStorage.getItem("recentSearches")) || [];

// clear old data from right column
var clearData = function() {
    if (!currentHeader) {
        return;
    } else {
        currentHeader.innerHTML = "";
        currentDisplay.innerHTML = "";
    }

    // clear old forecast content
    if (!forecastHeader || !forecastCards) {
        return;
    } else {
        forecastHeader.textContent = "";
        forecastCards.textContent = "";
    }
};

// search form submission
var searchHandler = function(event) {
    event.preventDefault();
    
    clearData();

    // call function to display city name from search input
    if (inputCity.value === "" || null) {
        return;
    } else {
        displayCityDate(inputCity.value);
    }

    getInput();
};

var getInput = function() {
    // get value from form input
    var city = inputCity.value.trim();

    saveSearch(city);

    // need to add data validation for format of search "city, state, country"
    if (city) {
        getLatLon(city);
        inputCity.value = "";
    } else {
        alert("Please enter a city, state, country.")
    }
};

// convert city, state, country to lat/lon
var getLatLon = function(city) {
    clearData();
    displayCityDate(city);

    // remove all spaces
    var cityStripped = city.toLowerCase();

    // geocoding API conversion
    var getCityDetails = "https://api.openweathermap.org/geo/1.0/direct?q=" + cityStripped + "&limit=1&appid=de32c757cea9effb35738161a8ff5e9a";

    fetch(getCityDetails)
    .then(function(response) {
        // 
        if (response.ok) {
            response.json().then(function(getCityDetails) {
                getWeatherData(getCityDetails);
            });
        } else {
            alert("Error: City not found. Please make sure to format your search as 'city, state, country'. Example 'denver, co, usa'.");
        }
    }).catch(function(error) {
        alert("Unable to connect to Open Weather Map")
    });
};

//get data from weather API
var getWeatherData = function(cityDetails) {
    var lat = cityDetails[0].lat;
    var lon = cityDetails[0].lon;

    // format api url
    var apiUrl = "https://api.openweathermap.org/data/2.5/onecall?lat="+ lat + "&lon=" + lon + "&exclude=minutely,hourly&units=imperial&appid=de32c757cea9effb35738161a8ff5e9a";

    // make a request to the url
    fetch(apiUrl)
    .then(function(response) {
        // if response successful
        if (response.ok) {
            response.json().then(function(data) {
                displaycurrentInfo(data);
                displayForecast(data);
            });
        // if response fail
        } else {
            alert("Error: Weather data not found.");
        }
        // if network fail
    }).catch(function(error) {
        alert("Unable to connect")
    });
};

// display city name
var displayCityDate = function(city) {
    // display city name as h2 within
    var displayCity = document.createElement("h2");
    displayCity.textContent = city.toUpperCase() + " ";
    displayCity.setAttribute("class", "title");
    displayCity.setAttribute("id", "current-title")
    // append city name h2 to currentHeader div
    currentHeader.appendChild(displayCity);

    // append div to currentDisplay DOM element
    currentDisplay.appendChild(currentHeader);
    
    // get today's date and define format using moment.js
    var dateToday = moment().format("MM/DD/YYYY");

    // create span element for date
    var displayDate = document.createElement("span");
    displayDate.textContent = "(" + dateToday + ")";

    // append date to currentHeader div
    displayCity.appendChild(displayDate);
};

// display current info from weather API
var displaycurrentInfo = function(data) {
    // add weather icon to header 
    var icon = document.createElement("span");
    icon.innerHTML = "<image src='http://openweathermap.org/img/wn/" + data.current.weather[0].icon + ".png' />";
    $("#current-title").append(icon);

    // style currentDisplay
    currentDisplay.setAttribute("class", "box mt-3");

    // add current temp to currentDisplay
    var temp = document.createElement("p");
    temp.textContent = "Temp: " + data.current.temp + "  \u00B0 F";
    temp.setAttribute("class", "mb-2");
    currentDisplay.appendChild(temp);
    
    // add wind to currentDisplay
    var wind = document.createElement("p");
    wind.textContent = "Wind Speed: " + data.current.wind_speed + " MPH";
    wind.setAttribute("class", "mb-2");
    currentDisplay.appendChild(wind);

    // add humidity to currentDisplay
    var humidity = document.createElement("p");
    humidity.textContent = "Humidity: " + data.current.humidity + "%";
    humidity.setAttribute("class", "mb-2");
    currentDisplay.appendChild(humidity);

    // add UV index to currentDisplay
    var uvIndex = document.createElement("p");
    uvIndex.textContent = "UV Index: " + data.current.uvi;
    uvIndex.setAttribute("id", "uv");

    // set background based on UV conditions
    if (data.current.uvi < 2) {
        uvIndex.setAttribute("class", "has-background-success");
    } else if ((3 >= data.current.uvi) && (5 >= data.current.uvi)) {
        uvIndex.setAttribute("class", "has-background-warning");
    } 
    else if ((6 >= data.current.uvi) && (7 >= data.current.uvi)) {
        uvIndex.setAttribute("class", "has-background-danger");
    } else if ((8 >= data.current.uvi) && (10 >= data.current.uvi)) {
        uvIndex.setAttribute("class", "has-background-hot-pink");
    } else if (data.current.uvi > 11) {
        uvIndex.setAttribute("class", "has-background-info");
    } else {
        return;
    }

    currentDisplay.appendChild(uvIndex);
};

// display 5-day forecast
// for each day: date, icon for weather conditions, temp, wind, humidity stacked in boxes
var displayForecast = function(data) {
    // style forecastDisplay
    forecastDisplay.setAttribute("class", "box mt-3");

    // display header
    var colHeader = document.createElement("h2");
    colHeader.textContent = "5-DAY FORECAST";
    colHeader.setAttribute("class", "title");
    forecastHeader.appendChild(colHeader);

    for (i = 1; i < data.daily.length-2; i++) {
        // create container(box)
        var box = document.createElement("div");
        box.setAttribute("class", "daily box m-2");
        forecastCards.appendChild(box);

        // add date to each currentDisplay
        var date = document.createElement("p");
        var today = moment.unix(data.daily[i].dt).format("MM/DD/YYYY");
        date.textContent = today;
        box.appendChild(date);

        // add weather icon to header 
        var icon = document.createElement("span");
        icon.innerHTML = "<image src='http://openweathermap.org/img/wn/" + data.daily[i].weather[0].icon + ".png' />";
        box.appendChild(icon);

        // add temp to daily forcast boxes
        var temp = document.createElement("p");
        temp.textContent = "Temp: " + data.daily[i].temp.day + "  \u00B0 F";
        temp.setAttribute("class", "mb-2");
        box.appendChild(temp);

        // add wind to currentDisplay
        var wind = document.createElement("p");
        wind.textContent = "Wind Speed: " + data.daily[i].wind_speed + " MPH";
        wind.setAttribute("class", "mb-2");
        box.appendChild(wind);

        // add humidity to currentDisplay
        var humidity = document.createElement("p");
        humidity.textContent = "Humidity: " + data.daily[i].humidity + "%";
        humidity.setAttribute("class", "mb-2");
        box.appendChild(humidity);

        // add UV index to currentDisplay
        var uvIndex = document.createElement("p");
        uvIndex.textContent = "UV Index: " + data.daily[i].uvi;
        uvIndex.setAttribute("id", "uv");
        box.appendChild(uvIndex);

        // set background based on UV conditions
        if (data.daily[i].uvi < 2) {
            uvIndex.setAttribute("class", "has-background-success");
        } else if ((3 >= data.daily[i].uvi) && (5 >= data.daily[i].uvi)) {
            uvIndex.setAttribute("class", "has-background-warning");
        } 
        else if ((6 >= data.daily[i].uvi) && (7 >= data.daily[i].uvi)) {
            uvIndex.setAttribute("class", "has-background-danger");
        } else if ((8 >= data.daily[i].uvi) && (10 >= data.daily[i].uvi)) {
            uvIndex.setAttribute("class", "has-background-hot-pink");
        } else if (data.daily[i].uvi > 11) {
            uvIndex.setAttribute("class", "has-background-info");
        } else {
            return;
        }
    }
};

// Save recent searches to local storage
var saveSearch = function(input) {
    var cityStripped = input.toLowerCase();

    recentSearches.push(cityStripped);

    localStorage.setItem("recentSearches", JSON.stringify(recentSearches));

    //pass each task object into the div
    var search = document.createElement("button");
    search.setAttribute("value", cityStripped);
    search.textContent = cityStripped;
    search.classList = "button is-fullwidth block has-background-grey-lighter";

    searchHistory.appendChild(search);
};

// display array from local storage
var displaySearches = function() {
    // if there are no searches, set tasks to an empty array and return out of the function
    if (!recentSearches) {
        return false;
    } else { 
        var saved = recentSearches;

        // loop through savedSearches array
        for (var i = 0; i < saved.length; i++) {   
            //pass each task object into the div
            var search = document.createElement("button");
            search.setAttribute("value", saved[i]);
            search.textContent = saved[i];
            search.classList = "button is-fullwidth block has-background-grey-lighter";
        
            searchHistory.appendChild(search); 
        }
    }
};

// make recent searches clickable and display results on page
$("#search-history").on("click", "button", function () {
    var buttonText = $(this).attr("value");
    getLatLon(buttonText);
});

window.onload = function() {
    displaySearches();
};

searchForm.addEventListener("submit", searchHandler);