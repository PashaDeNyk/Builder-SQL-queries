using Microsoft.EntityFrameworkCore;
using ReactApp1.Server.DTO;

namespace ReactApp1.Server
{
    public class AppDbContext : DbContext
    {
        public DbSet<User> users { get; set; }

        public DbSet<LastQuery> last_query { get; set; }

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    }
}
