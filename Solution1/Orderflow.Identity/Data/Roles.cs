namespace Orderflow.Identity.Data
{
    public static class Roles
    {
        public const string Admin = nameof(Admin);
        public const string User = nameof(User);

        // Devuelve todos los roles definidos
        public static IEnumerable<string> GetAll()
        {
            yield return Admin;
            yield return User;
        }
    }

}
