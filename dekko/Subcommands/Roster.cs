using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;

namespace dekko.Subcommands
{
    internal static class Roster
    {
        private static readonly string RosterPath = @"C:\\Users\\Owner\\Projects\\dekko\\.refs\\roster";

        public static async Task Execute(string[] args)
        {
            CheckParameterValidity(args);

            var command = args[1];
            string symbol = args.Length > 1 ? args[1] : string.Empty;

            switch (command)
            {
                case "add":
                    await Add(symbol);
                    break;
                case "rm":
                    await RemoveAsync(symbol);
                    break;
                case "ls":
                    List();
                    break;
                case "clear":
                    await Clear();
                    break;
                default:
                    throw new ArgumentException($"Invalid parameter passed to `roster` method: {command}");
            }
        }
        
        private static void CheckParameterValidity(string[] args)
        {
            if (args == null || args.Length < 2)
            {
                throw new ArgumentException("Invalid parameters passed to `roster` method");
            }
        }

        public async static Task Add(string symbol) =>
            await File.AppendAllTextAsync(RosterPath, $"{symbol}\n");

        public static async Task RemoveAsync(string symbol)
        {
            var symbols = await File.ReadAllLinesAsync(RosterPath);
            var filteredSymbols = symbols.Where(s => s != symbol);
            await File.AppendAllLinesAsync(RosterPath, filteredSymbols);
        }

        public static void List()
        {
            var symbols = File.ReadAllLines(RosterPath);

            foreach(var symbol in symbols)
            {
                Console.WriteLine(symbol);
            }
        }

        public static async Task Clear() =>
            await File.WriteAllTextAsync(RosterPath, string.Empty);
    }
}
