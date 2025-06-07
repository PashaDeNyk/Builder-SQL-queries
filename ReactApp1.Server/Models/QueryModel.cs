namespace ReactApp1.Server.Models
{
    //переменные могут быть пустыми
    //действительно ли нужны List?
    //Если несколько значений в одной строке, то это всё ещё одна строка или несколько маленьких?
    public class QueryModel
    {
        public string Name { get; set; } //имя таблицы для FROM


        public string Select { get; set; } //названия столбцов для select
        //обработать использование пользовательских названий переменных и агрегатные функции по типу sum avg count
        

        public Tuple<string, string, string,string>? Join { get; set; } // тип и название таблицы, если не cross join, то и названия столбцов, также там всегда =, так как id>id это глупость
                                                                       // обработать момент с тем чтобы давать названия таблица по типу "product p on p.product_id..."
        //!!!!!!!!!!!!!!!!!!!!
        //Возможно поэтому нужен List, так что если в нём более одного элемента ставить and или or, но это может выбирать пользователь
        //!!!!!!!!!!!!!!!!!!!!
        public Tuple<string, string, string>? Where { get; set; } //str1 str2 operator
                                                                 //WHERE department = 'IT' AND salary > 5000;
                                                                 //также проработать работу с датами

        public string? GroupBy { get; set; }//возможно по столбцам сортировать например "GROUP BY 1"
        
        
        public Tuple<string, string, string>? Having { get; set; } // фильтрация после группировки
                                                                  // str1 str2 operator
                                                                  // можно считать условием группировки
        
        public Tuple<string,string,string>? OrderBy {get;set;}


    }
}
