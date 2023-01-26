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
            SmallWindowSeries = MovingAverage(prices, SmallWindowLength);

            LargeWindowSeries = MovingAverage(prices, LargeWindowLength)
                .TakeLast(SmallWindowSeries.Count());
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

        private static bool IsGoldenCross(double[] datapoints50DMA, double[] datapoints200DMA)
        {
            if (datapoints50DMA == null || datapoints200DMA == null)
            {
                string message = $"Parameters `{nameof(datapoints50DMA)}` and `{nameof(datapoints200DMA)}` must both be non-null";
                throw new NullReferenceException(message);
            }

            if (datapoints50DMA.Length != datapoints200DMA.Length)
            {
                throw new InvalidOperationException();
            }

            int sign = 1;
            for (int i = 0; i < datapoints50DMA.Length; i++)
            {
                // By construction these sequences should never have the same values.
                if (i > 0 && datapoints50DMA[i] == datapoints200DMA[i] && datapoints50DMA[i - 1] == datapoints200DMA[i - 1])
                {
                    return false;
                }

                var current50DMA = datapoints50DMA[i];
                var current200DMA = datapoints200DMA[i];

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
