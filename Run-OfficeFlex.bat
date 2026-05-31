@echo off
title OfficeFlex Server Launcher
cls

echo =====================================================================
echo              OFFICEFLEX SMART OFFICE CONVERTER
echo                   Bo Khoi Chay May Chu Tu Dong
echo =====================================================================
echo.
echo [1/2] Dang mo Localtunnel trong cua so moi...
echo       - Port chuyen tiep: 5000
echo       - Dia chi cong khai: https://breezy-cameras-yawn.loca.lt
echo.
start "OfficeFlex Localtunnel" cmd /k "echo Dang tao duong ket noi cong khai... && npx localtunnel --port 5000 --subdomain breezy-cameras-yawn"

echo [2/2] Dang khoi dong Backend API (du an .NET)...
echo       - Dia chi Local: http://localhost:5000
echo.
echo ---------------------------------------------------------------------
echo * LUU Y: Vui long KHONG DONG cac cua so lenh nay khi dang su dung App.
echo ---------------------------------------------------------------------
echo.

:: Thiet lap cong 5000 cho ASP.NET Core
set ASPNETCORE_URLS=http://localhost:5000

:: Chay du an Web API
dotnet run --project OfficeFlex.Api/OfficeFlex.Api.csproj

pause
