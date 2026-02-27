function WeatherApp(apiKey) {
    this.apiKey = apiKey;
    this.currentContainer = document.getElementById("current-weather");
    this.forecastContainer = document.getElementById("forecast");
}

WeatherApp.prototype.init = function () {
    const form = document.getElementById("weather-form");

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        const city = document.getElementById("city-input").value;
        this.fetchWeather(city);
    }.bind(this));
};

WeatherApp.prototype.fetchWeather = function (city) {

    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${this.apiKey}&units=metric`;

    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${this.apiKey}&units=metric`;

    Promise.all([
        fetch(currentUrl),
        fetch(forecastUrl)
    ])
    .then(responses => Promise.all(responses.map(res => res.json())))
    .then(data => {
        const currentData = data[0];
        const forecastData = data[1];

        this.displayCurrentWeather(currentData);
        this.displayForecast(forecastData);
    })
    .catch(error => {
        console.error("Error fetching data:", error);
        alert("City not found. Please try again.");
    });
};

WeatherApp.prototype.displayCurrentWeather = function (data) {

    this.currentContainer.innerHTML = `
        <h2>${data.name}</h2>
        <p>Temperature: ${data.main.temp}°C</p>
        <p>${data.weather[0].description}</p>
        <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png">
    `;
};

WeatherApp.prototype.displayForecast = function (data) {

    this.forecastContainer.innerHTML = "";

    const forecastList = data.list;

    for (let i = 0; i < forecastList.length; i += 8) {

        const dayData = forecastList[i];
        const date = new Date(dayData.dt * 1000).toDateString();

        const card = document.createElement("div");
        card.classList.add("forecast-card");

        card.innerHTML = `
            <h4>${date}</h4>
            <p>${dayData.main.temp}°C</p>
            <p>${dayData.weather[0].description}</p>
            <img src="https://openweathermap.org/img/wn/${dayData.weather[0].icon}.png">
        `;

        this.forecastContainer.appendChild(card);
    }
};

const app = new WeatherApp("YOUR_API_KEY");
app.init();