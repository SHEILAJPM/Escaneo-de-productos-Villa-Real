@echo off
title Super Escaneo
echo Iniciando backend (Spring Boot, puerto 8080)...
start "Backend - Spring Boot" cmd /k "cd /d %~dp0backend && mvn spring-boot:run"
echo Iniciando frontend (React, puerto 5173)...
if not exist "%~dp0frontend\node_modules" (cd /d %~dp0frontend && call npm install)
start "Frontend - React" cmd /k "cd /d %~dp0frontend && npm run dev"
echo Esperando a que arranque...
timeout /t 15 /nobreak >nul
start http://localhost:5173
