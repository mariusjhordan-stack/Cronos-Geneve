@echo off
title Cronos Elite - Lanzador del Proyecto
echo ======================================================
echo           CRONOS ELITE - INICIANDO PROYECTO
echo ======================================================
echo.
echo Iniciando Servidor Backend (Django) en puerto 8000...
start "Cronos Elite - Backend (Django)" cmd /k "cd /d "%~dp0" && call .\.venv\Scripts\activate.bat && python manage.py runserver"

echo Iniciando Servidor Frontend (Vite React) en puerto 5173...
start "Cronos Elite - Frontend (React)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

 cloudflared tunnel --url http://127.0.0.1:8000

echo.
echo ======================================================
echo  Backend:  http://127.0.0.1:8000/
echo  Frontend: http://localhost:5173/
echo  Admin:    http://127.0.0.1:8000/admin/
echo ======================================================
echo Puedes cerrar esta ventana. Las terminales del Backend y Frontend continuaran ejecutandose.
pause
