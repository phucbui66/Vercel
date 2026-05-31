using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
using OfficeFlex.Api.Models;
using OfficeFlex.Api.Services;

namespace OfficeFlex.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ConvertController : ControllerBase
    {
        private readonly IMemoryCache _cache;
        private readonly IServiceProvider _serviceProvider;
        private readonly string[] _allowedExtensions = { ".docx", ".xlsx", ".pptx", ".pdf" };
        private const long MaxFileSize = 20 * 1024 * 1024; // 20 MB

        public ConvertController(IMemoryCache cache, IServiceProvider serviceProvider)
        {
            _cache = cache;
            _serviceProvider = serviceProvider;
        }

        [HttpPost("upload")]
        public async Task<IActionResult> Upload(IFormFile file, [FromForm] string targetFormat = "pdf")
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            if (file.Length > MaxFileSize)
                return BadRequest("File size exceeds 20MB limit.");

            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (Array.IndexOf(_allowedExtensions, ext) < 0)
                return BadRequest("Invalid file format. Only .docx, .xlsx, .pptx, .pdf are allowed.");

            // Kiểm tra tính hợp lệ của cặp định dạng nguồn - đích
            targetFormat = targetFormat.ToLowerInvariant();
            if (ext == ".pdf")
            {
                if (targetFormat != "docx" && targetFormat != "xlsx" && targetFormat != "pptx")
                    return BadRequest("PDF files can only be converted to docx, xlsx, or pptx.");
            }
            else
            {
                if (targetFormat != "pdf")
                    return BadRequest("Office files can only be converted to pdf.");
            }

            var taskId = Guid.NewGuid();
            var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "Storage", "Uploads");
            var inputPath = Path.Combine(uploadsDir, $"{taskId}{ext}");

            // Lưu file vào thư mục Storage/Uploads với tên [Guid].ext
            using (var stream = new FileStream(inputPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Tạo một ConvertTask mới với Status = "Pending"
            var convertTask = new ConvertTask
            {
                Id = taskId,
                TargetFormat = targetFormat,
                Status = "Pending"
            };

            // Lưu vào IMemoryCache với Key là Id của task
            _cache.Set(taskId, convertTask, TimeSpan.FromHours(1));

            // Lập tức trả về JSON: { id: "Guid" } (không bắt client đợi convert xong)
            var result = Ok(new { id = taskId });

            // Khởi chạy task convert ngầm
            _ = Task.Run(async () =>
            {
                using var scope = _serviceProvider.CreateScope();
                var convertService = scope.ServiceProvider.GetRequiredService<ConvertService>();
                await convertService.StartConversionAsync(taskId, inputPath, targetFormat);
            });

            return result;
        }

        [HttpGet("status/{id}")]
        public IActionResult GetStatus(Guid id)
        {
            // Truy vấn IMemoryCache bằng id
            if (_cache.TryGetValue(id, out ConvertTask task))
            {
                // Nếu tìm thấy, trả về toàn bộ Object ConvertTask (nếu Success sẽ có thêm link download)
                return Ok(task);
            }

            return NotFound(new { message = "Task not found." });
        }

        [HttpGet("download/{id}")]
        public IActionResult Download(Guid id)
        {
            if (!_cache.TryGetValue(id, out ConvertTask task))
                return NotFound("Task not found.");

            if (task.Status != "Success")
                return BadRequest("Conversion not completed yet.");

            var downloadsDir = Path.Combine(Directory.GetCurrentDirectory(), "Storage", "Downloads");
            var filePath = Path.Combine(downloadsDir, $"{id}.{task.TargetFormat}");

            if (!System.IO.File.Exists(filePath))
                return NotFound("File not found on server.");

            return PhysicalFile(filePath, GetContentType(task.TargetFormat), $"{id}.{task.TargetFormat}");
        }

        private string GetContentType(string format)
        {
            return format.ToLowerInvariant() switch
            {
                "pdf" => "application/pdf",
                "docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "pptx" => "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                _ => "application/octet-stream"
            };
        }
    }
}
