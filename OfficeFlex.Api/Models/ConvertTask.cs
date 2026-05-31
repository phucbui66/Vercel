using System;

namespace OfficeFlex.Api.Models
{
    public class ConvertTask
    {
        public Guid Id { get; set; }
        public string TargetFormat { get; set; } = string.Empty;
        public string Status { get; set; } = "Pending"; // Pending, Processing, Success, Failed
        public string DownloadUrl { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
