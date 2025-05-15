using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ReactApp1.Server.DTO;
using ReactApp1.Server.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace ReactApp1.Server.Controllers
{
    [ApiController]
    [Route("api")]
    public class AuthController : Controller
    {

        private readonly AppDbContext _db;
        private readonly IConfiguration _config;
        public AuthController(AppDbContext db, IConfiguration config)
        {
            _db = db;
            _config = config;
        }

        [HttpPost("register")]
        public IActionResult Register([FromBody] RegisterModel register)
        {
            string response = "\"status\":";

            if (!ModelState.IsValid)
            {
                response += $"\"error\" \"error\": {ModelState}";
                //response = JsonSerializer.Serialize(response);
                return BadRequest(response);
            }
            if (_db.users.Any(u => u.Email == register.Email))
            {
                response += "\"error\" \"error\": User already exists";
                //response = JsonSerializer.Serialize(response);
                return BadRequest(response);
            }

            // Хеширование пароля
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(register.Password);
            // Создание пользователя
            var user = new User
            {

                Email = register.Email,
                Password = passwordHash,
            };

            _db.users.Add(user);
            _db.SaveChanges();
            response += "\"success\"";
            //response = JsonSerializer.Serialize(response);
            return Ok(response);
        }


        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginModel login)
        {
            string response = "\"status\":";
            var user = _db.users.SingleOrDefault(u => u.Email == login.Email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(login.Password, user.Password))
            {
                response += "\"error\" \"error\": Email or password is incorrect";
                //response = JsonSerializer.Serialize(response);
                return BadRequest(response);
            }

            // Генерация JWT-токена
            var token = GenerateJwtToken(login.Email);
            response += $"\"success\" \"token\": {token}";
            return Ok(response);
        }

        private string GenerateJwtToken(string email)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.Email, email)
            };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(1),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
