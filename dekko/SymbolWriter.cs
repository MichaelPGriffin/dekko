using System.Text;

namespace dekko
{
    internal class SymbolWriter
    {
        public SymbolWriter()
        {
            prefix = "export const symbols = [\n";
            delimitor = ",\n";
            suffix = "];\n\n";
            stringBuilder = new StringBuilder();
            stringBuilder.Append(prefix);
        }

        private string prefix;
        private string delimitor;
        private string suffix;
        private StringBuilder stringBuilder;

        public void Append(string symbol)
        {
            stringBuilder.Append($"\t{symbol}");
            stringBuilder.Append(delimitor);
        }

        public override string ToString()
        {
            if (stringBuilder.Length <= 1)
            {
                throw new InvalidOperationException();
            }

            stringBuilder.Remove(stringBuilder.Length - delimitor.Length, delimitor.Length);
            stringBuilder.Append(suffix);

            return stringBuilder.ToString();
        }
    }
}
