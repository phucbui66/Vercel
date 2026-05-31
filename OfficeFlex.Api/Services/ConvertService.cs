using System;
using System.Diagnostics;
using System.IO;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using OfficeFlex.Api.Models;

namespace OfficeFlex.Api.Services
{
    public class ConvertService
    {
        private readonly IMemoryCache _cache;
        private readonly ILogger<ConvertService> _logger;
        private readonly string _libreOfficePath;

        public ConvertService(IMemoryCache cache, ILogger<ConvertService> logger)
        {
            _cache = cache;
            _logger = logger;
            // Đường dẫn mặc định của LibreOffice trên Windows (64-bit)
            _libreOfficePath = @"C:\Program Files\LibreOffice\program\soffice.exe";
        }

        public async Task StartConversionAsync(Guid taskId, string inputPath, string targetFormat)
        {
            if (_cache.TryGetValue(taskId, out ConvertTask task))
            {
                task.Status = "Processing";
                _cache.Set(taskId, task);
                _logger.LogInformation($"Task {taskId}: Status updated to Processing.");
            }

            try
            {
                _logger.LogInformation($"Task {taskId}: Starting REAL LibreOffice conversion of {inputPath} to {targetFormat}...");

                var downloadsDir = Path.Combine(Directory.GetCurrentDirectory(), "Storage", "Downloads");
                
                // Vì inputPath có định dạng là {taskId}.ext (ví dụ: GUID.docx)
                // Khi LibreOffice convert, nó sẽ xuất file thành {taskId}.{targetFormat} tại thư mục downloadsDir.
                var expectedOutputPath = Path.Combine(downloadsDir, $"{taskId}.{targetFormat}");

                var isPdfSource = inputPath.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase);
                ProcessStartInfo processStartInfo;

                if (isPdfSource)
                {
                    _logger.LogInformation($"Task {taskId}: PDF source detected. Using python convert.py for high-fidelity extraction to {targetFormat}...");
                    var convertPyPath = Path.Combine(Directory.GetCurrentDirectory(), "convert.py");
                    processStartInfo = new ProcessStartInfo
                    {
                        FileName = "python",
                        Arguments = $"\"{convertPyPath}\" --input \"{inputPath}\" --output \"{expectedOutputPath}\" --format {targetFormat}",
                        RedirectStandardOutput = true,
                        RedirectStandardError = true,
                        UseShellExecute = false,
                        CreateNoWindow = true
                    };
                }
                else
                {
                    if (!File.Exists(_libreOfficePath))
                    {
                        throw new FileNotFoundException($"Không tìm thấy LibreOffice tại {_libreOfficePath}. Vui lòng đảm bảo LibreOffice đã được cài đặt.");
                    }

                    processStartInfo = new ProcessStartInfo
                    {
                        FileName = _libreOfficePath,
                        Arguments = $"--headless --nologo --nofirststartwizard --convert-to {targetFormat} --outdir \"{downloadsDir}\" \"{inputPath}\"",
                        RedirectStandardOutput = true,
                        RedirectStandardError = true,
                        UseShellExecute = false,
                        CreateNoWindow = true
                    };
                }

                using (var process = Process.Start(processStartInfo))
                {
                    if (process == null) throw new Exception(isPdfSource ? "Không thể khởi động tiến trình python." : "Không thể khởi động tiến trình LibreOffice.");
                    
                    // Chờ tiến trình kết thúc
                    await process.WaitForExitAsync();
                    
                    if (process.ExitCode != 0)
                    {
                        var error = await process.StandardError.ReadToEndAsync();
                        throw new Exception(isPdfSource 
                            ? $"Tiến trình python báo lỗi (ExitCode {process.ExitCode}): {error}" 
                            : $"LibreOffice báo lỗi (ExitCode {process.ExitCode}): {error}");
                    }
                }

                // Kiểm tra xem file PDF đã thực sự được sinh ra chưa
                if (!File.Exists(expectedOutputPath))
                {
                    throw new Exception("Quá trình convert kết thúc nhưng không tìm thấy file PDF đầu ra.");
                }

                if (_cache.TryGetValue(taskId, out task))
                {
                    task.Status = "Success";
                    task.DownloadUrl = $"/api/convert/download/{taskId}";
                    _cache.Set(taskId, task);
                    _logger.LogInformation($"Task {taskId}: Conversion Success. Download URL: {task.DownloadUrl}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Task {taskId}: Conversion Failed. Reason: {ex.Message}");
                if (_cache.TryGetValue(taskId, out task))
                {
                    task.Status = "Failed";
                    _cache.Set(taskId, task);
                }
            }
        }
    }
}
