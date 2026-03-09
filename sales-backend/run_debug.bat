
@echo off
echo Starting Backend... > startup_log.txt
".\.venv\Scripts\python.exe" main.py >> startup_log.txt 2>&1
echo Done. >> startup_log.txt
