@echo off
SETLOCAL ENABLEDELAYEDEXPANSION

SET "args="
FOR /F "tokens=*" %%i IN (.env) DO (
    SET "line=%%i"
    IF "!line:~0,1!" NEQ "#" (
        SET "args=!args! --build-arg %%i"
    )
)

docker build !args! -t  ai-context-bridge-ui .

ENDLOCAL
