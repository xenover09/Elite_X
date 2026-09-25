@echo off
title Elite X Dashboard Starter
echo ======================================================
echo Starting Elite X Bot and Web Dashboard...
echo ======================================================
echo.

:: Start the node application
start cmd /k "npm run dev"

:: Wait 3 seconds to let the server start up
timeout /t 3 /nobreak > NUL

:: Open the browser to the dashboard URL
echo Opening dashboard in your default browser...
start http://localhost:3001
