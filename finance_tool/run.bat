@echo off
chcp 65001 >nul
echo ========================================
echo   财务自动化工具 - 启动脚本
echo ========================================
echo.

echo [1/3] 检查Python环境...
python --version >nul 2>&1
if errorlevel 1 (
    echo 错误: 未找到Python，请先安装Python
    pause
    exit /b 1
)
echo Python环境正常

echo.
echo [2/3] 检查依赖包...
pip show streamlit >nul 2>&1
if errorlevel 1 (
    echo 正在安装依赖包...
    pip install -r requirements.txt
)
echo 依赖包检查完成

echo.
echo [3/3] 启动应用...
echo 应用将在浏览器中打开，请稍候...
echo.

streamlit run app.py

pause
