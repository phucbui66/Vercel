using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace OfficeFlex.Api.Services
{
    public class FileCleanupService : BackgroundService
    {
        private readonly ILogger<FileCleanupService> _logger;

        public FileCleanupService(ILogger<FileCleanupService> logger)
        {
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                _logger.LogInformation("FileCleanupService is scanning for old files...");

                try
                {
                    CleanupDirectory(Path.Combine(Directory.GetCurrentDirectory(), "Storage", "Uploads"));
                    CleanupDirectory(Path.Combine(Directory.GetCurrentDirectory(), "Storage", "Downloads"));
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred while cleaning up files.");
                }

                // Cứ mỗi 5 phút quét 1 lần
                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
            }
        }

        private void CleanupDirectory(string directoryPath)
        {
            if (!Directory.Exists(directoryPath)) return;

            var files = Directory.GetFiles(directoryPath);
            foreach (var file in files)
            {
                var fileInfo = new FileInfo(file);
                // Tìm các file có thời gian khởi tạo quá 10 phút và thực hiện xóa cứng
                if (DateTime.UtcNow - fileInfo.CreationTimeUtc > TimeSpan.FromMinutes(10))
                {
                    try
                    {
                        fileInfo.Delete();
                        _logger.LogInformation($"Deleted old file: {file}");
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, $"Failed to delete file: {file}");
                    }
                }
            }
        }
    }
}
