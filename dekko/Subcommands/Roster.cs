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
        public static void Execute(string[] args)
        {
            CheckParameterValidity(args);

            var command = args[1];
            string symbol = args.Length > 1 ? args[2] : string.Empty;

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

        public static void Add(string symbol)
        {
            throw new NotImplementedException();
        }

        public static void Remove(string symbol)
        {
            throw new NotImplementedException();
        }

        public static void List()
        {
            throw new NotImplementedException();
        }

        public static void Clear()
        {
            throw new NotImplementedException();
        }
    }
}
