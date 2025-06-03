using Microsoft.AspNetCore.Mvc;
using System.Text;

namespace ReactApp1.Server.Controllers
{
    [ApiController]
    [Route("api")]
    public class CreateSQLFileController : Controller
    {
        [HttpGet("create-file")]
        public IActionResult CreateSQLFile(string sql)
        {
            string fileName = "users_export.sql";//временное название файла
            byte[] fileByte = Encoding.UTF8.GetBytes(sql);

            return File(fileByte,fileName);
        }
    }
}
