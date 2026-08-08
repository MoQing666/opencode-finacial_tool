@echo off
chcp 65001 >nul
echo ========================================
echo   财务自动化工具 - 打包脚本
echo ========================================
echo.

echo [1/4] 检查PyInstaller...
pip show pyinstaller >nul 2>&1
if errorlevel 1 (
    echo 正在安装PyInstaller...
    pip install pyinstaller -q
)
echo PyInstaller已就绪

echo.
echo [2/4] 清理旧文件...
if exist build rmdir /s /q build
if exist dist rmdir /s /q dist
if exist "*.spec" del /q "*.spec"
echo 清理完成

echo.
echo [3/4] 开始打包...
echo 这可能需要几分钟，请耐心等待...

pyinstaller ^
    --onefile ^
    --windowed ^
    --name "财务自动化工具" ^
    --add-data "app.py;." ^
    --add-data "data_processor.py;." ^
    --add-data "excel_handler.py;." ^
    --add-data "config_manager.py;." ^
    --add-data "data;data" ^
    --add-data "vba;vba" ^
    --hidden-import streamlit ^
    --hidden-import pandas ^
    --hidden-import openpyxl ^
    --hidden-import plotly ^
    --hidden-import numpy ^
    launcher.py

echo.
echo [4/4] 打包完成！
echo.
echo 可执行文件位置: dist\财务自动化工具.exe
echo.
echo 注意: 首次运行需要已安装Python环境
echo       如需完全独立运行，请安装完整Python环境
echo.

pause
