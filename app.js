const apiKey = "YOUR_API_KEY";

const cityElement = document.getElementById("city");
const tempElement = document.getElementById("temperature");
const descElement = document.getElementById("description");
const iconElement = document.getElementById("icon");

const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");

const loading = document.getElementById("loading");
const errorMessage = document.getElementById("error");

async function fetchWeather(city) {
  try {
    loading.style.display = "block";
    errorMessage.textContent = "";
    searchBtn.disabled = true;

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    const response = await axios.get(url);
    const data = response.data;

    cityElement.textContent = data.name;
    tempElement.textContent = `Temperature: ${data.main.temp}°C`;
    descElement.textContent = `Weather: ${data.weather[0].description}`;

    const iconCode = data.weather[0].icon;
    iconElement.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

  } catch (error) {
    errorMessage.textContent = "City not found. Please enter a valid city.";
    cityElement.textContent = "";
    tempElement.textContent = "";
    descElement.textContent = "";
    iconElement.src = "";
  } finally {
    loading.style.display = "none";
    searchBtn.disabled = false;
  }
}

searchBtn.addEventListener("click", function () {
  const city = cityInput.value.trim();

  if (city === "") {
    errorMessage.textContent = "Please enter a city name.";
    return;
  }

  fetchWeather(city);
});

cityInput.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    searchBtn.click();
  }
});