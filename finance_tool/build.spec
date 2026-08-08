# -*- mode: python ; coding: utf-8 -*-
"""
PyInstaller spec文件 - 财务自动化工具
使用命令: pyinstaller build.spec
"""

import os
import sys

block_cipher = None

# 项目路径
project_path = os.path.dirname(os.path.abspath(SPEC))

a = Analysis(
    ['launcher.py'],
    pathex=[project_path],
    binaries=[],
    datas=[
        ('app.py', '.'),
        ('data_processor.py', '.'),
        ('excel_handler.py', '.'),
        ('config_manager.py', '.'),
        ('data', 'data'),
        ('vba', 'vba'),
    ],
    hiddenimports=[
        'streamlit',
        'streamlit.web.cli',
        'pandas',
        'openpyxl',
        'plotly',
        'numpy',
        'pyarrow',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='财务自动化工具',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,  # 不显示控制台窗口
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=None,  # 可以添加ico图标路径
)
