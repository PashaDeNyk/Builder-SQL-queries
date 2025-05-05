//using Microsoft.AspNetCore.Mvc;
//using Microsoft.EntityFrameworkCore.Metadata.Internal;
//using Npgsql;
//using ReactApp1.Server.Models;
//using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;
//using System.Data;
//using System.Diagnostics.Metrics;

//namespace ReactApp1.Server.Controllers
//{
//    [ApiController]
//    [Route("api/workspace")]
//    public class WorkspaceController : Controller
//    {
//        //проверяем на условном запросе "select * from people" "select * from product"

//        //union и join не прокатят, так вариант выдавать таблицы по отдельности
//        [HttpGet("select")] // делать select только тогда, когда пользователь выбрал таблицу, или выводить отдельно все, т.к. из-за разницы в наполнение очень неудобно выдводить таблицы
//        public IActionResult Select([FromBody] TableInfo tableInfo, [FromBody] DBConfig config)//Чтение таблиц через List или другой лучший вариант
//        {
//            var connectionString = $"Host={config.Host};Port={config.Port};Database={config.Database};Username={config.Username};Password={config.Password}"; // строка подключения хранится внутри пользователя

//            string queryString = "";//тут должен сториться запрос

//            using (var connection = new NpgsqlConnection(connectionString))
//            {
//                connection.Open();
//                string json = "tables:[{";


//                List<TableInfo> tInfo = new List<TableInfo>();//временно LIST, позже исправить на постоянную основу

//                foreach (var table in tInfo)//проходимся по всем полученным таблицам
//                {
//                    json += $"name:'{table.Name}',columns:[";
//                    DataSet dataSet = new DataSet();
//                    NpgsqlDataAdapter adapter = new NpgsqlDataAdapter($"select * from {table.Name}", connection);
//                    adapter.Fill(dataSet, table.Name);
//                    foreach (DataTable dt in dataSet.Tables)
//                    {

//                        List<string> cName = new List<string>();//имена столбцов
//                        foreach (DataColumn column in dt.Columns) // перебор всех столбцов
//                        {
//                            json += "{" + $"name:'{column.ColumnName}'" + "},";
//                        }
//                        json += "],data:[";
//                        foreach (DataRow row in dt.Rows) // перебор всех строк таблицы
//                        {

//                            var cells = row.ItemArray; // получаем все ячейки строки
//                            int countCells = cells.Count();

//                            json += "{";
//                            foreach (object cell in cells)
//                            {
//                                if (
//                                       columnTypeData[counterCName] == "bigserial" ||
//                                       columnTypeData[counterCName] == "bigint" ||
//                                       columnTypeData[counterCName] == "serial" ||
//                                       columnTypeData[counterCName] == "integer" ||
//                                       columnTypeData[counterCName] == "smallint" ||
//                                       columnTypeData[counterCName] == "decimal" ||
//                                       columnTypeData[counterCName] == "numeric" ||
//                                       columnTypeData[counterCName] == "real" ||
//                                       columnTypeData[counterCName] == "money" ||
//                                       columnTypeData[counterCName] == "double precision" ||
//                                       columnTypeData[counterCName] == "smallserial"
//                                           ) // попытка сделать проверку в зависимости от частоту использования
//                                {
//                                    json += $"{cName[counterCName]}:{cell}";
//                                }
//                                else json += $"{cName[counterCName]}:'{cell}'";

//                                if (counter != countCells)
//                                    json += ',';
//                                counter++;
//                                counterCName++;
//                            }

//                        }


//                    }

//                }
//            }
//            return Ok();
//        }
//        public void Database([FromBody] DBConfig config)
//        {

//            var connectionString = $"Host={config.Host};Port={config.Port};Database={config.Database};Username={config.Username};Password={config.Password}";
//            using (var connection = new NpgsqlConnection(connectionString))
//            {
//                connection.Open();
//                //выполнение команды и передача результата
//            }
//        }
//    }
//}
