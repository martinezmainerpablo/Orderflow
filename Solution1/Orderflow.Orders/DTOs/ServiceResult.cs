namespace Orderflow.Orders.DTOs
{

    public class ServiceResult
    {
        public bool IsSuccess { get; set; }

        public string Message { get; set; } = string.Empty;

        public IEnumerable<string> Errors { get; set; } = new List<string>();

    }

    public class ServiceResult<T> : ServiceResult
    {
        public T? Data { get; set; }

        public static ServiceResult<T> Success(T data, string message = "")
        {
            return new ServiceResult<T>
            {
                IsSuccess = true,
                Data = data,
                Message = message
            };
        }

        public new static ServiceResult<T> Failure(IEnumerable<string> errors)
        {
            return new ServiceResult<T>
            {
                IsSuccess = false,
                Errors = errors
            };
        }

        public new static ServiceResult<T> Failure(string error)
        {
            return new ServiceResult<T>
            {
                IsSuccess = false,
                Errors = new[] { error }
            };
        }
    }
}