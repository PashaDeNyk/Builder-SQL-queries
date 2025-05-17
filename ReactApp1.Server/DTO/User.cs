using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ReactApp1.Server.DTO
{
    public class User
    {
        [Column("id")]
        public int Id { get; set; }
        [Column("password")]
        public string Password { get; set; } = "";
        [Column("email")]
        public string Email { get; set; } = "";
    }
}
