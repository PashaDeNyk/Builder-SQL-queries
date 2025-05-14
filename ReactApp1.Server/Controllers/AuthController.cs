using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ReactApp1.Server.DTO;
using ReactApp1.Server.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace ReactApp1.Server.Controllers
{
    [ApiController]
    [Route("api")]
    public class AuthController : Controller
    {
        //private readonly UserManager<IdentityUser> _userManager;
        //private readonly IConfiguration _configuration;

        //public AuthController(
        //    UserManager<IdentityUser> userManager,
        //    IConfiguration configuration)
        //{
        //    _userManager = userManager;
        //    _configuration = configuration;
        //}

        //[HttpPost("register")]
        //public async Task<IActionResult> Register([FromBody] RegisterDTO registerDto)
        //{
        //    if (!ModelState.IsValid)
        //        return BadRequest(ModelState);

        //    var user = new IdentityUser
        //    {
        //        Email = registerDto.Email
        //    };

        //    var result = await _userManager.CreateAsync(user, registerDto.Password); //зарегистрированный пользователь
        //    if (!result.Succeeded)
        //    {
        //        foreach (var error in result.Errors)
        //        {
        //            ModelState.AddModelError(error.Code, error.Description);
        //        }
        //        return BadRequest(ModelState);
        //    }
        //    var token = GenerateJwtToken(user);
        //    return Ok (new AuthResponseDTO(user.Email, token));
        //    //return Ok(new AuthResponseDTO

        //    //    Email = user.Email,
        //    //    Token = token
        //    // );
        //}

        //private string GenerateJwtToken(IdentityUser user)
        //{
        //    var key = new SymmetricSecurityKey(
        //        Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));

        //    var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        //    var claims = new[]
        //    {
        //    new Claim(JwtRegisteredClaimNames.Email, user.Email),
        //    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        //};

        //    var token = new JwtSecurityToken(
        //        issuer: _configuration["Jwt:Issuer"],
        //        audience: _configuration["Jwt:Audience"],
        //        claims: claims,
        //        expires: DateTime.Now.AddHours(1),
        //        signingCredentials: credentials
        //    );

        //    return new JwtSecurityTokenHandler().WriteToken(token);
        //}

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
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            // Проверка, что пользователь не существует
            if ( _db.users.Any(u => u.Email == register.Email))
                return BadRequest("Пользователь уже существует");
           // if(register.Password != register.Password2)
               // return BadRequest("Неверно введён пароль");

            // Хеширование пароля
            //var passwordHash = BCrypt.Net.BCrypt.HashPassword(model.Password);

            // Создание пользователя
            var user = new User
            {

                Email = register.Email,
                Password = register.Password,
            };

            _db.users.Add(user);
            _db.SaveChanges();

            return Ok("Пользователь зарегистрирован");
        }


        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginModel login)
        {
            // Проверка логина и пароля (можно заменить на проверку в БД)
            if (login.Email != "check@mail.com" || login.Password != "pass_123")
                return Unauthorized("Неверный логин или пароль");

            // Генерация JWT-токена
            var token = GenerateJwtToken(login.Email);
            return Ok(new { Token = token });
        }

        private string GenerateJwtToken(string username)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
            new Claim(ClaimTypes.Name, username),
            new Claim(ClaimTypes.Role, "User") // Можно добавить роли
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
