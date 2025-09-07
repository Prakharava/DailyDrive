# DailyDrive - Modern Productivity Dashboard

A sleek, all-in-one productivity dashboard featuring a weather widget, digital clock, to-do list, Pomodoro timer, and inspirational quotes. Built with vanilla JavaScript and modern CSS.

## Features

- **Weather Widget**
  - Real-time weather information
  - Location-based weather data
  - Temperature, conditions, wind, and humidity display

- **Digital Clock**
  - Real-time clock with seconds
  - Current date display
  - Clean, modern design

- **To-Do List**
  - Add, complete, and delete tasks
  - Persistent storage using localStorage
  - Clean, intuitive interface

- **Pomodoro Timer**
  - Customizable work/break intervals
  - Visual progress indicator
  - Session tracking

- **Inspirational Quotes**
  - Random quotes on demand
  - Author attribution
  - New quote button

- **Hourly Planner**
  - Plan your day hour by hour
  - Visual time tracking
  - Task scheduling


## 🛠Technologies Used

- **Frontend**
  - HTML
  - CSS
  - JavaScript

- **APIs**
  - [Open-Meteo](https://open-meteo.com/) (for weather data)
  - [Quotable](https://github.com/lukePeavey/quotable) (for quotes)

## Project Structure

```
dailydrive/
├── index.html          # Main HTML file
├── styles/
│   └── styles.css      # All styles
└── js/
    ├── main.js         # Main application logic
    ├── weather.js      # Weather widget functionality
    ├── clock.js        # Clock functionality
    ├── todo.js         # To-do list functionality
    ├── pomodoro.js     # Pomodoro timer
    ├── quotes.js       # Quote functionality
    └── planner.js      # Hourly planner functionality
```

## Configuration

The weather feature uses the [Open-Meteo API](https://open-meteo.com/) which doesn't require an API key for basic usage. The weather data is fetched based on the user's geolocation or defaults to New Delhi, India if location access is not available.

## Design Philosophy

- **Minimalist Interface**: Clean, uncluttered design focused on usability
- **Responsive**: Works on desktop and tablet devices
- **Dark Theme**: Easy on the eyes for extended use

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## Acknowledgments

- Weather data provided by [Open-Meteo](https://open-meteo.com/)
- Quotes provided by [Quotable](https://github.com/lukePeavey/quotable)
- Inspired by modern productivity tools and dashboards

## Contact

Prakhar Srivastava - prakhar.srivastava_cs22@gla.ac.in

Project Link: [https://github.com/yourusername/dailydrive](https://github.com/yourusername/dailydrive)
