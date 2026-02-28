import { StormGlass } from '@src/clients/stormGlass';
import * as HTTPUtil from '@src/utils/request';
import * as stormglassWeatherPointFixture from '@test/fixtures/stormglass_weather_3_hours.json';
import stormglassNormalizedWeatherPointFixture from '@test/fixtures/stormglass_normalized_response_3_hours.json';

jest.mock('@src/utils/request.ts', () => {
  const actual = jest.requireActual('@src/utils/request.ts');
  return {
    ...actual,
    Request: class extends actual.Request {
      get = jest.fn();
    },
  };
});
describe('StormGlass Client', () => {
  const mockedRequest = new HTTPUtil.Request() as jest.Mocked<HTTPUtil.Request>;
  it('should return the normalized forecast from the StormGlass service', async () => {
    const lat = -33;
    const lng = 151;

    mockedRequest.get.mockResolvedValue({
      data: stormglassWeatherPointFixture,
    } as HTTPUtil.Response);

    const stormGlass = new StormGlass(mockedRequest);
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

    mockedRequest.get.mockResolvedValue({
      data: incompleteResponse,
    } as HTTPUtil.Response);

    const stormGlass = new StormGlass(mockedRequest);
    const response = await stormGlass.fetchPoints(lat, lng);

    expect(response).toEqual([]);
  });

  it('should get a generic error from StormGlass service when request fails before reaching the service', async () => {
    const lat = -33;
    const lng = 151;

    mockedRequest.get.mockRejectedValue({ message: 'Network Error' });

    const stormGlass = new StormGlass(mockedRequest);

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

    mockedRequest.get.mockRejectedValue(
      new FakeAxiosError({
        status: 429,
        data: { errors: ['Rate Limit reached'] },
      })
    );

    const stormGlass = new StormGlass(mockedRequest);

    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
      `Unexpected error returned by the StormGlass service: Error: {"errors":["Rate Limit reached"]} Code: 429`
    );
  });
});
