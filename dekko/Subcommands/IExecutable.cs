﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace dekko.Subcommands
{
    internal interface IExecutable
    {
        Task Execute(string[] args);
    }
}
