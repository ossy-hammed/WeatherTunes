// WeatherTunes – main logic
const loadingDiv = document.getElementById('loading');
const weatherCard = document.getElementById('weatherCard');
const errorCard = document.getElementById('errorCard');
const weatherIcon = document.getElementById('weatherIcon');
const temperature = document.getElementById('temperature');
const conditionElem = document.getElementById('condition');
const vibeText = document.getElementById('vibeText');
const spotifyBtn = document.getElementById('spotifyBtn');
const youtubeBtn = document.getElementById('youtubeBtn');
const locationNote = document.getElementById('locationNote');
const retryBtn = document.getElementById('retryBtn');

// Weather code → vibe mapping
const vibeMap = {
  0:  { icon: '☀️', vibe: 'Sunny Indie Pop', query: 'indie pop sunshine', bg: 'clear' },
  1:  { icon: '🌤️', vibe: 'Chill Ambient', query: 'ambient chill', bg: 'cloudy' },
  2:  { icon: '⛅', vibe: 'Cloudy Lo-Fi', query: 'lofi hip hop', bg: 'cloudy' },
  3:  { icon: '☁️', vibe: 'Overcast Beats', query: 'chill electronic', bg: 'cloudy' },
  45: { icon: '🌫️', vibe: 'Foggy Ambient', query: 'dark ambient', bg: 'fog' },
  48: { icon: '🌫️', vibe: 'Foggy Ambient', query: 'dark ambient', bg: 'fog' },
  51: { icon: '🌦️', vibe: 'Drizzle Jazz', query: 'jazz rain', bg: 'drizzle' },
  53: { icon: '🌦️', vibe: 'Drizzle Jazz', query: 'jazz rain', bg: 'drizzle' },
  55: { icon: '🌧️', vibe: 'Drizzle Jazz', query: 'jazz rain', bg: 'drizzle' },
  61: { icon: '🌧️', vibe: 'Rainy Lo-Fi', query: 'lofi rain', bg: 'rain' },
  63: { icon: '🌧️', vibe: 'Rainy Lo-Fi', query: 'lofi rain', bg: 'rain' },
  65: { icon: '🌧️', vibe: 'Rainy Lo-Fi', query: 'lofi rain', bg: 'rain' },
  66: { icon: '🌨️', vibe: 'Freezing Rain Acoustic', query: 'acoustic warm', bg: 'rain' },
  67: { icon: '🌨️', vibe: 'Freezing Rain Acoustic', query: 'acoustic warm', bg: 'rain' },
  71: { icon: '❄️', vibe: 'Snowy Piano', query: 'soft piano winter', bg: 'snow' },
  73: { icon: '❄️', vibe: 'Snowy Piano', query: 'soft piano winter', bg: 'snow' },
  75: { icon: '❄️', vibe: 'Snowy Piano', query: 'soft piano winter', bg: 'snow' },
  77: { icon: '🌨️', vibe: 'Snow Grains', query: 'ambient winter', bg: 'snow' },
  80: { icon: '🌦️', vibe: 'Rain Showers Electro', query: 'chill electro', bg: 'rain' },
  81: { icon: '🌦️', vibe: 'Rain Showers Electro', query: 'chill electro', bg: 'rain' },
  82: { icon: '🌧️', vibe: 'Rain Showers Electro', query: 'chill electro', bg: 'rain' },
  85: { icon: '🌨️', vibe: 'Snow Showers Cinematic', query: 'cinematic orchestral', bg: 'snow' },
  86: { icon: '🌨️', vibe: 'Snow Showers Cinematic', query: 'cinematic orchestral', bg: 'snow' },
};

// Default fallback
const defaultVibe = { icon: '🌈', vibe: 'Eclectic Mix', query: 'happy vibes', bg: 'default' };

function showLoading() {
  loadingDiv.classList.remove('hidden');
  weatherCard.classList.add('hidden');
  errorCard.classList.add('hidden');
}

function showWeather(data) {
  loadingDiv.classList.add('hidden');
  weatherCard.classList.remove('hidden');
  errorCard.classList.add('hidden');

  const weatherCode = data.current_weather.weathercode;
  const temp = Math.round(data.current_weather.temperature);
  const vibe = vibeMap[weatherCode] || defaultVibe;

  // Update UI
  weatherIcon.textContent = vibe.icon;
  temperature.textContent = `${temp}°C`;
  conditionElem.textContent = data.current_weather.weathercodeToString || getConditionText(weatherCode); // fallback
  vibeText.textContent = vibe.vibe;

  // Update background
  document.body.className = vibe.bg;

  // Build search URLs
  const queryEncoded = encodeURIComponent(vibe.query);
  spotifyBtn.href = `https://open.spotify.com/search/${queryEncoded}`;
  youtubeBtn.href = `https://www.youtube.com/results?search_query=${queryEncoded}`;

  // Location note (lat/lon only, no reverse geocode)
  locationNote.textContent = `📍 ${data.latitude.toFixed(2)}, ${data.longitude.toFixed(2)}`;
}

function showError() {
  loadingDiv.classList.add('hidden');
  weatherCard.classList.add('hidden');
  errorCard.classList.remove('hidden');
}

function getConditionText(code) {
  // Simple fallback descriptions
  const descriptions = {
    0: 'Clear Sky', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
    45: 'Fog', 48: 'Depositing Rime Fog', 51: 'Light Drizzle', 53: 'Moderate Drizzle',
    55: 'Dense Drizzle', 61: 'Slight Rain', 63: 'Moderate Rain', 65: 'Heavy Rain',
    66: 'Light Freezing Rain', 67: 'Heavy Freezing Rain', 71: 'Slight Snow Fall',
    73: 'Moderate Snow Fall', 75: 'Heavy Snow Fall', 77: 'Snow Grains',
    80: 'Slight Rain Showers', 81: 'Moderate Rain Showers', 82: 'Violent Rain Showers',
    85: 'Slight Snow Showers', 86: 'Heavy Snow Showers'
  };
  return descriptions[code] || 'Unknown';
}

async function fetchWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Weather fetch failed');
  const data = await response.json();
  // Add lat/lon for display
  data.latitude = lat;
  data.longitude = lon;
  return data;
}

function getLocationAndLoad() {
  showLoading();

  if (!navigator.geolocation) {
    useFallbackLocation();
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        const weather = await fetchWeather(latitude, longitude);
        showWeather(weather);
      } catch (err) {
        console.error(err);
        showError();
      }
    },
    (error) => {
      console.warn('Geolocation error:', error);
      useFallbackLocation();
    },
    { enableHighAccuracy: false, timeout: 10000 }
  );
}

function useFallbackLocation() {
  // Default: San Francisco
  const fallbackLat = 37.7749;
  const fallbackLon = -122.4194;
  fetchWeather(fallbackLat, fallbackLon)
    .then(showWeather)
    .catch((err) => {
      console.error(err);
      showError();
    });
  // Optionally show fallback note
  locationNote.textContent = '(using default location – allow location for your weather)';
}

// Retry button
retryBtn.addEventListener('click', getLocationAndLoad);

// Start the app
getLocationAndLoad();