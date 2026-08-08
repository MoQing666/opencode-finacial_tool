"""
财务自动化工具 - 原生桌面版
使用pywebview创建独立窗口

安装依赖: pip install pywebview streamlit
打包命令: pyinstaller --onefile --windowed --name 财务自动化工具 desktop.py
"""

import threading
import time
import socket
import subprocess
import sys
import os


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
        return os.path.dirname(sys.executable)
    else:
        return os.path.dirname(os.path.abspath(__file__))


def start_streamlit(port):
    """启动Streamlit服务器"""
    app_dir = get_app_dir()
    app_path = os.path.join(app_dir, 'app.py')
    
    cmd = [
        sys.executable, '-m', 'streamlit', 'run', app_path,
        '--server.headless', 'true',
        '--server.port', str(port),
        '--browser.gatherUsageStats', 'false',
    ]
    
    subprocess.Popen(
        cmd,
        cwd=app_dir,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        creationflags=subprocess.CREATE_NO_WINDOW if sys.platform == 'win32' else 0
    )


def main():
    """主函数"""
    try:
        import webview
    except ImportError:
        import tkinter as tk
        from tkinter import messagebox
        root = tk.Tk()
        root.withdraw()
        messagebox.showerror(
            "缺少依赖",
            "请先安装pywebview：\npip install pywebview"
        )
        return
    
    port = get_free_port(8501)
    
    # 后台启动Streamlit
    server_thread = threading.Thread(
        target=start_streamlit,
        args=(port,),
        daemon=True
    )
    server_thread.start()
    
    # 等待服务器就绪
    if not wait_for_server(port):
        import tkinter as tk
        from tkinter import messagebox
        root = tk.Tk()
        root.withdraw()
        messagebox.showerror("错误", "服务器启动超时")
        return
    
    url = f"http://localhost:{port}"
    
    # 创建原生窗口
    window = webview.create_window(
        title="财务自动化工具",
        url=url,
        width=1400,
        height=900,
        resizable=True,
        min_size=(800, 600),
        text_select=True,
    )
    
    # 启动窗口（阻塞）
    webview.start(debug=False)


if __name__ == '__main__':
    main()
