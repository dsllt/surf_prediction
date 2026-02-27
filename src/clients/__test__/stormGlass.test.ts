import { StormGlass } from '@src/clients/stormGlass';
import axios from 'axios';
import * as stormglassWeatherPointFixture from '@test/fixtures/stormglass_weather_3_hours.json';
import * as stormglassNormalizedWeatherPointFixture from '@test/fixtures/stormglass_normalized_response_3_hours.json';

jest.mock('axios');
describe('StormGlass Client', () => {
  it('should return the normalized forecast from the StormGlass service', async () => {
    const lat = -33;
    const lng = 151;

    axios.get = jest.fn().mockResolvedValue(stormglassWeatherPointFixture);

    const stormGlass = new StormGlass(axios);
    const response = await stormGlass.fetchPoints(lat, lng);

    expect(response).toEqual(stormglassNormalizedWeatherPointFixture);
  });
});
