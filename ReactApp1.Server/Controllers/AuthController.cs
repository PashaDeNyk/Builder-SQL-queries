using Microsoft.AspNetCore.Authorization;
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
        public static int user_id_tmp = 0;


        private readonly AppDbContext _db;
        private readonly IConfiguration _config;
        public AuthController(AppDbContext db, IConfiguration config)
        {
            _db = db;
            _config = config;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterModel register)
        {
            string response = "\"status\":";

            if (!ModelState.IsValid)
            {
                response += $"\"error\" \"error\": {ModelState}";
                return BadRequest(response);
            }
            if (_db.users.Any(u => u.Email == register.Email))
            {
                response += "\"error\" \"error\": User already exists";
                return BadRequest(response);
            }

            // Хеширование пароля
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(register.Password);
            // Создание пользователя
            var user = new User
            {
                Email = register.Email,
                Password = passwordHash

            };



            _db.users.Add(user);
            _db.SaveChanges();
            response += "\"success\"";
            return Ok(response);
        }


        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel login)//возвращать что пользователя нет
        {
            string response = "\"status\":";

            if (!ModelState.IsValid)
            {
                response += $"\"error\" \"error\": {ModelState}";
                return BadRequest(response);
            }
            var user = _db.users.SingleOrDefault(u => u.Email == login.Email);

            if (user == null)
            { return BadRequest("User not found"); }

            if (!BCrypt.Net.BCrypt.Verify(login.Password, user.Password))
            {
                response += "\"error\" \"error\": Email or password is incorrect";
                return BadRequest(response);
            }

            // Генерация JWT-токена
            var token = GenerateJwtToken(login.Email, user.Id);
            user.JWT = token;
            user_id_tmp = user.Id;
            _db.users.Update(user);

            //проверка что у пользователя существует такая запись
            //если нет, то создаёт новую
            //иначе находить запись и отправлять клииенту
            var last_query_string = "";
            var l_query = _db.last_query.SingleOrDefault(l => l.User_ID == user.Id);//находим соответствующего пользователя
            if (l_query != null)//если пользователь найден
            {
                last_query_string = l_query.Query;//записываем сохранённый запроc
            }
            else
            {
                var lQuery = new LastQuery
                {
                    User_ID = user.Id
                };
                _db.last_query.Add(lQuery);
            }
            await _db.SaveChangesAsync();
            response += $"\"success\" \"token\": {token}";
            return Ok(response);
            //return Ok(new { Response = response, Query = last_query_string });
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            try
            {
                // 1. Получаем email пользователя из JWT токена
                var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;

                if (string.IsNullOrEmpty(userEmail))
                {
                    return Unauthorized();
                }

                // 2. Находим пользователя в БД
                var user = await _db.users.FirstOrDefaultAsync(u => u.Email == userEmail);

                if (user == null)
                {
                    return NotFound();
                }

                // 3. Удаляем JWT токен
                user.JWT = null;
                _db.users.Update(user);
                await _db.SaveChangesAsync();

                // 4. Возвращаем успешный ответ
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest();
            }
        }

        [HttpGet("check-token")]
        public IActionResult CheckTokenValidity()
        {
            try
            {
                // 1. Получаем срок действия токена из claims
                var expiryClaim = User.FindFirst(JwtRegisteredClaimNames.Exp)?.Value;
                if (string.IsNullOrEmpty(expiryClaim))
                {
                    return BadRequest();
                }

                // 2. Конвертируем Unix timestamp в DateTime
                var expiryDate = DateTimeOffset.FromUnixTimeSeconds(long.Parse(expiryClaim)).DateTime;
                var timeRemaining = expiryDate - DateTime.UtcNow;

                // 3. Проверяем, не истек ли токен
                if (timeRemaining <= TimeSpan.Zero)
                {
                    return Ok();
                }

                // 4. Возвращаем информацию о времени жизни
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }


        [HttpPost("save-query")]
        public async Task<IActionResult> SaveQuery([FromBody] QueryStringModel query)
        {
            try
            {
                var user = _db.last_query.SingleOrDefault(u => u.User_ID == user_id_tmp); // иещм соответствующего пользователя в LastQuery

                user.Query = query.Query;
                _db.last_query.Update(user);
                await _db.SaveChangesAsync();
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }

        private string GenerateJwtToken(string email, int userID)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
            var expiryDate = DateTime.UtcNow.AddHours(1);

            var claims = new[]
            {
                new Claim(ClaimTypes.Email, email),
                new Claim("userid",userID.ToString()),
                new Claim(JwtRegisteredClaimNames.Exp,new DateTimeOffset(expiryDate).ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64)
            };

            ClaimsIdentity id = new ClaimsIdentity(claims);

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
