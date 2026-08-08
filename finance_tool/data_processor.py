"""
数据处理模块
负责数据的加载、验证和统计分析
"""

import pandas as pd
import numpy as np
from typing import List, Dict, Tuple, Optional


def load_csv_data(file_path: str, encoding: str = 'utf-8', separator: str = ',') -> pd.DataFrame:
    """
    加载CSV数据
    
    Args:
        file_path: CSV文件路径
        encoding: 文件编码
        separator: 分隔符
    
    Returns:
        pandas DataFrame
    """
    try:
        df = pd.read_csv(file_path, encoding=encoding, sep=separator)
        return df
    except UnicodeDecodeError:
        # 尝试其他编码
        for enc in ['gbk', 'gb2312', 'latin-1']:
            try:
                df = pd.read_csv(file_path, encoding=enc, sep=separator)
                return df
            except:
                continue
        raise ValueError(f"无法读取文件，请检查编码格式")


def validate_data(df: pd.DataFrame) -> Tuple[bool, str]:
    """
    验证数据有效性
    
    Args:
        df: 要验证的DataFrame
    
    Returns:
        (是否有效, 错误信息)
    """
    if df is None or df.empty:
        return False, "数据为空"
    
    if len(df.columns) < 2:
        return False, "数据列数不足，至少需要2列"
    
    # 检查是否有数值列
    numeric_cols = df.select_dtypes(include=['number']).columns
    if len(numeric_cols) == 0:
        return False, "未找到数值列，无法进行财务分析"
    
    return True, "数据验证通过"


def get_summary_statistics(df: pd.DataFrame, columns: List[str]) -> Dict:
    """
    获取汇总统计
    
    Args:
        df: 数据DataFrame
        columns: 要统计的列名列表
    
    Returns:
        统计结果字典
    """
    stats = {}
    
    for col in columns:
        if col in df.columns:
            col_stats = {
                'count': int(df[col].count()),
                'mean': float(df[col].mean()),
                'std': float(df[col].std()),
                'min': float(df[col].min()),
                '25%': float(df[col].quantile(0.25)),
                '50%': float(df[col].median()),
                '75%': float(df[col].quantile(0.75)),
                'max': float(df[col].max()),
                'sum': float(df[col].sum()),
                'skew': float(df[col].skew()),
                'kurt': float(df[col].kurtosis())
            }
            stats[col] = col_stats
    
    return stats


def get_monthly_summary(df: pd.DataFrame, date_col: str, amount_col: str) -> pd.DataFrame:
    """
    获取月度汇总
    
    Args:
        df: 数据DataFrame
        date_col: 日期列名
        amount_col: 金额列名
    
    Returns:
        月度汇总DataFrame
    """
    df_copy = df.copy()
    
    # 转换日期列
    df_copy[date_col] = pd.to_datetime(df_copy[date_col], errors='coerce')
    
    # 提取年月
    df_copy['年月'] = df_copy[date_col].dt.to_period('M')
    
    # 按月汇总
    monthly = df_copy.groupby('年月').agg(
        金额合计=(amount_col, 'sum'),
        金额均值=(amount_col, 'mean'),
        交易次数=(amount_col, 'count'),
        最大金额=(amount_col, 'max'),
        最小金额=(amount_col, 'min')
    ).reset_index()
    
    # 转换年月为字符串
    monthly['年月'] = monthly['年月'].astype(str)
    
    return monthly


def get_category_summary(df: pd.DataFrame, category_col: str, amount_col: str) -> pd.DataFrame:
    """
    获取分类汇总
    
    Args:
        df: 数据DataFrame
        category_col: 分类列名
        amount_col: 金额列名
    
    Returns:
        分类汇总DataFrame
    """
    category_stats = df.groupby(category_col).agg(
        金额合计=(amount_col, 'sum'),
        金额均值=(amount_col, 'mean'),
        交易次数=(amount_col, 'count'),
        占比=(amount_col, lambda x: x.sum() / df[amount_col].sum() * 100)
    ).reset_index()
    
    # 按金额降序排列
    category_stats = category_stats.sort_values('金额合计', ascending=False)
    
    return category_stats


def get_department_summary(df: pd.DataFrame, dept_col: str, amount_col: str) -> pd.DataFrame:
    """
    获取部门汇总
    
    Args:
        df: 数据DataFrame
        dept_col: 部门列名
        amount_col: 金额列名
    
    Returns:
        部门汇总DataFrame
    """
    dept_stats = df.groupby(dept_col).agg(
        金额合计=(amount_col, 'sum'),
        金额均值=(amount_col, 'mean'),
        交易次数=(amount_col, 'count')
    ).reset_index()
    
    dept_stats = dept_stats.sort_values('金额合计', ascending=False)
    
    return dept_stats


def calculate_growth_rate(df: pd.DataFrame, date_col: str, amount_col: str) -> pd.DataFrame:
    """
    计算增长率
    
    Args:
        df: 数据DataFrame
        date_col: 日期列名
        amount_col: 金额列名
    
    Returns:
        包含增长率的DataFrame
    """
    df_copy = df.copy()
    df_copy[date_col] = pd.to_datetime(df_copy[date_col], errors='coerce')
    df_copy['年月'] = df_copy[date_col].dt.to_period('M')
    
    monthly = df_copy.groupby('年月')[amount_col].sum().reset_index()
    monthly['年月'] = monthly['年月'].astype(str)
    
    # 计算环比增长率
    monthly['环比增长'] = monthly[amount_col].pct_change() * 100
    
    # 计算同比增长率（如果有跨年数据）
    monthly['同比增长'] = monthly[amount_col].pct_change(periods=12) * 100
    
    return monthly


def detect_anomalies(df: pd.DataFrame, amount_col: str, threshold: float = 2.0) -> pd.DataFrame:
    """
    检测异常值
    
    Args:
        df: 数据DataFrame
        amount_col: 金额列名
        threshold: 标准差倍数阈值
    
    Returns:
        异常值DataFrame
    """
    mean = df[amount_col].mean()
    std = df[amount_col].std()
    
    lower_bound = mean - threshold * std
    upper_bound = mean + threshold * std
    
    anomalies = df[
        (df[amount_col] < lower_bound) | 
        (df[amount_col] > upper_bound)
    ].copy()
    
    anomalies['异常类型'] = anomalies[amount_col].apply(
        lambda x: '偏高' if x > upper_bound else '偏低'
    )
    anomalies['偏离程度'] = abs(anomalies[amount_col] - mean) / std
    
    return anomalies


def create_pivot_table(df: pd.DataFrame, index_col: str, columns_col: str, values_col: str) -> pd.DataFrame:
    """
    创建数据透视表
    
    Args:
        df: 数据DataFrame
        index_col: 行索引列
        columns_col: 列索引列
        values_col: 值列
    
    Returns:
        透视表DataFrame
    """
    pivot = pd.pivot_table(
        df,
        values=values_col,
        index=index_col,
        columns=columns_col,
        aggfunc='sum',
        fill_value=0
    )
    
    return pivot


def calculate_budget_variance(actual: pd.Series, budget: pd.Series) -> pd.DataFrame:
    """
    计算预算差异
    
    Args:
        actual: 实际金额
        budget: 预算金额
    
    Returns:
        预算差异分析DataFrame
    """
    variance = pd.DataFrame({
        '实际金额': actual,
        '预算金额': budget,
        '差异金额': actual - budget,
        '差异比例': ((actual - budget) / budget * 100).round(2)
    })
    
    return variance
