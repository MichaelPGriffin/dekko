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

        public static void Execute(string[] args)
        {
            CheckParameterValidity(args);

            var command = args[1];
            string symbol = args.Length > 2 ? args[2] : string.Empty;

            switch (command)
            {
                case "add":
                    Add(symbol);
                    break;
                case "rm":
                    Remove(symbol);
                    break;
                case "ls":
                    List();
                    break;
                case "clear":
                    Clear();
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

        public static void Remove(string symbol)
        {
            throw new NotImplementedException();
        }

        public static void List()
        {
            throw new NotImplementedException();
        }

        public static async Task Clear() =>
            await File.WriteAllTextAsync(RosterPath, string.Empty);
    }
}
