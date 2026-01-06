import React, { useState, useEffect } from "react";
import "./styles.css";
const formatTime = (unixTimestamp) => {
  const date = new Date(unixTimestamp * 1000);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export default function App() {
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("weatherSettings");
    return saved
      ? JSON.parse(saved)
      : { textColor: "#000000", bgColor: "#ffffff", favCity: "" };
  });

  const API_KEY = "ВАШ_API_KEY";

  useEffect(() => {
    if (settings.favCity && !weather) {
      fetchWeather(settings.favCity);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("weatherSettings", JSON.stringify(settings));
  }, [settings]);

  const fetchWeather = async (targetCity = city) => {
    if (!targetCity) return;
    setError(null);
    try {
      const query = country ? `${targetCity},${country}` : targetCity;
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${API_KEY}&units=metric&lang=uk`
      );
      if (!response.ok) throw new Error("Місто не знайдено");
      const data = await response.json();
      setWeather(data);
    } catch (err) {
      setError(err.message);
      setWeather(null);
    }
  };

  const isDayTime = () => {
    if (!weather) return true;
    const now = Math.floor(Date.now() / 1000);
    return now > weather.sys.sunrise && now < weather.sys.sunset;
  };

  const dayMode = isDayTime();
  const themeClass = dayMode ? "light-theme" : "dark-theme";

  return (
    <div
      className={`App ${themeClass}`}
      style={{ backgroundColor: settings.bgColor, color: settings.textColor }}
    >
      <h1>Погода</h1>
      <div className="search-section">
        <input
          placeholder="Місто"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <input
          placeholder="Країна (код, напр. UA)"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        />
        <button onClick={() => fetchWeather()}>Пошук</button>
      </div>

      {error && <p className="error">{error}</p>}

      {weather && (
        <div className="weather-card">
          <h2>
            {weather.name}, {weather.sys.country}
          </h2>
          <div className="main-info">
            <span className="celestial-icon">{dayMode ? "☀️" : "🌙"}</span>
            <span className="temp">{Math.round(weather.main.temp)}°C</span>
          </div>
          <p>Відчувається як: {Math.round(weather.main.feels_like)}°C</p>
          <p>Опис: {weather.weather[0].description}</p>

          <div className="sun-times">
            <p>🌅 Схід: {formatTime(weather.sys.sunrise)}</p>
            <p>🌇 Захід: {formatTime(weather.sys.sunset)}</p>
          </div>
        </div>
      )}

      <div className="settings-panel">
        <h3>Налаштування</h3>
        <label>
          Колір тексту:
          <input
            type="color"
            value={settings.textColor}
            onChange={(e) =>
              setSettings({ ...settings, textColor: e.target.value })
            }
          />
        </label>
        <label>
          Колір фону:
          <input
            type="color"
            value={settings.bgColor}
            onChange={(e) =>
              setSettings({ ...settings, bgColor: e.target.value })
            }
          />
        </label>
        <label>
          Улюблене місто:
          <input
            value={settings.favCity}
            onChange={(e) =>
              setSettings({ ...settings, favCity: e.target.value })
            }
          />
        </label>
      </div>
    </div>
  );
}
