namespace ReactApp1.Server.Models
{

    public class QueryModel
    {
        public string Name { get; set; } 
        public string Select { get; set; } 
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
