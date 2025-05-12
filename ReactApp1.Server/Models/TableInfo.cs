namespace ReactApp1.Server.Models
{
    public class TableInfo
    {
        public string Name { get; set; } // имя "основной" таблицы (основная таблица - от которой будет начинаться(опираться) запрос и его дальнеёшее построение)
        
        public string Select { get; set; } // string потому что выбираться может как всё, так и определённые столбцы
        
        
    }
}
