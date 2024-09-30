import fs from 'node:fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { RandomString} from 'unique-id-key';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// TODO: Define a City class with name and id properties
class City {
  private name: string;
  private id: string;

  constructor (name: string, id?: string) {
    this.name = name;
    this.id = id || RandomString(8);
  }

  getName(): string {
    return this.name;
  }

  getId(): string {
    return this.id;
  }

  static fromJSON(data: { name: string; id: string }): City {
    return new City(data.name, data.id);
  }

}

// TODO: Complete the HistoryService class
class HistoryService {
  private historyFilePath: string;

  constructor() {
    this.historyFilePath = path.resolve(__dirname, 'searchHistory.json');
  }

  // TODO: Define a read method that reads from the searchHistory.json file
  private async read() {
    try{
      const searchHistory = await fs.readFile(this.historyFilePath, 'utf-8');
      // console.log(`search History: `, searchHistory);
      const parsedHistory: City[] = JSON.parse(searchHistory).map(City.fromJSON);
      // console.log(`parsedHistory: `, parsedHistory);
      return parsedHistory;
    } catch (error){
      console.log('Error reading search history file: ', error);
      throw error;
    }
  }

  // TODO: Define a write method that writes the updated cities array to the searchHistory.json file
  private async write(cities: City[]) {
    try{
      await fs.writeFile(this.historyFilePath, JSON.stringify(cities, null, 2), 'utf-8');
      console.log('Search history successfully written to file.');
    } catch (error){
      console.log('Error writing search history file: ', error);
      throw error;
    }
  }

  // Checks if city name is already in searchHistory.json
  private hasCityName(newCity: string, cityList: City[]) {
    const normalizedCity = newCity.trim().toLowerCase();
    return cityList.some(city => city.getName().trim().toLowerCase() === normalizedCity);
}


  // TODO: Define a getCities method that reads the cities from the searchHistory.json file and returns them as an array of City objects
  async getCities(): Promise<City[]> {
    try {
      const parsedCityList: City[] = await this.read();
      return parsedCityList || [];
    } catch (error) {
      console.log('Error getting cities: ', error);
      return [];
    }
  }

  // TODO Define an addCity method that adds a city to the searchHistory.json file
  async addCity(city: string) {
    try {
      const cityList: City[] = await this.getCities() || [];
      const newCity = new City(city);
      // If city name does not yet exist in the list
      if (!this.hasCityName(city, cityList)) {
        cityList.push(newCity);
        await this.write(cityList);
        return true;
      }
    } catch (error) {
      console.error('Error getting city List:', error);
    }  
    return false;
  }

  // * BONUS TODO: Define a removeCity method that removes a city from the searchHistory.json file
  async removeCity(id: string) {
    try {
      const cityList: City[] = await this.read();
      const newCityList = cityList.filter((city: City) => (city.getId() !== id))
      await this.write(newCityList);
      return true;
    } catch (error) {
      console.log('Error removing cities.');
    }
    return false;
  }
}

export { City };
export default new HistoryService();
