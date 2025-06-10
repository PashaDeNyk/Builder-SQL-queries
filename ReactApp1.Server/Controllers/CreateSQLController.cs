using Microsoft.AspNetCore.Mvc;
using ReactApp1.Server.Models;
using System.Globalization;
using System.Threading.Tasks;

namespace ReactApp1.Server.Controllers
{
    [ApiController]
    [Route("api")]
    public class CreateSQLController : Controller
    {
        [HttpPost("create-query")]
        public async Task<IActionResult> CreateSQL([FromBody] QueryModel queryModel)//ОСНОВНАЯ ПРОБЛЕМА С ИСПОЛЬЗОВАНИЕМ LIST
        {
            string SQL = "";

            if(queryModel.Select == null) //без SELECT ничего не получится
            {
                return BadRequest("Wrong query model -> need SELECT");
            }


            if (queryModel.Select != null)//внутри селекта могут быть AVG COUNT и также их название по типу COUNT(*) as count_c
            {
                SQL += $"Select {queryModel.Select} from {queryModel.Name}";
            }

            //временно, пока не увверен в item3, item4 -> это если не cross join и нужно условие 
            if (queryModel.Join.Item1 != null && queryModel.Join.Item2!=null && queryModel.Join.Item3 == null && queryModel.Join.Item4 == null)
            {
                //item1 - тип (cross, inner...)   item2 - название таблицы
                SQL += $"{queryModel.Join.Item1} {queryModel.Join.Item2}";//это если cross join, в других есть условие
            }
            else if (queryModel.Join.Item3 != null && queryModel.Join.Item4 != null)
            {
                //item1 - тип (cross, inner...)   item2 - название таблицы   item3 - названия столбца от которого тянут связь   item4 - название столбца к которому тянут свзяь
                SQL += $"{queryModel.Join.Item1} {queryModel.Join.Item2} on {queryModel.Join.Item3} = {queryModel.Join.Item4}";
            }
           // else { return BadRequest("Wrong query model -> wrong Join"); }//если есть item3 но нет item4 и наоборот 

            //что если несколько условий
            if (queryModel.Where != null)
            {
                SQL += $"Where {queryModel.Where.Item1} {queryModel.Where.Item2} {queryModel.Where.Item3}";
            }

            if (queryModel.GroupBy!=null)
            {

            }

            if (queryModel.Having!=null)
            {

            }
            SQL += ";";//необязательно
            //var saveQueryResult = await ()
            return Ok(SQL);
        }
    }
}
