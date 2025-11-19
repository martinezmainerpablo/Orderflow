using Asp.Versioning.Builder;
using Asp.Versioning;

namespace Orderflow.Identity.Features.Auth
{
    public static class AuthGroup
    {
        //esto es para agrupar las rutas del AuthController
        public static RouteGroupBuilder MapAuthGroup(this IEndpointRouteBuilder routes)
        {
            var versionSet = routes.NewApiVersionSet()
                .HasApiVersion(new ApiVersion(1, 0))
                .ReportApiVersions()
                .Build();

            var group = routes.MapGroup("/api/v{version: ApiVersion}/auth");

            group.WithApiVersionSet(versionSet);
            //nombre que creamos nosotros
            group.WithTags("Auth");
            return group;
        }
    }
}
