
@echo off
echo Starting Backend with Virtual Environment (Recommended)...
cd /d "%~dp0"
IF EXIST "..\.venv\Scripts\python.exe" (
    "..\.venv\Scripts\python.exe" main.py
) ELSE (
    echo Error: Virtual environment not found at ..\.venv
    echo Looking in: %~dp0..\.venv
    pause
    exit /b 1
)

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Backend crashed. Press any key to exit.
    pause
)
