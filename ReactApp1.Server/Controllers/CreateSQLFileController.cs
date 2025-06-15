using Microsoft.AspNetCore.Mvc;
using ReactApp1.Server.Models;
using System.Text;

namespace ReactApp1.Server.Controllers
{
    [ApiController]
    [Route("api")]
    public class CreateSQLFileController : Controller
    {
        [HttpPost("create-file")]
        public IActionResult CreateSQLFile([FromBody] QueryStringModel model)
        {
            string fileName = "users_export.sql";//временное название файла
            byte[] fileByte = Encoding.UTF8.GetBytes(model.Query);

            return File(fileByte,"application/sql",fileName);
        }
    }
}
