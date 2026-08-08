"""
快速启动脚本
用于测试和验证财务自动化工具
"""

import sys
import os

# 添加当前目录到Python路径
sys.path.insert(0, os.path.dirname(__file__))

def test_imports():
    """测试导入"""
    print("测试导入模块...")
    
    try:
        import streamlit
        print(f"[OK] Streamlit版本: {streamlit.__version__}")
    except ImportError:
        print("[FAIL] Streamlit未安装")
        return False
    
    try:
        import pandas
        print(f"[OK] Pandas版本: {pandas.__version__}")
    except ImportError:
        print("[FAIL] Pandas未安装")
        return False
    
    try:
        import openpyxl
        print(f"[OK] openpyxl版本: {openpyxl.__version__}")
    except ImportError:
        print("[FAIL] openpyxl未安装")
        return False
    
    try:
        import plotly
        print(f"[OK] Plotly版本: {plotly.__version__}")
    except ImportError:
        print("[FAIL] Plotly未安装")
        return False
    
    return True


def test_data_processor():
    """测试数据处理器"""
    print("\n测试数据处理器...")
    
    try:
        from data_processor import (
            load_csv_data,
            validate_data,
            get_summary_statistics,
            get_monthly_summary,
            get_category_summary,
            detect_anomalies,
        )
        print("[OK] 数据处理器导入成功")
        
        # 测试数据验证
        import pandas as pd
        test_df = pd.DataFrame({
            '金额': [100, 200, 300],
            '部门': ['A', 'B', 'C']
        })
        
        is_valid, message = validate_data(test_df)
        print(f"[OK] 数据验证: {message}")
        
        # 测试统计
        stats = get_summary_statistics(test_df, ['金额'])
        print(f"[OK] 统计计算: 金额均值={stats['金额']['mean']:.2f}")
        
        return True
    except Exception as e:
        print(f"[FAIL] 数据处理器测试失败: {e}")
        return False


def test_excel_handler():
    """测试Excel处理器"""
    print("\n测试Excel处理器...")
    
    try:
        from excel_handler import (
            export_to_excel,
            export_with_vba_template,
        )
        print("[OK] Excel处理器导入成功")
        
        import pandas as pd
        test_df = pd.DataFrame({
            '金额': [100, 200, 300],
            '部门': ['A', 'B', 'C']
        })
        
        # 测试导出
        excel_buffer = export_to_excel(
            test_df,
            "测试报表",
            ["原始数据", "统计汇总"],
            False
        )
        print(f"[OK] Excel导出成功: {len(excel_buffer.getvalue())} 字节")
        
        return True
    except Exception as e:
        print(f"[FAIL] Excel处理器测试失败: {e}")
        return False


def test_config_manager():
    """测试配置管理器"""
    print("\n测试配置管理器...")
    
    try:
        from config_manager import config_manager, get_config, set_config
        print("[OK] 配置管理器导入成功")
        
        # 测试获取配置
        encoding = get_config("data.default_encoding")
        print(f"[OK] 获取配置: {encoding}")
        
        # 测试设置配置
        set_config("data.default_encoding", "gbk")
        encoding = get_config("data.default_encoding")
        print(f"[OK] 设置配置: {encoding}")
        
        # 重置配置
        config_manager.reset_to_default()
        print("[OK] 配置重置成功")
        
        return True
    except Exception as e:
        print(f"[FAIL] 配置管理器测试失败: {e}")
        return False


def test_sample_data():
    """测试示例数据"""
    print("\n测试示例数据...")
    
    try:
        sample_file = os.path.join(os.path.dirname(__file__), "data", "sample_data.csv")
        
        if os.path.exists(sample_file):
            import pandas as pd
            df = pd.read_csv(sample_file)
            print(f"[OK] 示例数据加载成功: {len(df)} 行, {len(df.columns)} 列")
            print(f"  列名: {list(df.columns)}")
            return True
        else:
            print("[FAIL] 示例数据文件不存在")
            return False
    except Exception as e:
        print(f"[FAIL] 示例数据测试失败: {e}")
        return False


def main():
    """主测试函数"""
    print("=" * 50)
    print("财务自动化工具 - 环境测试")
    print("=" * 50)
    
    results = []
    
    # 测试导入
    results.append(("模块导入", test_imports()))
    
    # 测试数据处理器
    results.append(("数据处理器", test_data_processor()))
    
    # 测试Excel处理器
    results.append(("Excel处理器", test_excel_handler()))
    
    # 测试配置管理器
    results.append(("配置管理器", test_config_manager()))
    
    # 测试示例数据
    results.append(("示例数据", test_sample_data()))
    
    # 显示结果
    print("\n" + "=" * 50)
    print("测试结果汇总")
    print("=" * 50)
    
    all_passed = True
    for name, passed in results:
        status = "[OK] 通过" if passed else "[FAIL] 失败"
        print(f"{name}: {status}")
        if not passed:
            all_passed = False
    
    print("\n" + "=" * 50)
    if all_passed:
        print("所有测试通过！")
        print("\n启动应用:")
        print("  streamlit run app.py")
        print("\n或者运行:")
        print("  run.bat")
    else:
        print("部分测试失败，请检查依赖安装")
        print("\n安装依赖:")
        print("  pip install -r requirements.txt")
    print("=" * 50)
    
    return all_passed


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
