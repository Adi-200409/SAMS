@echo off
echo Starting Backend Server...
start "Backend (Django)" cmd /k "cd /d "D:\Projects\Student ACT" && .\env\Scripts\activate && python manage.py runserver 0.0.0.0:8000"

echo Starting Frontend Server...
start "Frontend (Expo)" cmd /k "npx expo start"

echo Both servers are starting up in separate windows!
