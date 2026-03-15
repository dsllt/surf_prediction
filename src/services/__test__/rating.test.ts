import { Beach, GeoPosition } from '@src/models/beach';
import { Rating } from '../rating';

describe('Rating service', () => {
  const defaultBeachData = {
    lat: -33.792726,
    lng: 151.289824,
    name: 'Manly',
    position: GeoPosition.E,
    user: 'some-user',
  };
  const defaultBeach = new Beach(defaultBeachData);
  const defaultRating = new Rating(defaultBeach);
  describe('Calculate rating for a given point', () => {
    const defaultPoint = {
      swellDirection: 110,
      swellHeight: 0.1,
      swellPeriod: 5,
      time: 'test',
      waveDirection: 110,
      waveHeight: 0.1,
      windDirection: 100,
      windSpeed: 100,
    };
    it('should get a rating less than 1 for a poor point', () => {
      const rating = defaultRating.getRatingForPoint(defaultPoint);
      expect(rating).toBe(1);
    });

    it('should get a rating 3 for a point with offshore wind and a half overhead height', () => {
      const point = {
        ...defaultPoint,
        swellHeight: 0.7,
        windDirection: 250,
      };
      const rating = defaultRating.getRatingForPoint(point);
      expect(rating).toBe(3);
    });

    it('should get a rating of 4 for a point with offshore winds, half overhead high swell and good interval', () => {
      const point = {
        ...defaultPoint,
        ...{
          swellHeight: 0.7,
          swellPeriod: 12,
          windDirection: 250,
        },
      };
      const rating = defaultRating.getRatingForPoint(point);
      expect(rating).toBe(4);
    });

    it('should get a rating of 4 for a point with offshore winds, shoulder high swell and good interval', () => {
      const point = {
        ...defaultPoint,
        ...{
          swellHeight: 1.5,
          swellPeriod: 12,
          windDirection: 250,
        },
      };
      const rating = defaultRating.getRatingForPoint(point);
      expect(rating).toBe(4);
    });

    it('should get a rating of 5 classic day!', () => {
      const point = {
        ...defaultPoint,
        ...{
          swellHeight: 2.5,
          swellPeriod: 16,
          windDirection: 250,
        },
      };
      const rating = defaultRating.getRatingForPoint(point);
      expect(rating).toBe(5);
    });

    it('should get a rating of 4 a good condition but with cross-shore winds', () => {
      const point = {
        ...defaultPoint,
        ...{
          swellHeight: 2.5,
          swellPeriod: 16,
          windDirection: 130,
        },
      };
      const rating = defaultRating.getRatingForPoint(point);
      expect(rating).toBe(4);
    });
  });

  describe('Get rating based on wind and wave position', () => {
    it('should get rating 1 for beach with onshore winds', () => {
      const rating = defaultRating.getRatingBasedOnWindAndWavePosition(
        GeoPosition.E,
        GeoPosition.E
      );
      expect(rating).toBe(1);
    });
    it('should get rating 3 for beach with cross winds', () => {
      const rating = defaultRating.getRatingBasedOnWindAndWavePosition(
        GeoPosition.E,
        GeoPosition.S
      );
      expect(rating).toBe(3);
    });
    it('should get rating 5 for beach with offshore winds', () => {
      const rating = defaultRating.getRatingBasedOnWindAndWavePosition(
        GeoPosition.E,
        GeoPosition.W
      );
      expect(rating).toBe(5);
    });
  });

  describe('Get rating based on swell period', () => {
    it('should get rating 1 for a period of 5 seconds', () => {
      const rating = defaultRating.getRatingBasedOnSwellPeriod(5);
      expect(rating).toBe(1);
    });
    it('should get rating 3 for a period of 9 seconds', () => {
      const rating = defaultRating.getRatingBasedOnSwellPeriod(9);
      expect(rating).toBe(2);
    });
    it('should get rating 5 for a period of 12 seconds', () => {
      const rating = defaultRating.getRatingBasedOnSwellPeriod(12);
      expect(rating).toBe(4);
    });
    it('should get rating 5 for a period of 16 seconds', () => {
      const rating = defaultRating.getRatingBasedOnSwellPeriod(16);
      expect(rating).toBe(5);
    });
  });

  describe('Get rating based on swell height', () => {
    it('should get rating 1 for less than ankle to knee height swell', () => {
      const rating = defaultRating.getRatingForSwellSize(0.2);
      expect(rating).toBe(1);
    });
    it('should get rating 2 for an ankle to knee height swell', () => {
      const rating = defaultRating.getRatingForSwellSize(0.6);
      expect(rating).toBe(2);
    });
    it('should get rating 3 for a waist height swell', () => {
      const rating = defaultRating.getRatingForSwellSize(1.5);
      expect(rating).toBe(3);
    });
    it('should get rating 5 for an overhead height swell', () => {
      const rating = defaultRating.getRatingForSwellSize(2.5);
      expect(rating).toBe(5);
    });
  });

  describe('Get position based on points location', () => {
    it('should get the point based on a east location', () => {
      const response = defaultRating.getPositionFromLocation(92);
      expect(response).toBe(GeoPosition.E);
    });

    it('should get the point based on a north location 1', () => {
      const response = defaultRating.getPositionFromLocation(360);
      expect(response).toBe(GeoPosition.N);
    });

    it('should get the point based on a north location 2', () => {
      const response = defaultRating.getPositionFromLocation(40);
      expect(response).toBe(GeoPosition.N);
    });

    it('should get the point based on a south location', () => {
      const response = defaultRating.getPositionFromLocation(200);
      expect(response).toBe(GeoPosition.S);
    });

    it('should get the point based on a west location', () => {
      const response = defaultRating.getPositionFromLocation(300);
      expect(response).toBe(GeoPosition.W);
    });
  });
});
