import { Beach, GeoPosition } from '@src/models/beach';
import nock from 'nock';
import stormglassWeatherPointFixture from '@test/fixtures/stormglass_weather_3_hours.json';
import apiForecastResponse1BeachFixture from '@test/fixtures/api_forecast_response_1_beach.json';
import { User } from '@src/models/users';
import { AuthService } from '@src/services/auth';

describe('Beach forecast functional test', () => {
  let token: string;
  beforeAll(async () => {
    await Beach.deleteMany({});
    await User.deleteMany({});
    const defaultUser = {
      name: 'John Doe',
      email: 'john@email.com',
      password: '1234',
    };
    const user = await new User(defaultUser).save();
    const defaultBeach = {
      lat: -33.792726,
      lng: 151.289824,
      name: 'Manly',
      position: GeoPosition.E,
      user: user.id,
    };
    await new Beach(defaultBeach).save();
    token = AuthService.generateToken(user.toJSON());
  });

  it('should return a forecast with just a few times', async () => {
    nock('https://api.stormglass.io', {
      encodedQueryParams: true,
      reqheaders: {
        Authorization: (): boolean => true,
      },
    })
      .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
      .get('/v2/weather/point')
      .query((actualQuery) => {
        return (
          actualQuery.lat === '-33.792726' &&
          actualQuery.lng === '151.289824' &&
          actualQuery.params ===
            'swellDirection,swellHeight,swellPeriod,waveDirection,waveHeight,windDirection,windSpeed' &&
          actualQuery.source === 'noaa' &&
          typeof actualQuery.end === 'string'
        );
      })
      .reply(200, stormglassWeatherPointFixture);

    const { body, status } = await global.testRequest
      .get('/forecast')
      .set({ 'x-access-token': token });

    expect(status).toBe(200);
    expect(body).toEqual(apiForecastResponse1BeachFixture);
  });

  it('should return 500 if something goes wrong during the processing', async () => {
    nock('https://api.stormglass.io', {
      encodedQueryParams: true,
      reqheaders: {
        Authorization: (): boolean => true,
      },
    })
      .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
      .get('/v2/weather/point')
      .query((actualQuery) => actualQuery.lat === '-33.792726' && actualQuery.lng === '151.289824')
      .replyWithError('Something went wrong.');

    const { status } = await global.testRequest
      .get('/forecast')
      .set({ 'x-access-token': token });

    expect(status).toBe(500);
  });
});
