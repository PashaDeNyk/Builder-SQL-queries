using Microsoft.AspNetCore.Mvc;
using ReactApp1.Server.Models;
using Npgsql;
using System.Data;
using System.Text.Json;

namespace ReactApp1.Server.Controllers
{
    [ApiController]
    [Route("api/database")]
    public class DatabaseController : Controller
    {
        [HttpGet("read-database")]
        public IActionResult ReadDatabase()
        {
            try
            {
                var connectionString = ConnectionString.connectionString;

                using (var connection = new NpgsqlConnection(connectionString))
                {
                    connection.Open();
                    List<string> tablesName = GetTablesName(connectionString);
                    var result = new List<object>();
                    string json = "\"tables\":[";

                    foreach (var tName in tablesName)
                    {

                        json += "{" + $"\"name\":\"{tName}\",\"columns\":[";

                        List<string> columnTypeName = ReadColumnsType(connectionString, tName);//Типы данных 'известных' таюлиц через postgresql, также для первичной записи в json (первичная запись - записывается вся бд для отображения таблиц, с которыми будет работать пользователь)              
                        List<string> typeData = new List<string>();//Типы данных через c#

                        DataSet dataSet = new DataSet();
                        new NpgsqlDataAdapter($"SELECT * FROM {tName}", connection).Fill(dataSet, tName);

                        foreach (DataTable dt in dataSet.Tables)
                        {
                            int counterTypeData = 0;
                            List<string> cName = new List<string>();//имена столбцов
                            foreach (DataColumn column in dt.Columns) // перебор всех столбцов
                            {
                                typeData.Add(column.DataType.Name.ToString());
                                cName.Add(column.ColumnName);
                                json += "{" + $"\"name\":\"{column.ColumnName}\",\"type\":\"{columnTypeName[counterTypeData]}\"" + "},";
                                counterTypeData++;
                            }
                            json += "],\"data\":[";
                            foreach (DataRow row in dt.Rows) // перебор всех строк таблицы
                            {
                                int counterCName = 0;
                                var cells = row.ItemArray; // получаем все ячейки строки
                                int countCells = cells.Count();
                                int counter = 1;
                                json += "{";
                                foreach (object cell in cells)
                                {
                                    //сделать проверку на null, также проблема с jsonb, inet, interval
                                    //хз что делать с массивами, Point пихаю как строку
                                    if (typeData[counterCName] == "String" || typeData[counterCName] == "Boolean" || typeData[counterCName] == "DateTime" || typeData[counterCName] == "Decimal" || typeData[counterCName] == "Numeric" || typeData[counterCName] == "Real" || typeData[counterCName] == "Double precision" || typeData[counterCName] == "Money" || typeData[counterCName] == "Single" || typeData[counterCName] == "Point" || typeData[counterCName] == "time without time zone")
                                    {
                                        json += $"\"{cName[counterCName]}\":\"{cell}\"";

                                    }
                                    else
                                    {
                                        json += $"\"{cName[counterCName]}\":{cell}";
                                    }
                                    if (counter != countCells)
                                    {
                                        json += ',';
                                    }
                                    counter++;
                                    counterCName++;
                                }
                                json += "},";
                            }
                            json += "],";
                        }
                        json += "},";
                    }
                    json += "]";
                    Console.WriteLine(json);
                    Console.WriteLine();
                    json = JsonSerializer.Serialize(json);
                    Console.WriteLine(json);
                    //string temp = ExecQuery("SELECT * FROM logs where log_id<5;");
                    return Ok(json);
                }
            }
            catch (Exception e)
            {
                return BadRequest(new
                {
                    Error = e.Message
                });
            }
        }

       




        public string ReadQueryTable(string query)
        {
            try
            {
                var connectionString = ConnectionString.connectionString;

                using (var connection = new NpgsqlConnection(connectionString))
                {
                    connection.Open();
                    //List<string> tablesName = GetTablesName(connectionString);
                    //var result = new List<object>();
                    string json = "\"tables\":[";


                    json += "{" + $"\"name\":\"ResultQuery\",\"columns\":[";//название таблицы с результатом

                    // List<string> columnTypeName = ReadColumnsType(connectionString, tName);//Типы данных 'известных' таюлиц через postgresql, также для первичной записи в json (первичная запись - записывается вся бд для отображения таблиц, с которыми будет работать пользователь)              
                    List<string> typeData = new List<string>();//Типы данных через c#

                    DataSet dataSet = new DataSet();
                    new NpgsqlDataAdapter($"{query}", connection).Fill(dataSet, "ResultQuery");

                    foreach (DataTable dt in dataSet.Tables)
                    {
                        int counterTypeData = 0;
                        List<string> cName = new List<string>();//имена столбцов
                        foreach (DataColumn column in dt.Columns) // перебор всех столбцов
                        {
                            typeData.Add(column.DataType.Name.ToString());
                            cName.Add(column.ColumnName);
                            json += "{" + $"\"name\":\"{column.ColumnName}\"" + "},";

                        }
                        json += "],\"data\":[";
                        foreach (DataRow row in dt.Rows) // перебор всех строк таблицы
                        {
                            int counterCName = 0;
                            var cells = row.ItemArray; // получаем все ячейки строки
                            int countCells = cells.Count();
                            int counter = 1;
                            json += "{";
                            foreach (object cell in cells)
                            {
                                json += $"\"{cName[counterCName]}\":\"{cell}\"";
                                if (counter != countCells)
                                {
                                    json += ',';
                                }
                                //сделать проверку на null, также проблема с jsonb, inet, interval
                                //хз что делать с массивами, Point пихаю как строку
                                //if (typeData[counterCName] == "String" || typeData[counterCName] == "Boolean" || typeData[counterCName] == "DateTime" || typeData[counterCName] == "Decimal" || typeData[counterCName] == "Numeric" || typeData[counterCName] == "Real" || typeData[counterCName] == "Double precision" || typeData[counterCName] == "Money" || typeData[counterCName] == "Single" || typeData[counterCName] == "Point" || typeData[counterCName] == "time without time zone")
                                //{
                                //    json += $"\"{cName[counterCName]}\":\"{cell}\"";
                                //}
                                //else
                                //{
                                //    json += $"\"{cName[counterCName]}\":{cell}";
                                //}
                                //if (counter != countCells)
                                //{
                                //    json += ',';
                                //}
                                counter++;
                                counterCName++;
                            }
                            json += "},";
                        }
                        json += "],";
                    }
                    json += "},]";
                    Console.WriteLine(json);
                    Console.WriteLine();
                    json = JsonSerializer.Serialize(json);
                    Console.WriteLine(json);
                    //return Ok(json);
                    return json;
                }

            }

            catch (Exception e)
            {
                return e.Message;
            }
        }


        //[HttpGet("read-database")]
        //public IActionResult ReadDatabase()
        //{
        //    try
        //    {
        //        var connectionString = ConnectionString.connectionString;

        //        using (var connection = new NpgsqlConnection(connectionString))
        //        {
        //            connection.Open();
        //            List<string> tablesName = GetTablesName(connectionString);
        //            var result = new List<object>();
        //            //string json = "\"tables\":[";

        //            foreach (var tName in tablesName)
        //            {
        //                var tableInfo = new
        //                {
        //                    name = tName,
        //                    columns = new List<object>(),
        //                    data = new List<Dictionary<string, object>>()
        //                };
        //                //json += "{"+$"\"name\":\"{tName}\",\"columns\":[";

        //                //List<string> columnTypeName = ReadColumnsType(connectionString, tName);//Типы данных 'известных' таюлиц через postgresql, также для первичной записи в json (первичная запись - записывается вся бд для отображения таблиц, с которыми будет работать пользователь)
        //                var columnTypeName = ReadColumnsType(connectionString, tName);//Типы данных 'известных' таюлиц через postgresql, также для первичной записи в json (первичная запись - записывается вся бд для отображения таблиц, с которыми будет работать пользователь)
        //                //List<string> typeData = new List<string>();//Типы данных через c#
        //                DataSet dataSet = new DataSet();
        //                //NpgsqlDataAdapter adapter = new NpgsqlDataAdapter($"select * from {tName}", connection);
        //                //adapter.Fill(dataSet, tName);
        //                new NpgsqlDataAdapter($"SELECT * FROM {tName}", connection).Fill(dataSet, tName);

        //                foreach (DataTable dt in dataSet.Tables)
        //                {
        //                    int counterTypeData = 0;
        //                    List<string> cName = new List<string>();//имена столбцов
        //                    foreach (DataColumn column in dt.Columns) // перебор всех столбцов
        //                    {
        //                        for (int i = 0; i < dt.Columns.Count; i++)
        //                        {
        //                            tableInfo.columns.Add(new
        //                            {
        //                                name = dt.Columns[i].ColumnName,
        //                                type = columnTypeName[i]
        //                            });
        //                        }
        //                        //typeData.Add(column.DataType.Name.ToString());
        //                        //cName.Add(column.ColumnName);
        //                        //json += "{" + $"\"name\":\"{column.ColumnName}\",\"type\":\"{columnTypeName[counterTypeData]}\"" + "},";
        //                        // counterTypeData++;
        //                    }
        //                    //json += "],\"data\":[";
        //                    foreach (DataRow row in dt.Rows) // перебор всех строк таблицы
        //                    {
        //                        var rowData = new Dictionary<string, object>();
        //                        for (int i = 0; i < dt.Columns.Count; i++)
        //                        {
        //                            var column = dt.Columns[i];
        //                            var value = row[column];
        //                            rowData[column.ColumnName] = value;
        //                        }
        //                        tableInfo.data.Add(rowData);
        //                        //int counterCName = 0;
        //                        //var cells = row.ItemArray; // получаем все ячейки строки
        //                        //int countCells = cells.Count();
        //                        //int counter = 1;
        //                        ////json += "{";
        //                        //foreach (object cell in cells)
        //                        //{
        //                        //    if (typeData[counterCName] == "String" || typeData[counterCName] == "Boolean" || typeData[counterCName] == "DateTime" || typeData[counterCName] == "Decimal" || typeData[counterCName] == "Numeric" || typeData[counterCName] == "Real" || typeData[counterCName] == "Double precision" || typeData[counterCName] == "Money")
        //                        //    {
        //                        //        //json += $"\"{cName[counterCName]}\":\"{cell}\"";

        //                        //    }
        //                        //    else
        //                        //    {
        //                        //        //json += $"\"{cName[counterCName]}\":{cell}";
        //                        //    }
        //                        //    if (counter != countCells)
        //                        //    {
        //                        //        //json += ',';
        //                        //    }
        //                        //    counter++;
        //                        //    counterCName++;
        //                        //}
        //                        //json += "},";
        //                    }
        //                    //json += "],";
        //                }
        //                result.Add(tableInfo);
        //                //json += "},";
        //            }
        //            //json += "]";
        //            //Console.WriteLine(json);
        //            //Console.WriteLine();
        //            //json = JsonSerializer.Serialize(json);
        //            //Console.WriteLine(json);
        //            return Ok(new { tables = result });
        //        }
        //    }
        //    catch (Exception e)
        //    {
        //        return BadRequest(new
        //        {
        //            Error = e.Message
        //        });
        //    }
        //}

        public List<string> GetTablesName(string connectionString)
        {
            using (var connection = new NpgsqlConnection(connectionString))
            {
                connection.Open();
                using (var cmd = new NpgsqlCommand("select table_name from information_schema.tables where table_schema='public'", connection))
                using (var reader = cmd.ExecuteReader())
                {
                    List<string> tablesName = new List<string>();
                    while (reader.Read())
                    {
                        tablesName.Add(reader.GetString(0));
                    }

                    //временный вывод в одну строку
                    var str = string.Empty;
                    foreach (var tableName in tablesName)
                    {
                        str += tableName + " ";
                    }
                    Console.WriteLine(str);
                    return tablesName;
                }
            }
        }

        public List<string> ReadColumnsType(string connectionString, string tName)
        {
            using (var connection = new NpgsqlConnection(connectionString))
            {
                connection.Open();
                using (var cmd = new NpgsqlCommand($"select data_type from information_schema.columns where table_schema = 'public' and table_name='{tName}'", connection))
                using (var reader = cmd.ExecuteReader())
                {
                    List<string> columnsTypeData = new List<string>();
                    while (reader.Read())
                    {
                        columnsTypeData.Add(reader.GetString(0));
                    }
                    var str_Data = string.Empty;
                    foreach (var temp in columnsTypeData)
                    {
                        str_Data += temp + " ";
                    }
                    Console.WriteLine(str_Data);
                    return columnsTypeData;
                }
            }

        }

    }
}
