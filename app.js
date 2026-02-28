// WeatherApp constructor
function WeatherApp(apiKey) {
    this.apiKey = apiKey;
    this.city = '';
    this.currentWeatherData = null;
    this.forecastData = null;

    // Bind methods
    this.init = this.init.bind(this);
    this.fetchWeather = this.fetchWeather.bind(this);
}

// Initialize app with a city
WeatherApp.prototype.init = function(city) {
    this.city = city;
    this.fetchWeather();
}

// Fetch current weather and 5-day forecast
WeatherApp.prototype.fetchWeather = function() {
    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${this.city}&appid=${this.apiKey}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${this.city}&appid=${this.apiKey}&units=metric`;

    // Fetch both endpoints together
    Promise.all([fetch(currentUrl), fetch(forecastUrl)])
        .then(responses => Promise.all(responses.map(r => r.json())))
        .then(([currentData, forecastData]) => {
            this.currentWeatherData = currentData;
            this.forecastData = forecastData;
            this.renderCurrentWeather();
            this.renderForecast();
        })
        .catch(err => console.error('Error fetching weather:', err));
}

// Render current weather
WeatherApp.prototype.renderCurrentWeather = function() {
    const container = document.getElementById('current-weather');
    container.innerHTML = `
        <h2>${this.currentWeatherData.name}</h2>
        <p>${this.currentWeatherData.weather[0].description}</p>
        <p>${this.currentWeatherData.main.temp}°C</p>
        <img src="https://openweathermap.org/img/wn/${this.currentWeatherData.weather[0].icon}.png" />
    `;
}

// Render 5-day forecast
WeatherApp.prototype.renderForecast = function() {
    const container = document.getElementById('forecast');
    container.innerHTML = ''; // clear previous

    // OpenWeatherMap forecast comes in 3-hour intervals. We'll pick one per day (every 8 items)
    const forecastList = this.forecastData.list.filter((item, index) => index % 8 === 0);

    forecastList.forEach(day => {
        const card = document.createElement('div');
        card.className = 'forecast-card';
        card.innerHTML = `
            <p><strong>${new Date(day.dt_txt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</strong></p>
            <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" />
            <p>${day.weather[0].description}</p>
            <p>${day.main.temp}°C</p>
        `;
        container.appendChild(card);
    });
}

// Initialize app (replace 'YOUR_API_KEY_HERE' with your OpenWeatherMap API key)
const app = new WeatherApp('YOUR_API_KEY_HERE');
app.init('London'); // You can change city here