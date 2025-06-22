using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ReactApp1.Server.DTO;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
namespace ReactApp1.Server
{
    public class Program//обязательно посмотреть порядок middleware
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
            //Подключение к бд Users
            builder.Services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(builder.Configuration.GetConnectionString("DbUsersConnection")));

            // Добавляем аутентификацию JWT
            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = builder.Configuration["Jwt:Issuer"],
                        ValidAudience = builder.Configuration["Jwt:Audience"],
                        IssuerSigningKey = new SymmetricSecurityKey(
                            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
                    };
                });

            builder.Services.AddAuthorization();//Добавляем авторизацию
            //Поддержка контроллеров
            builder.Services.AddControllers();

            builder.Services.AddOpenApi();



            builder.Services.AddCors(options =>
            {
                options.AddPolicy("ReactPolicy", builder =>
                {
                    builder.WithOrigins("https://localhost:57112") // React-порт
                           .AllowAnyHeader()
                           .AllowAnyMethod()
                           .AllowCredentials(); // Если используете куки/авторизацию
                });
            });

            var app = builder.Build();

            app.UseDefaultFiles();
            app.MapStaticAssets();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi();
            }

            //app.UseHttpsRedirection();
            app.UseCors("ReactPolicy");
            app.UseAuthentication(); // Включение аутентификации
            app.UseAuthorization(); // Включение авторизации

            //Перенаправляет действия в контроллеры
            app.MapControllers();

            app.MapFallbackToFile("/index.html");

            app.Run();
        }
    }
}
