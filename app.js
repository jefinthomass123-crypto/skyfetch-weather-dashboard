// ============================================================
//  SkyFetch Weather Dashboard — Part 3
//  Prototypal Inheritance  |  5-Day Forecast  |  Promise.all()
// ============================================================

// -------------------- Constructor Function --------------------
// Creates a new WeatherApp instance and stores DOM references
// so we only query the DOM once (better performance).

function WeatherApp(apiKey) {
    this.apiKey = apiKey;

    // Store DOM references in the constructor
    this.weatherResult = document.getElementById("weather-result");
    this.forecastSection = document.getElementById("forecast-section");
    this.forecastContainer = document.getElementById("forecast-container");
    this.searchForm = document.getElementById("weather-form");
    this.cityInput = document.getElementById("city-input");
    this.searchBtn = document.getElementById("search-btn");
}

// -------------------- init() --------------------
// Sets up event listeners and shows the welcome message.
// Uses .bind(this) so "this" inside the callback still points
// to the WeatherApp instance, not the form element.

WeatherApp.prototype.init = function () {
    // Attach submit listener with .bind(this) for correct context
    this.searchForm.addEventListener("submit", function (e) {
        e.preventDefault();
        this.handleSearch();
    }.bind(this));

    // Show the welcome screen on load
    this.showWelcome();
};

// -------------------- showWelcome() --------------------
// Displays a friendly welcome card when the app first loads.

WeatherApp.prototype.showWelcome = function () {
    this.weatherResult.innerHTML = `
        <div class="welcome-card">
            <span class="welcome-emoji">🌤️</span>
            <h2>Welcome to SkyFetch!</h2>
            <p>Type a city name above to get the current weather and a 5-day forecast.</p>
        </div>
    `;
    this.forecastSection.classList.add("hidden");
};

// -------------------- handleSearch() --------------------
// Reads the city from the input and triggers the weather fetch.

WeatherApp.prototype.handleSearch = function () {
    var city = this.cityInput.value.trim();
    if (city) {
        this.getWeather(city);
    }
};

// -------------------- showLoading() --------------------
// Shows a spinner while the API calls are in progress.

WeatherApp.prototype.showLoading = function () {
    this.weatherResult.innerHTML = `
        <div class="loading-card">
            <div class="spinner"></div>
            <p>Fetching weather data…</p>
        </div>
    `;
    this.forecastSection.classList.add("hidden");
};

// -------------------- showError(message) --------------------
// Displays a styled error message when something goes wrong.

WeatherApp.prototype.showError = function (message) {
    this.weatherResult.innerHTML = `
        <div class="error-card">
            <span class="error-emoji">😕</span>
            <h3>Oops!</h3>
            <p>${message}</p>
        </div>
    `;
    this.forecastSection.classList.add("hidden");
};

// -------------------- getWeather(city) --------------------
// Fetches BOTH current weather AND 5-day forecast using
// Promise.all() so both requests happen simultaneously.

WeatherApp.prototype.getWeather = async function (city) {
    this.showLoading();

    var currentUrl = "https://api.openweathermap.org/data/2.5/weather?q="
        + encodeURIComponent(city)
        + "&appid=" + this.apiKey + "&units=metric";

    var forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?q="
        + encodeURIComponent(city)
        + "&appid=" + this.apiKey + "&units=metric";

    try {
        // Promise.all fetches both APIs simultaneously → faster!
        var responses = await Promise.all([
            fetch(currentUrl),
            fetch(forecastUrl)
        ]);

        // Check for errors on the current-weather response
        if (!responses[0].ok) {
            throw new Error("City not found. Please check the spelling and try again.");
        }

        var data = await Promise.all(responses.map(function (res) {
            return res.json();
        }));

        var currentData = data[0];
        var forecastData = data[1];

        // Display both sections
        this.displayWeather(currentData);
        var dailyForecasts = this.processForecastData(forecastData);
        this.displayForecast(dailyForecasts);

    } catch (error) {
        console.error("Error fetching weather:", error);
        this.showError(error.message || "Something went wrong. Please try again.");
    }
};

// -------------------- getForecast(city) --------------------
// Standalone forecast fetcher (can be called independently).

WeatherApp.prototype.getForecast = async function (city) {
    var url = "https://api.openweathermap.org/data/2.5/forecast?q="
        + encodeURIComponent(city)
        + "&appid=" + this.apiKey + "&units=metric";
    var response = await fetch(url);
    if (!response.ok) throw new Error("Forecast data unavailable.");
    return response.json();
};

// -------------------- displayWeather(data) --------------------
// Renders the current-weather card with temp, icon, and details.

WeatherApp.prototype.displayWeather = function (data) {
    var iconUrl = "https://openweathermap.org/img/wn/"
        + data.weather[0].icon + "@2x.png";

    var now = new Date();
    var dateStr = now.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });

    this.weatherResult.innerHTML = `
        <div class="current-weather">
            <div class="weather-header">
                <div class="weather-location">
                    <h2>${data.name}, ${data.sys.country}</h2>
                    <div class="date-text">${dateStr}</div>
                </div>
                <div class="weather-icon-wrap">
                    <img src="${iconUrl}" alt="${data.weather[0].description}" />
                </div>
            </div>
            <div class="weather-body">
                <div class="temp-block">
                    <div class="temp-value">${Math.round(data.main.temp)}°C</div>
                    <div class="description">${data.weather[0].description}</div>
                </div>
                <div class="weather-details">
                    <div class="detail-item">
                        <span class="detail-icon">🌡️</span>
                        <span>Feels like</span>
                        <span>${Math.round(data.main.feels_like)}°C</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-icon">💧</span>
                        <span>Humidity</span>
                        <span>${data.main.humidity}%</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-icon">💨</span>
                        <span>Wind</span>
                        <span>${data.wind.speed} m/s</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-icon">👁️</span>
                        <span>Visibility</span>
                        <span>${(data.visibility / 1000).toFixed(1)} km</span>
                    </div>
                </div>
            </div>
        </div>
    `;
};

// -------------------- processForecastData(data) --------------------
// The API returns 40 data points (every 3 hours for 5 days).
// We filter to get one entry per day around noon (12:00:00),
// then take the first 5 results.

WeatherApp.prototype.processForecastData = function (data) {
    // Filter entries closest to midday
    var noonEntries = data.list.filter(function (item) {
        return item.dt_txt.indexOf("12:00:00") !== -1;
    });

    // Take exactly 5 days
    return noonEntries.slice(0, 5);
};

// -------------------- displayForecast(forecasts) --------------------
// Creates a styled card for each of the 5 forecast days.

WeatherApp.prototype.displayForecast = function (forecasts) {
    this.forecastContainer.innerHTML = "";
    this.forecastSection.classList.remove("hidden");

    forecasts.forEach(function (day) {
        var date = new Date(day.dt * 1000);
        var dayName = date.toLocaleDateString("en-US", { weekday: "short" });
        var dateNum = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        var icon = "https://openweathermap.org/img/wn/" + day.weather[0].icon + "@2x.png";

        var card = document.createElement("div");
        card.classList.add("forecast-card");
        card.innerHTML = `
            <div class="fc-day">${dayName}</div>
            <div class="fc-date">${dateNum}</div>
            <div class="fc-icon">
                <img src="${icon}" alt="${day.weather[0].description}" />
            </div>
            <div class="fc-temp">${Math.round(day.main.temp)}°C</div>
            <div class="fc-desc">${day.weather[0].description}</div>
        `;

        this.forecastContainer.appendChild(card);
    }.bind(this));
};

// ============================================================
//  Initialize — Create a single instance and start the app
// ============================================================

var app = new WeatherApp("YOUR_API_KEY");
app.init();