import { Router } from 'express';
const router = Router();

import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

// TODO: POST Request with city name to retrieve weather data
router.post('/', async (req, res) => {
  // TODO: GET weather data from city name
  const { cityName } = req.body;

  if (!cityName) {
    return res.status(400).json({ error: 'City name is required' });
  } 
  const weatherData = await WeatherService.getWeatherForCity(cityName);
  
  // TODO: save city to search history
  HistoryService.addCity(cityName);
  res.json(weatherData);
  return weatherData;
});

// TODO: GET search history
router.get('/history', async (_req, res) => {
  try {
    const cities = await HistoryService.getCities();
    res.json(cities);
  } catch (error) {
    console.error('Error retrieving search history:', error);
    res.status(500).json({ error: 'Failed to retrieve search history' });
  }
});

// * BONUS TODO: DELETE city from search history
router.delete('/history/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const ifDone = await HistoryService.removeCity(id);
    if (ifDone) {
      res.status(200).json({ message: 'City deleted successfully' });
    } else {
      res.status(404).json({ error: 'City not found' });
    }
  } catch (error){
    console.error('Error deleting city:', error);
    res.status(500).json({ error: 'Failed to delete city' });
  }
  
});

export default router;
