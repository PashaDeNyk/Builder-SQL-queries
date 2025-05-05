using System.ComponentModel.DataAnnotations;

namespace ReactApp1.Server.Models
{
    public class Person
    {
        public int Id {get;set;}
        [EmailAddress]
        public string Email { get; set; }
        [DataType(DataType.Password)]
        public string Password { get; set; }
        public Person(string email, string password)
        {
            Email = email;
            Password = password;
        }
    }
}
