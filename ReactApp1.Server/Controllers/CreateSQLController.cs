using Microsoft.AspNetCore.Mvc;
using ReactApp1.Server.Models;

namespace ReactApp1.Server.Controllers
{
    [ApiController]
    [Route("api")]
    public class CreateSQLController : Controller
    {
        [HttpPost]
        public IActionResult CreateSQL([FromBody] QueryModel queryModel)
        {
            string SQL = "";

            return Ok();
        }
    }
}
