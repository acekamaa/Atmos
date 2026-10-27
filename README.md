# Atmos

Atmos is a small, responsive weather app. Search for a location to see its current weather, then switch the temperature display between Celsius and Fahrenheit.

## Features

- Search by city or location.
- Fetch current conditions from the Visual Crossing Weather API.
- Display temperature, feels-like temperature, conditions, humidity, wind speed, and precipitation.
- Switch temperature values between °C and °F.
- Show an accessible loading indicator while a weather request is in progress.
- Show a readable error message if the request fails or the location cannot be found.

## Run locally

The app is plain HTML, CSS, and JavaScript; it does not require a build step or package installation. From the project directory, start a local web server:

```sh
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000) in your browser. You can stop the server with Ctrl+C.

Opening `index.html` directly may prevent the browser from making API requests correctly, so use a local server.

## API configuration

Weather requests are made from `script.js` to the Visual Crossing Timeline API. The request asks for current conditions in metric units. The response is normalized to the fields used by the interface before it is displayed.

The demo currently has its Visual Crossing API key in the front-end JavaScript. This makes the key visible to anyone who can inspect the app or its network requests. This is suitable only for a private practice project. For a public deployment, revoke or rotate the exposed key and move it to a server-side endpoint; do not ship a private API key in browser code.

## Project files

- `index.html` — page structure, location form, loading component, and weather display.
- `styles.css` — responsive layout, visual styling, and spinner animation.
- `script.js` — API request, response processing, rendering, loading/error states, and temperature-unit toggle.

## Try network throttling

To confirm the loading indicator while the request is delayed:

1. Open browser DevTools and select the **Network** panel.
2. Choose a throttled profile such as **Slow 3G** or **Fast 3G** from the network throttling menu.
3. Search for a location in Atmos. The loading indicator should appear until the request succeeds or fails.
4. Restore the network profile to **No throttling** when finished.