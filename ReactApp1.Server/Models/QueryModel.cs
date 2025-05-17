namespace ReactApp1.Server.Models
{

    public class QueryModel
    {
        public string Name { get; set; } // имя "основной" таблицы (основная таблица - от которой будет начинаться(опираться) запрос и его дальнеёшее построение)
        public string Select { get; set; } // string потому что выбираться может как всё, так и определённые столбцы
        public TwoStrOneOperator Where { get; set; }
        public string GroupBy { get; set; }
        public TwoStrOneOperator Having {get;set;}
        public TwoStrOneOperator OrederBy {get;set;}

    }

    public struct TwoStrOneOperator
    {
        string str1;
        string str2;
        string operator_str;
    };
}
