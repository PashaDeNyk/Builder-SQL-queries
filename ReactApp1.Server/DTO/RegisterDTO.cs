using System.ComponentModel.DataAnnotations;

namespace ReactApp1.Server.DTO
{
    public record RegisterDTO
    {
        [EmailAddress] public string Email;
        [DataType(DataType.Password)] public string Password;
        [DataType(DataType.Password)] public string Password2;

    }
}
