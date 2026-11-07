@echo off
title GODAVARI FLOW AI - Upload to GitHub
echo ============================================================
echo   Uploading GODAVARI FLOW AI to GitHub...
echo   Repository: https://github.com/MRocker-lab/Godavari-flow-ai
echo ============================================================
echo.

cd /d "%~dp0"
git branch -M main
git remote set-url origin https://github.com/MRocker-lab/Godavari-flow-ai.git 2>nul || git remote add origin https://github.com/MRocker-lab/Godavari-flow-ai.git
git push -u origin main

echo.
if %ERRORLEVEL% EQU 0 (
    echo ============================================================
    echo   SUCCESS! Your project is now live on GitHub:
    echo   https://github.com/MRocker-lab/Godavari-flow-ai
    echo ============================================================
    start https://github.com/MRocker-lab/Godavari-flow-ai
) else (
    echo ============================================================
    echo   Upload did not finish. Please make sure you are connected
    echo   to the internet and signed in to GitHub when prompted.
    echo ============================================================
)
echo.
pause
