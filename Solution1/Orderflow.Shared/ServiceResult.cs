using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Orderflow.Shared
{
    public class ServiceResult
    {
        public bool Success { get; init; }
        public string? ErrorMessage { get; init; }

        public static ServiceResult SuccessResult() => new() { Success = true };
        public static ServiceResult Failure(string message) => new() { Success = false, ErrorMessage = message };
    }
}
