"""
财务自动化工具 - 桌面启动器
打包命令: pyinstaller --onefile --windowed --name 财务自动化工具 launcher.py
"""

import subprocess
import threading
import time
import webbrowser
import os
import sys
import socket
from tkinter import messagebox


def get_free_port(start_port=8501):
    """获取可用端口"""
    for port in range(start_port, start_port + 10):
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(1)
            result = sock.connect_ex(('127.0.0.1', port))
            sock.close()
            if result != 0:
                return port
        except:
            pass
    return start_port


def is_port_available(port):
    """检查端口是否可用"""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1)
        result = sock.connect_ex(('127.0.0.1', port))
        sock.close()
        return result != 0
    except:
        return True


def wait_for_server(port, timeout=30):
    """等待服务器启动"""
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(1)
            result = sock.connect_ex(('127.0.0.1', port))
            sock.close()
            if result == 0:
                return True
        except:
            pass
        time.sleep(0.5)
    return False


def get_app_dir():
    """获取应用目录"""
    if getattr(sys, 'frozen', False):
        # 打包后的exe路径
        return os.path.dirname(sys.executable)
    else:
        # 开发环境
        return os.path.dirname(os.path.abspath(__file__))


def main():
    """主函数"""
    app_dir = get_app_dir()
    app_path = os.path.join(app_dir, 'app.py')
    
    # 检查app.py是否存在
    if not os.path.exists(app_path):
        messagebox.showerror("错误", f"未找到应用文件：\n{app_path}")
        return
    
    # 获取可用端口
    port = get_free_port(8501)
    
    # 构建启动命令
    cmd = [
        sys.executable, '-m', 'streamlit', 'run', app_path,
        '--server.headless', 'true',
        '--server.port', str(port),
        '--browser.gatherUsageStats', 'false',
        '--theme.primaryColor', '#1f77b4',
    ]
    
    # 启动Streamlit服务器（后台线程）
    def start_server():
        try:
            subprocess.Popen(
                cmd,
                cwd=app_dir,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                creationflags=subprocess.CREATE_NO_WINDOW if sys.platform == 'win32' else 0
            )
        except Exception as e:
            print(f"启动失败: {e}")
    
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    
    # 等待服务器启动
    if wait_for_server(port):
        url = f"http://localhost:{port}"
        webbrowser.open(url)
        
        # 显示托盘提示（可选）
        try:
            import pystray
            from PIL import Image
            # 如果需要系统托盘功能，可以在这里添加
        except ImportError:
            pass
        
        print(f"应用已启动: {url}")
    else:
        messagebox.showerror("错误", "服务器启动超时，请检查端口是否被占用")


if __name__ == '__main__':
    main()
