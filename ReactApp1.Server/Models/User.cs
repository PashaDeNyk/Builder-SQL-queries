using System.ComponentModel.DataAnnotations;

namespace ReactApp1.Server.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Password { get; set; }
        public string Email { get; set; }
    }
}
