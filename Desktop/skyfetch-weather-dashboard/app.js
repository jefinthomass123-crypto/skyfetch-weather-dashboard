const apiKey = "YOUR_API_KEY";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const weatherResult = document.getElementById("weatherResult");
const errorDiv = document.getElementById("error");
const loadingDiv = document.getElementById("loading");

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  fetchWeather(city);
});

cityInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    fetchWeather(cityInput.value.trim());
  }
});

async function fetchWeather(city) {

  if (!city) {
    errorDiv.textContent = "Please enter a city name.";
    weatherResult.innerHTML = "";
    return;
  }

  errorDiv.textContent = "";
  weatherResult.innerHTML = "";
  loadingDiv.style.display = "block";

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );

    if (!response.ok) {
      throw new Error("City not found. Please try again.");
    }

    const data = await response.json();

    weatherResult.innerHTML = `
      <h3>${data.name}, ${data.sys.country}</h3>
      <p><strong>Temperature:</strong> ${data.main.temp} °C</p>
      <p><strong>Weather:</strong> ${data.weather[0].description}</p>
      <p><strong>Humidity:</strong> ${data.main.humidity}%</p>
      <p><strong>Wind Speed:</strong> ${data.wind.speed} m/s</p>
    `;

  } catch (error) {
    errorDiv.textContent = error.message;
  } finally {
    loadingDiv.style.display = "none";
  }
}