using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Numerics;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;

namespace dekko
{
    internal class ScriptRunner
    {
        public ScriptRunner(string fullPath)
        {
            var startInfo = new ProcessStartInfo();
            startInfo.FileName = "C:\\Program Files\\Git\\bin\\sh.exe";
            // startInfo.Arguments = "run.sh";
            startInfo.Arguments = "C:\\Users\\Owner\\Projects\\dekko\\StockPriceTimeseries\\run.sh";
            startInfo.UseShellExecute = false;
            startInfo.RedirectStandardOutput = true;
            startInfo.RedirectStandardError = true;
            startInfo.CreateNoWindow = true;

            SpawnedProcess = new Process();
            SpawnedProcess.StartInfo = startInfo;
        }

        public readonly Process SpawnedProcess;

        public void Start()
        {
            SpawnedProcess.OutputDataReceived += new DataReceivedEventHandler(OutputHandler);
            SpawnedProcess.ErrorDataReceived += new DataReceivedEventHandler(OutputHandler);
            SpawnedProcess.Start();
            SpawnedProcess.BeginOutputReadLine();
            SpawnedProcess.BeginErrorReadLine();
            SpawnedProcess.WaitForExit();
        }

        static void OutputHandler(object sender, DataReceivedEventArgs outLine)
        {
            Console.WriteLine(outLine.Data);
        }
    }
}
