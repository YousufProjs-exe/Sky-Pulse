
const apiKey = CONFIG.API_KEY;

/* ---------------- INIT ---------------- */
window.addEventListener("load", () => {
  const lastCity = localStorage.getItem("lastCity");

  if (lastCity) {
    document.getElementById("cityInput").value = lastCity;
    getWeather();
  } else {
    getLocationWeather();
  }

  showHistory();
});

/* ---------------- ELEMENTS ---------------- */
const input = document.getElementById("cityInput");
const historyBox = document.getElementById("history");

/* ---------------- WEATHER SEARCH ---------------- */
async function getWeather() {
  const city = input.value.trim();
  if (!city) return;

  showLoading();

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.cod != 200) {
      hideLoading();
      return;
    }

    updateUI(data);

    localStorage.setItem("lastCity", city);
    saveToHistory(city);

    hideHistory();
  } catch (err) {
    console.error(err);
    hideLoading();
  }
}

/* ---------------- LOCATION WEATHER ---------------- */
function getLocationWeather() {
  if (!navigator.geolocation) return;

  navigator.geolocation.getCurrentPosition(fetchByLocation, hideLoading);
}

async function fetchByLocation(position) {
  const { latitude, longitude } = position.coords;

  showLoading();

  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    updateUI(data);
  } catch (err) {
    console.error(err);
  } finally {
    hideLoading();
  }
}

/* ---------------- UI ---------------- */
function updateUI(data) {
  hideLoading();

  document.getElementById("city").innerText = data.name;
  document.getElementById("temp").innerText = `${data.main.temp} °C`;
  document.getElementById("desc").innerText = data.weather[0].description;

  document.getElementById("feelsLike").innerText =
    `Feels like: ${data.main.feels_like} °C`;

  setWeatherIcon(data.weather[0].main);
}

/* ---------------- ICONS ---------------- */
function setWeatherIcon(condition) {
  const icon = document.getElementById("weatherIcon");
  const c = condition.toLowerCase();

  if (c.includes("clear")) {
    icon.src = "https://cdn-icons-png.flaticon.com/512/869/869869.png";
  } else if (c.includes("cloud")) {
    icon.src = "https://cdn-icons-png.flaticon.com/512/414/414825.png";
  } else if (c.includes("rain") || c.includes("drizzle")) {
    icon.src = "https://cdn-icons-png.flaticon.com/512/4088/4088981.png";
  } else if (c.includes("thunderstorm")) {
    icon.src = "https://cdn-icons-png.flaticon.com/512/1146/1146860.png";
  } else if (c.includes("snow")) {
    icon.src = "https://cdn-icons-png.flaticon.com/512/642/642102.png";
  } else {
    icon.src = "https://cdn-icons-png.flaticon.com/512/1163/1163624.png";
  }
}

/* ---------------- LOADING ---------------- */
function showLoading() {
  document.getElementById("loading").style.display = "block";
}

function hideLoading() {
  document.getElementById("loading").style.display = "none";
}

/* ---------------- HISTORY ---------------- */
function saveToHistory(city) {
  let history = JSON.parse(localStorage.getItem("history")) || [];

  if (city && !history.includes(city)) {
    history.unshift(city);
  }

  history = history.slice(0, 5);
  localStorage.setItem("history", JSON.stringify(history));

  showHistory();
}

function showHistory() {
  const history = JSON.parse(localStorage.getItem("history")) || [];

  if (history.length === 0) {
    hideHistory();
    return;
  }

  historyBox.innerHTML = history
    .map(city => `<p onclick="selectCity('${city}')">${city}</p>`)
    .join("");

  historyBox.style.display = "block";
}

function hideHistory() {
  historyBox.style.display = "none";
}

/* ---------------- SELECT CITY ---------------- */
function selectCity(city) {
  input.value = city;
  hideHistory();
  getWeather();
}

/* ---------------- INPUT EVENTS ---------------- */
input.addEventListener("input", () => {
  if (input.value.trim() === "") {
    hideHistory();
  } else {
    showHistory();
  }
});

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    hideHistory();
    getWeather();
  }
});

/* ---------------- OUTSIDE CLICK FIX ---------------- */
document.addEventListener("click", (e) => {
  const searchBox = document.querySelector(".search");

  if (!searchBox.contains(e.target)) {
    hideHistory();
  }
});
