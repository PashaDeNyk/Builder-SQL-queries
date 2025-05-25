using Microsoft.AspNetCore.Mvc;
using Npgsql;
using ReactApp1.Server.Models;

namespace ReactApp1.Server.Controllers
{
    [ApiController]
    [Route("api/database")]
    public class ConnectDatabaseController : Controller
    {
        [HttpPost("connect")]
        public IActionResult Connect([FromBody] DBConfig config)
        {
            try
            {
                var connectionString = $"Host={config.Host};Port={config.Port};Database={config.Database};Username={config.Username};Password={config.Password}";
                ConnectionString.connectionString = connectionString;
                using (var connection = new NpgsqlConnection(connectionString))
                {
                    connection.Open();
                    connection.Close();
                }
                return Ok("Connection success");
            }
            catch (Exception e)
            {
                return BadRequest(new { Error = e.Message });
            }
        }
    }
}
