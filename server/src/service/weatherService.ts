import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Adjust the path to point to the .env file in the server folder
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// TODO: Define an interface for the Coordinates object
interface Coordinates {
  name: string;
  lat: number;
  lon: number;
  [key: string]: any;
}

interface weatherEntry {
  dt_txt: string;
  [key: string]: any;
}

// TODO: Define a class for the Weather object
class Weather {
  private city: string;
  private date: string;
  private icon: string;
  private iconDescription: string;
  private tempF: number;
  private windSpeed: number;
  private humidity: number;

  constructor (city: string, date: string, icon: string, iconDescription: string, tempF : number, windSpeed: number, humidity: number) {
    this.city = city;
    this.date = date;
    this.icon = icon;
    this.iconDescription = iconDescription;
    this.tempF = tempF;
    this.windSpeed = windSpeed;
    this.humidity = humidity;
  }

  getData() {
    return [this.city, this.date, this.icon, this.iconDescription, this.tempF, this.windSpeed, this.humidity];
  }
}

// TODO: Complete the WeatherService class
class WeatherService {
  // TODO: Define the baseURL, API key, and city name properties
  // private baseURL = process.env.API_BASE_URL;
  private apiKey = process.env.API_KEY;
  private cityName = "";

  // TODO: Create fetchLocationData method
  private async fetchLocationData(query: string): Promise<Coordinates>{
    const queryURL = this.buildGeocodeQuery(query);
    const response = await fetch(queryURL);
    const parsedRes = await response.json();
    const locData : Coordinates = {
      name: parsedRes[0].name,
      lat: parsedRes[0].lat,
      lon: parsedRes[0].lon
    };
    return locData;
  }

  // TODO: Create destructureLocationData method
  private destructureLocationData(locationData: Coordinates): Coordinates {
    const locData : Coordinates = {
      name: locationData.name,
      lat: locationData.lat,
      lon: locationData.lon
    }
    return locData;
  }

  // TODO: Create buildGeocodeQuery method
  private buildGeocodeQuery(query: string): string {
    const queryURL = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=1&appid=${this.apiKey}`;
    return queryURL;
  }

  // TODO: Create buildWeatherQuery method
  private buildWeatherQuery(coordinates: Coordinates): string {
    const queryURL = `http://api.openweathermap.org/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}&units=imperial&cnt=45`;
    return queryURL;
  }

  // TODO: Create fetchAndDestructureLocationData method
  private async fetchAndDestructureLocationData() {
    const locData = await this.fetchLocationData(this.cityName);
    return this.destructureLocationData(locData);
  }

  // TODO: Create fetchWeatherData method
  private async fetchWeatherData(coordinates: Coordinates) {
    try {
      const queryURL = this.buildWeatherQuery(coordinates);
      const response = await fetch(queryURL);
      const weatherData = await response.json();
      return weatherData;
    } catch (error) {
      console.error('Error retrieving weather data:', error);
    }
    
  }

  // TODO: Build parseCurrentWeather method
  // Takes an item within the data "list" and convert into Weather object
  private parseCurrentWeather(response: any): Weather {
    const city = this.cityName;
    const currDate = response.dt_txt.split(' ')[0];
    const currWeather = new Weather(
      city,
      currDate,
      response.weather[0].icon,
      response.weather[0].description,
      response.main.temp,
      response.wind.speed,
      response.main.humidity
    );
    return currWeather;
  }

  // TODO: Complete buildForecastArray method
  private buildForecastArray(currentWeather: Weather, weatherData: any[]) {
    weatherData.push(currentWeather);
    return weatherData;
  }

  // TODO: Complete getWeatherForCity method
  async getWeatherForCity(cityName: string) {
    this.cityName = cityName;
    const cityCoord = await this.fetchAndDestructureLocationData();
    const weatherData = await this.fetchWeatherData(cityCoord);

    const weatherList: Weather[] = [];
    const checkList: Set<string> = new Set();
    // Collects all data at 3PM
    // const temperatureAt3PM = weatherData.list.filter((entry: weatherEntry) => entry.dt_txt.includes("15:00:00"));

    // Collects all data of unique date
    const uniqueDates = weatherData.list.filter((entry: weatherEntry) => {
      if (checkList.has(entry.dt_txt.split(' ')[0])){
        return false;
      } else {
        checkList.add(entry.dt_txt.split(' ')[0]);
        return true;
      }
    });
    for (const entry of uniqueDates) {
      const entryWeather = this.parseCurrentWeather(entry);
      this.buildForecastArray(entryWeather, weatherList);
    }
    return weatherList;
  }
}

export default new WeatherService();
