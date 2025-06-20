using Microsoft.AspNetCore.Mvc;
using Npgsql;
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

            if (queryModel.Select == null) //без SELECT ничего не получится
            {
                return BadRequest("Wrong query model -> need SELECT");
            }


            if (queryModel.Select != null)//внутри селекта могут быть AVG COUNT и также их название по типу COUNT(*) as count_c
            {
                SQL += $"Select {queryModel.Select} from {queryModel.Name}";
            }

            //временно, пока не увверен в item3, item4 -> это если не cross join и нужно условие 
            if (queryModel.Join.Item1 != null && queryModel.Join.Item2 != null && queryModel.Join.Item3 == null && queryModel.Join.Item4 == null)
            {
                //item1 - тип (cross, inner...)   item2 - название таблицы
                SQL += $"{queryModel.Join.Item1} {queryModel.Join.Item2}";//это если cross join, в других есть условие
            }
            else if (queryModel.Join.Item3 != null && queryModel.Join.Item4 != null)
            {
                //item1 - тип (cross, inner...)   item2 - название таблицы   item3 - названия столбца от которого тянут связь   item4 - название столбца к которому тянут свзяь
                SQL += $"{queryModel.Join.Item1} {queryModel.Join.Item2} on {queryModel.Join.Item3} = {queryModel.Join.Item4}";
            }


            //что если несколько условий(пробигаться по списку)
            if (queryModel.Where.Item1 != null)
            {
                SQL += $" Where {queryModel.Where.Item1} {queryModel.Where.Item2} {queryModel.Where.Item3}";
            }

            if (queryModel.GroupBy != null)
            {
                SQL += $" Groupby {queryModel.GroupBy}";
            }

            if (queryModel.Having.Item1 != null)
            {
                SQL += $" Having {queryModel.Having.Item1} {queryModel.Having.Item2} {queryModel.Having.Item3}";
            }

            if (queryModel.OrderBy.Item1 != null && queryModel.OrderBy.Item3 == null)
            {
                SQL += $" OrderBy {queryModel.OrderBy.Item1} {queryModel.OrderBy.Item2}";
            }
            else if (queryModel.OrderBy.Item1 != null && queryModel.OrderBy.Item3 != null)
            {
                SQL += $" OrderBy {queryModel.OrderBy.Item1} {queryModel.OrderBy.Item2} {queryModel.OrderBy.Item3}";
            }
            SQL += ";";//необязательно
            var queryResult = ExecQuery(SQL);
            return Ok(new { QueryString = SQL, QueryResult = queryResult });//нужно возвращать два элемента
        }

        public string ExecQuery(string query)//работает корректно
        {
            bool check = false;

            string json = "\"tables\":[";
            json += "{" + $"\"name\":\"QueryResult\",\"columns\":[";

            var result = new List<Dictionary<string, object>>();
            var connectionString = ConnectionString.connectionString;
            List<string> columnName = new List<string>();

            using (var connection = new NpgsqlConnection(connectionString))
            {
                connection.Open();
                using (var command = new NpgsqlCommand(query, connection))
                {
                    using (var reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            var row = new Dictionary<string, object>();
                            if (!check)
                            {
                                check = true;
                                for (int i = 0; i < reader.FieldCount; i++)
                                {
                                    columnName.Add(reader.GetName(i));
                                    json += "{" + $"\"name\":\"{columnName[i]}\"," + "},";
                                }
                                json += "],\"data\":[";

                            }
                            json += "{";
                            for (int i = 0; i < reader.FieldCount; i++)
                            {
                                object value = reader.IsDBNull(i) ? null : reader.GetValue(i);
                                json += $"\"{columnName[i]}\":\"{value}\",";
                            }
                            json += "},";
                        }
                    }
                    json += "],},]";
                }
            }
            return json;
        }
    }
}
