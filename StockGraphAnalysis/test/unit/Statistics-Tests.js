import { average, correlation, dotProduct } from '../../src/Statistics.js';
import { equal } from 'assert';


describe('Statistics', function() {
  describe('average()', function() {
    it('Calculates the average of an array of numbers',
        function() {
          const data = [1, 2, 3];
          const expectedResult = 2;
          equal(expectedResult, average(data));
        });
  });

  describe('average()', function() {
    it('The average of an array of zeros is zero',
        function() {
          const data = [0, 0, 0];
          const expectedResult = 0;
          equal(expectedResult, average(data));
        });
  });

  describe('dotProduct()', function() {
    it('Computes the dot-product of two arrays of numbers.',
        function() {
          const x = [1, 2, 3];
          const expectedResult = x.map(v => v * v).reduce((a, c) => a + c);
          const actualResult = dotProduct(x, x);
          equal(expectedResult, actualResult);
        });
  });

  describe('correlation()', function() {
    it('The correlation of a series with itself is 1',
        function() {
          const data = [1, 2, 3];
          const expectedResult = 1;
          equal(expectedResult, correlation(data, data));
        });
  });

  describe('correlation()', function() {
    it('The correlation of a series with the negative of itself is -1',
        function() {
          const data = [1, 2, 3];
          const expectedResult = -1;
          equal(expectedResult, correlation(data, data.map(d => -1 * d)));
        });
  });

  describe('correlation()', function() {
    it('The correlation of a varying series with an unvarying series is 0',
        function() {
          const data = [1, 2, 3];
          const stationarySeries = [1, 1, 1];
          const expectedResult = 0;
          equal(expectedResult, correlation(data, stationarySeries));
        });
  });

  describe('correlation()', function() {
    it('The correlation of two unvarying series is 1',
        function() {
          const series1 = [-3, -3, -3];
          const series2 = [1, 1, 1];
          const expectedResult = 1;
          equal(expectedResult, correlation(series1, series2));
        });
  });
});
