const form = document.querySelector("#location-form");
const locationInput = document.querySelector("#location-input");
const submitButton = form.querySelector('button[type="submit"]');
const statusMessage = document.querySelector("#status-message");
const loadingComponent = document.querySelector("#loading-component");
const weatherCard = document.querySelector("#weather-card");
const unitButtons = document.querySelectorAll(".unit-button");

const VISUAL_CROSSING_API_KEY = "ETPHHT7YGZ9ZTP4NDQ9KFLSRY";
let currentWeather = null;
let temperatureUnit = "c";

const weatherIcons = {
  "clear-day": { icon: "☀", theme: "sun" },
  "clear-night": { icon: "☾", theme: "sun" },
  "partly-cloudy-day": { icon: "🌤", theme: "cloud" },
  "partly-cloudy-night": { icon: "☁", theme: "cloud" },
  cloudy: { icon: "☁", theme: "cloud" },
  fog: { icon: "🌫", theme: "cloud" },
  wind: { icon: "〰", theme: "cloud" },
  rain: { icon: "🌧", theme: "rain" },
  sleet: { icon: "🌨", theme: "snow" },
  snow: { icon: "❄", theme: "snow" },
  hail: { icon: "❄", theme: "snow" },
  "thunder-rain": { icon: "⛈", theme: "storm" },
  "thunder-showers-day": { icon: "⛈", theme: "storm" },
  "thunder-showers-night": { icon: "⛈", theme: "storm" },
};

async function getWeather(location) {
  const params = new URLSearchParams({
    unitGroup: "metric",
    include: "current",
    key: VISUAL_CROSSING_API_KEY,
    contentType: "json",
  });
  const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(location)}/today?${params}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Weather request failed (HTTP ${response.status}). Check the location and API key, then try again.`,
    );
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("The weather service returned an unreadable response. Please try again.");
  }

  return processWeatherData(location, data);
}

function processWeatherData(searchLocation, data) {
  const current = data.currentConditions;

  if (!current || typeof current.temp !== "number") {
    throw new Error("The weather service returned incomplete data. Please try again.");
  }

  const icon = weatherIcons[current.icon] ?? { icon: "☁", theme: "cloud" };

  return {
    location: data.resolvedAddress || data.address || searchLocation,
    temperatureC: current.temp,
    feelsLikeC: current.feelslike,
    humidity: current.humidity,
    windKph: current.windspeed,
    precipitationMm: current.precip ?? 0,
    condition: current.conditions,
    icon: icon.icon,
    theme: icon.theme,
    updatedAt: current.datetime,
  };
}

function formatTemperature(valueC) {
  const value = temperatureUnit === "c" ? valueC : (valueC * 9) / 5 + 32;
  return Math.round(value);
}

function displayWeather(weather) {
  document.querySelector("#place-name").textContent = weather.location;
  document.querySelector("#updated-label").textContent = `Updated ${weather.updatedAt}`;
  document.querySelector("#temperature").textContent = formatTemperature(weather.temperatureC);
  document.querySelector("#feels-like").textContent = formatTemperature(weather.feelsLikeC);
  document.querySelector("#condition").textContent = weather.condition;
  document.querySelector("#condition-art").textContent = weather.icon;
  document.querySelector("#humidity").textContent = `${weather.humidity}%`;
  document.querySelector("#wind").textContent = `${Math.round(weather.windKph)} km/h`;
  document.querySelector("#precipitation").textContent = `${weather.precipitationMm} mm`;
  weatherCard.dataset.theme = weather.theme;
  weatherCard.dataset.day = String(weather.isDay);
  weatherCard.hidden = false;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const location = locationInput.value.trim();

  if (!location) {
    statusMessage.textContent = "Enter a city or location to continue.";
    statusMessage.classList.add("is-error");
    locationInput.focus();
    return;
  }

  submitButton.disabled = true;
  form.setAttribute("aria-busy", "true");
  loadingComponent.hidden = false;
  submitButton.querySelector("span:first-child").textContent = "Loading…";
  statusMessage.textContent = "Finding the latest conditions…";
  statusMessage.classList.remove("is-error");

  try {
    currentWeather = await getWeather(location);
    console.log(currentWeather);
    displayWeather(currentWeather);
    statusMessage.textContent = "Here are the latest conditions for your location.";
  } catch (error) {
    statusMessage.textContent =
      error instanceof Error ? error.message : "Something went wrong. Please try again.";
    statusMessage.classList.add("is-error");
    weatherCard.hidden = true;
  } finally {
    submitButton.disabled = false;
    form.removeAttribute("aria-busy");
    loadingComponent.hidden = true;
    submitButton.querySelector("span:first-child").textContent = "Get weather";
  }
});

unitButtons.forEach((button) => {
  button.addEventListener("click", () => {
    temperatureUnit = button.dataset.unit;
    unitButtons.forEach((unitButton) => {
      const selected = unitButton === button;
      unitButton.classList.toggle("is-selected", selected);
      unitButton.setAttribute("aria-pressed", String(selected));
    });

    if (currentWeather) {
      displayWeather(currentWeather);
    }
  });
});
