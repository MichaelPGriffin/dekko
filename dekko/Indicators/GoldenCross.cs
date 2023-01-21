using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace dekko.Indicators
{
    /// <summary>
    /// This indicator is TRUE when a timeseries of prices has a 50 day moving average
    /// that is lower than the 200 day moving average, and then becomes greater than the
    /// 200 day moving average.
    /// </summary>
    internal class GoldenCross
    {
        private const int SmallWindowLength = 50;
        private const int LargeWindowLength = 200;

        public GoldenCross(decimal[] prices)
        {
            SmallWindowMovingAverageSeries = MovingAverage(prices, SmallWindowLength);

            LargeWindowMovingAverageSeries = MovingAverage(prices, LargeWindowLength)
                .TakeLast(SmallWindowMovingAverageSeries.Count());
        }

        private IEnumerable<decimal> SmallWindowMovingAverageSeries { get; set;}
        private IEnumerable<decimal> LargeWindowMovingAverageSeries { get; set; }

        private static IEnumerable<decimal> MovingAverage(decimal[] prices, int windowLength)
        {
            if (prices.Length < windowLength)
            {
                string errorMessage = "Not enough data to calculate moving average.\n" +
                    $"{prices.Length} price data points with window length {windowLength}";

                throw new ArgumentException(errorMessage);
            }

            var result = new List<decimal>();
            var total = prices.Skip(0).Take(windowLength).Aggregate((x, y) => x + y);
            result.Add(total / windowLength);

            for (int i = 1; i < prices.Length - windowLength + 1; i++)
            {
                total = total - prices[i - 1] + prices[i + windowLength - 1];
                result.Add(total / windowLength);
            }

            return result;
        }
    }
}
