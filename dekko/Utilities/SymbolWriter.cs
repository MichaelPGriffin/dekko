using System.Text;

namespace dekko.Utilities
{
    internal class SymbolWriter
    {
        public SymbolWriter()
        {
            prefix = "export const symbols = [";
            delimitor = ",";
            suffix = "];";
            details = new Queue<string>();
            details.Enqueue(prefix);
        }

        private readonly string prefix;
        private readonly string delimitor;
        private readonly string suffix;
        private string? result;
        private readonly Queue<string> details;

        public void Append(string symbol)
        {
            details.Enqueue($"'{symbol}'");
            details.Enqueue(delimitor);
        }

        public override string ToString()
        {
            if (result != null)
            {
                return result;
            }

            if (details.Count <= 1)
            {
                throw new InvalidOperationException();
            }

            var stringBuilder = new StringBuilder();
            while (details.Count > 1)
            {
                stringBuilder.Append(details.Dequeue());
            }

            stringBuilder.Append(suffix);
            result = stringBuilder.ToString();

            return result;
        }
    }
}
