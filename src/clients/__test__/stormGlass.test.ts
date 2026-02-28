import { StormGlass } from '@src/clients/stormGlass';
import axios from 'axios';
import * as stormglassWeatherPointFixture from '@test/fixtures/stormglass_weather_3_hours.json';
import stormglassNormalizedWeatherPointFixture from '@test/fixtures/stormglass_normalized_response_3_hours.json';

jest.mock('axios');
describe('StormGlass Client', () => {
  const mockedAxios = axios as jest.Mocked<typeof axios>;
  it('should return the normalized forecast from the StormGlass service', async () => {
    const lat = -33;
    const lng = 151;

    mockedAxios.get.mockResolvedValue({ data: stormglassWeatherPointFixture });

    const stormGlass = new StormGlass(mockedAxios);
    const response = await stormGlass.fetchPoints(lat, lng);

    expect(response).toEqual(stormglassNormalizedWeatherPointFixture);
  });

  it('should exclude incomplete data points', async () => {
    const lat = -33;
    const lng = 151;

    const incompleteResponse = {
      hours: [
        {
          time: '2020-04-26T00:00:00+00:00',
          windDirection: {
            noaa: 299.45,
          },
        },
      ],
    };

    mockedAxios.get.mockResolvedValue({ data: incompleteResponse });

    const stormGlass = new StormGlass(mockedAxios);
    const response = await stormGlass.fetchPoints(lat, lng);

    expect(response).toEqual([]);
  });

  it('should get a generic error from StormGlass service when request fails before reaching the service', async () => {
    const lat = -33;
    const lng = 151;

    mockedAxios.get.mockRejectedValue({ message: 'Network Error' });

    const stormGlass = new StormGlass(mockedAxios);

    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
      'Unexpected error when trying to communicate to StormGlass: Network Error'
    );
  });

  it('should get an StormGlassResponseError when the StormGlass service responds with error', async () => {
    const lat = -33.792726;
    const lng = 151.289824;

    class FakeAxiosError extends Error {
      constructor(public response: object) {
        super();
      }
    }

    mockedAxios.get.mockRejectedValue(
      new FakeAxiosError({
        status: 429,
        data: { errors: ['Rate Limit reached'] },
      })
    );

    const stormGlass = new StormGlass(mockedAxios);

    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
      'Unexpected error returned by the StormGlass service: Error: {"errors":["Rate Limit reached"]} Code: 429'
    );
  });
});
