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
        public string? Message { get; init; }

        public string? ErrorMessage { get; init; }

        public IEnumerable<string> Errors { get; set; } = new List<string>();

        public static ServiceResult SuccessResult(string message="") => new() { Success = true, Message= message };
        public static ServiceResult Failure(string error) => new() { Success = false, ErrorMessage = error };
    }

    public class ServiceResult<T> : ServiceResult
    {
        public T? Data { get; set; }

        public static ServiceResult<T> SuccessResult(T data, string message = "")
        {
            return new ServiceResult<T>
            {
                Success = true,
                Data = data,
                Message = message
            };
        }

        public new static ServiceResult<T> Failure(IEnumerable<string> errors)
        {
            return new ServiceResult<T>
            {
                Success = false,
                Errors = errors
            };
        }

        public new static ServiceResult<T> Failure(string error)
        {
            return new ServiceResult<T>
            {
                Success = false,
                Errors = new[] { error }
            };
        }
    }
}
