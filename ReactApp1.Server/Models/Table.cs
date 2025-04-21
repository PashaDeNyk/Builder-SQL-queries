namespace ReactApp1.Server.Models
{
    public class Table
    {
        public string TableName { get; set; }
        public List<Column> Columns { get; set; }

    }

    public class Column
    { 
        public int TableID { get; set; }
        public string ColumnName { get; set; }
        public string ColumnType { get; set; }
    }

    public class Cell
    {
        
    }
}
