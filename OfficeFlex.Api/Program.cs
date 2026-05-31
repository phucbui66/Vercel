using System.IO;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using OfficeFlex.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. Tự động kiểm tra và tạo hai thư mục Storage/Uploads và Storage/Downloads
var storageDir = Path.Combine(Directory.GetCurrentDirectory(), "Storage");
var uploadsDir = Path.Combine(storageDir, "Uploads");
var downloadsDir = Path.Combine(storageDir, "Downloads");

if (!Directory.Exists(uploadsDir))
{
    Directory.CreateDirectory(uploadsDir);
}

if (!Directory.Exists(downloadsDir))
{
    Directory.CreateDirectory(downloadsDir);
}

// 2. Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Đăng ký IMemoryCache
builder.Services.AddMemoryCache();

// Đăng ký ConvertService dạng Scoped hoặc Transient
builder.Services.AddScoped<ConvertService>();

// Đăng ký FileCleanupService chạy ngầm liên tục (IHostedService)
builder.Services.AddHostedService<FileCleanupService>();

// Cấu hình CORS để cho phép gọi từ Chrome Extension và Next.js
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy => policy
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader());
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();

app.Run();
