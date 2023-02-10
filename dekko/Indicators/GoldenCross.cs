namespace dekko.Indicators
{
    /// <summary>
    /// This indicator is TRUE when a timeseries of prices has a 50 day moving average
    /// that is lower than the 200 day moving average, and then becomes greater than the
    /// 200 day moving average. (50 vs 200 is traditional, may reconfigure)
    /// </summary>
    internal class GoldenCross
    {
        private const int SmallWindowLength = 50;
        private const int LargeWindowLength = 100;

        public GoldenCross(decimal[] prices)
        {
            LargeWindowSeries = MovingAverage(prices, LargeWindowLength);

            SmallWindowSeries = MovingAverage(prices, SmallWindowLength)
                .TakeLast(LargeWindowSeries.Count());
        }

        private IEnumerable<decimal> SmallWindowSeries { get; set;}
        private IEnumerable<decimal> LargeWindowSeries { get; set; }

        public bool IsTrue()
        {
            var a = SmallWindowSeries.Select(x => (double)x).ToArray();
            var b = LargeWindowSeries.Select(x => (double)x).ToArray();

            return IsGoldenCross(a, b);
        }

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

        private static bool IsGoldenCross(double[] smallWindowMovingAvg, double[] largeWindowMovingAvg)
        {
            if (smallWindowMovingAvg == null || largeWindowMovingAvg == null)
            {
                string message = $"Parameters `{nameof(smallWindowMovingAvg)}` and `{nameof(largeWindowMovingAvg)}` must both be non-null";
                throw new NullReferenceException(message);
            }

            if (smallWindowMovingAvg.Length != largeWindowMovingAvg.Length)
            {
                throw new InvalidOperationException();
            }

            int sign = 1;
            for (int i = 0; i < smallWindowMovingAvg.Length; i++)
            {
                // By construction these sequences should never have the same values.
                if (i > 0 && smallWindowMovingAvg[i] == largeWindowMovingAvg[i] && smallWindowMovingAvg[i - 1] == largeWindowMovingAvg[i - 1])
                {
                    return false;
                }

                var current50DMA = smallWindowMovingAvg[i];
                var current200DMA = largeWindowMovingAvg[i];

                // Encountered the crossover point?
                if (sign == 1 && current50DMA - current200DMA > 0)
                {
                    sign = -1;
                }

                // Cross pattern does not hold for sequence?
                if (sign * (current50DMA - current200DMA) > 0)
                {
                    return false;
                }
            }

            return true;
        }
    }
}
