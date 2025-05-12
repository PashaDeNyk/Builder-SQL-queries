//using Microsoft.AspNetCore.Mvc;
//using Microsoft.EntityFrameworkCore.Metadata.Conventions;
//using Npgsql;
//using ReactApp1.Server.Models;
//using System.Data;
//using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

//namespace ReactApp1.Server.Controllers
//{
//    [ApiController]
//    [Route("api/user")]
//    public class TableController : Controller
//    {
//        [HttpGet("tables")]
//        public IActionResult Tables([FromBody] DBConfig config)
//        {
//            try
//            {
//                var connectionString = $"Host={config.Host};Port={config.Port};Database={config.Database};Username={config.Username};Password={config.Password}";


//                using (var connection = new NpgsqlConnection(connectionString))
//                {
//                    connection.Open();

//                    List<string> tablesName = GetTablesName(connectionString);

//                    foreach (var tableName in tablesName)
//                    {
//                        DataSet dataSet = new DataSet();
//                        NpgsqlDataAdapter adapter = new NpgsqlDataAdapter($"select * from {tableName}", connection);
//                        adapter.Fill(dataSet, "People");
//                        foreach (DataTable dt in dataSet.Tables)
//                        {
//                            Console.WriteLine(dt.TableName); // название таблицы
//                                                             // перебор всех столбцов
//                            foreach (DataColumn column in dt.Columns)
//                                Console.Write("\t{0}", column.ColumnName);
//                            Console.WriteLine();
//                            // перебор всех строк таблицы
//                            foreach (DataRow row in dt.Rows)
//                            {
//                                // получаем все ячейки строки
//                                var cells = row.ItemArray;
//                                foreach (object cell in cells)
//                                    Console.Write("\t{0}", cell);
//                                Console.WriteLine();
//                            }
//                        }
//                    }

//                }
//                ReadColumnsType(connectionString);
//                return Ok(new { Message = "Load table succeed" });

//            }
//            catch (Exception e)
//            {
//                return BadRequest(new { Error = e.Message });
//            }
//        }
//        public List<string> GetTablesName(string connectionString)
//        {
//            using (var connection = new NpgsqlConnection(connectionString))
//            {
//                connection.Open();
//                using (var cmd = new NpgsqlCommand("select table_name from information_schema.tables where table_schema='public'", connection))
//                using (var reader = cmd.ExecuteReader())
//                {
//                    List<string> tablesName = new List<string>();
//                    while (reader.Read())
//                    {
//                        tablesName.Add(reader.GetString(0));
//                    }

//                    //временный вывод в одну строку
//                    var str = string.Empty;
//                    foreach (var tableName in tablesName)
//                    {
//                        str += tableName + " ";
//                    }
//                    Console.WriteLine(str);
//                    return tablesName;
//                }
//            }
//        }

//        public void ReadColumnsType(string connectionString)
//        {
//            using (var connection = new NpgsqlConnection(connectionString))
//            {
//                connection.Open();
//                using (var cmd = new NpgsqlCommand("select data_type from information_schema.columns " +
//                "where table_schema = 'public' and table_name='people'", connection))
//                using (var reader = cmd.ExecuteReader())
//                {
//                    List<string> columnsTypeOfData = new List<string>();
//                    while (reader.Read())
//                    {
//                        columnsTypeOfData.Add(reader.GetString(0));
//                    }
//                    var str_Data = string.Empty;
//                    foreach (var temp in columnsTypeOfData)
//                    {
//                        str_Data += temp + " ";
//                    }
//                    Console.WriteLine(str_Data);
//                }
//            }

//        }
//    }
//}
