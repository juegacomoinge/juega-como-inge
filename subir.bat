@echo off
chcp 65001 >nul
title OBRA - Subir actualizacion a GitHub
cd /d "%~dp0"

echo ==========================================
echo   OBRA - Publicar cambios en GitHub
echo ==========================================
echo.

rem Comprobar que Git esta instalado
where git >nul 2>nul
if errorlevel 1 (
  echo [ERROR] No se encontro Git. Instalalo desde https://git-scm.com
  goto fin
)

rem Mostrar que archivos cambiaron
git add -A
git diff --cached --quiet
if not errorlevel 1 (
  echo No hay archivos nuevos; se suben los cambios ya guardados, si los hay.
  goto subir
)
echo Archivos que se van a subir:
git status --short
echo.

rem Pedir una descripcion del cambio
set "MSG="
set /p "MSG=Describe el cambio (Enter = 'Actualizacion'): "
if "%MSG%"=="" set "MSG=Actualizacion"

git commit -q -m "%MSG%"
if errorlevel 1 (
  echo [ERROR] No se pudo guardar el cambio.
  goto fin
)

:subir
echo.
echo Subiendo a GitHub...
git push
if errorlevel 1 (
  echo.
  echo [ERROR] No se pudo subir. Revisa tu conexion o inicia sesion en GitHub.
  goto fin
)

echo.
echo ==========================================
echo   Listo. El juego se actualiza en 1-2 minutos:
echo   https://juegacomoinge.github.io/juega-como-inge/
echo ==========================================

:fin
echo.
pause
