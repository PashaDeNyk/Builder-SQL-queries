using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ReactApp1.Server.DTO
{
    public class LastQuery
    {
        [Column("id")]
        public int Id { get; set; }
        [Column("user_id")]
        public int User_ID { get; set; }
        [Column("query")]
        public string? Query { get; set; }//Может быть NULL, так как данная таблица заполняется вместе с регистрацией
    }
}
