@echo off
REM ============================================================
REM  Wash Nest Billing — Windows Service Installer (via NSSM)
REM  Run this script as Administrator.
REM ============================================================

SET SERVICE_NAME=WashNestBilling
SET BILLING_DIR=%~dp0
SET PYTHON=python
SET LOG_DIR=%BILLING_DIR%logs

echo.
echo ========================================
echo  Wash Nest — Service Installer
echo ========================================
echo.

REM Check if NSSM is available
where nssm >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] NSSM not found in PATH.
    echo Download from https://nssm.cc/download and add to PATH.
    pause
    exit /b 1
)

REM Create logs directory
IF NOT EXIST "%LOG_DIR%" mkdir "%LOG_DIR%"

REM Remove existing service if present
nssm stop %SERVICE_NAME% >nul 2>&1
nssm remove %SERVICE_NAME% confirm >nul 2>&1

REM Install the service
echo Installing %SERVICE_NAME% service...
nssm install %SERVICE_NAME% "%PYTHON%" -m uvicorn app.main:app --host 0.0.0.0 --port 8000
nssm set %SERVICE_NAME% AppDirectory "%BILLING_DIR%"
nssm set %SERVICE_NAME% DisplayName "Wash Nest Billing System"
nssm set %SERVICE_NAME% Description "Local billing system for Wash Nest laundry — FastAPI + SQLite"
nssm set %SERVICE_NAME% Start SERVICE_AUTO_START
nssm set %SERVICE_NAME% AppStdout "%LOG_DIR%\service_stdout.log"
nssm set %SERVICE_NAME% AppStderr "%LOG_DIR%\service_stderr.log"
nssm set %SERVICE_NAME% AppRotateFiles 1
nssm set %SERVICE_NAME% AppRotateBytes 5242880

echo.
echo Starting %SERVICE_NAME%...
nssm start %SERVICE_NAME%

echo.
echo ========================================
echo  Service installed and started!
echo  Access at: http://localhost:8000
echo  Logs at:   %LOG_DIR%
echo ========================================
echo.
pause
