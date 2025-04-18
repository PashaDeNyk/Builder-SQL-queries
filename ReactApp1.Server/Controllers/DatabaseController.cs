using Microsoft.AspNetCore.Mvc;
using ReactApp1.Server.Models;
using Npgsql;

namespace ReactApp1.Server.Controllers
{
    [ApiController]
    [Route("api/database")]
    public class DatabaseController : Controller
    {
        [HttpPost("connect")]
        public IActionResult Connect([FromBody] DBConfig config)
        {
            try
            {
                var connectionString = $"Host={config.Host};Port={config.Port};Database={config.Database};Username={config.Username};Password={config.Password}";
               // using var connection = new NpgsqlConnection(connectionString);
                return Ok(new { Message = "Connection succeed" });
            }
            catch (Exception e)
            {
                return BadRequest(new { Error = e.Message });
            }
        }
    }
}
