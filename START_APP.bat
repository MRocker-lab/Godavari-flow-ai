@echo off
title GODAVARI FLOW AI - Local Server
echo ============================================================
echo   Starting GODAVARI FLOW AI...
echo   Pilgrim Portal:           http://localhost:5173/
echo   Authority Command Centre: http://localhost:5173/command
echo ============================================================
echo.

cd /d "%~dp0"
start "" "http://localhost:5173/"
start "" "http://localhost:5173/command"
call npm run dev
pause
