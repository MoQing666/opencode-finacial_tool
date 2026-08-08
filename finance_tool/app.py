"""
财务自动化工具 - 主应用
基于 Streamlit + openpyxl + Excel VBA
"""

import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime
import os
import json
from io import BytesIO
import numpy as np

from data_processor import (
    load_csv_data,
    validate_data,
    get_summary_statistics,
    get_monthly_summary,
    get_category_summary,
    detect_anomalies,
)
from excel_handler import (
    export_to_excel,
    export_with_vba_template,
    create_monthly_report,
)
from config_manager import config_manager


# 页面配置
st.set_page_config(
    page_title="财务自动化工具",
    page_icon="💰",
    layout="wide",
    initial_sidebar_state="expanded",
)

# 自定义CSS样式
st.markdown("""
<style>
    .main-header {
        font-size: 2.5rem;
        font-weight: bold;
        color: #1f77b4;
        text-align: center;
        padding: 1rem 0;
    }
    .metric-card {
        background-color: #f0f2f6;
        padding: 1rem;
        border-radius: 0.5rem;
        border-left: 4px solid #1f77b4;
    }
    .stTabs [data-baseweb="tab-list"] {
        gap: 2rem;
    }
    .stTabs [data-baseweb="tab"] {
        height: 3rem;
        padding: 0 2rem;
    }
</style>
""", unsafe_allow_html=True)


def init_session_state():
    """初始化会话状态"""
    if 'data' not in st.session_state:
        st.session_state.data = None
    if 'processed_data' not in st.session_state:
        st.session_state.processed_data = None
    if 'column_mapping' not in st.session_state:
        st.session_state.column_mapping = {}


def render_header():
    """渲染页面头部"""
    st.markdown('<div class="main-header">💰 财务自动化工具</div>', unsafe_allow_html=True)
    st.markdown("---")


def render_sidebar():
    """渲染侧边栏"""
    with st.sidebar:
        st.header("📁 数据导入")
        
        # 文件上传
        uploaded_file = st.file_uploader(
            "上传CSV文件",
            type=['csv'],
            help="支持UTF-8和GBK编码的CSV文件"
        )
        
        # 编码选择
        encoding = st.selectbox(
            "文件编码",
            ['utf-8', 'gbk', 'gb2312', 'latin-1'],
            index=0,
            key="sidebar_encoding"
        )
        
        # 分隔符选择
        separator = st.selectbox(
            "分隔符",
            [',', ';', '\\t', '|'],
            format_func=lambda x: {',': '逗号(,)', ';': '分号(;)', '\\t': '制表符(Tab)', '|': '竖线(|)'}[x],
            index=0,
            key="sidebar_separator"
        )
        
        st.markdown("---")
        st.header("⚙️ 设置")
        
        # 日期列选择
        date_column = st.text_input("日期列名称（可选）", "")
        
        # 金额列选择
        amount_column = st.text_input("金额列名称（可选）", "")
        
        return uploaded_file, encoding, separator, date_column, amount_column


def process_uploaded_file(uploaded_file, encoding, separator):
    """处理上传的文件"""
    if uploaded_file is not None:
        try:
            # 读取CSV
            df = pd.read_csv(uploaded_file, encoding=encoding, sep=separator)
            
            # 数据验证
            is_valid, message = validate_data(df)
            
            if is_valid:
                st.session_state.data = df
                st.success(f"✅ 数据加载成功！共 {len(df)} 行，{len(df.columns)} 列")
                return True
            else:
                st.error(f"❌ 数据验证失败: {message}")
                return False
                
        except Exception as e:
            st.error(f"❌ 文件读取失败: {str(e)}")
            return False
    return False


def render_data_preview():
    """渲染数据预览"""
    if st.session_state.data is not None:
        st.subheader("📊 数据预览")
        
        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric("数据行数", len(st.session_state.data))
        with col2:
            st.metric("数据列数", len(st.session_state.data.columns))
        with col3:
            st.metric("缺失值数量", st.session_state.data.isnull().sum().sum())
        
        # 显示数据表格
        st.dataframe(
            st.session_state.data.head(100),
            use_container_width=True,
            height=400
        )
        
        # 显示列信息
        with st.expander("📋 列信息详情"):
            col_info = pd.DataFrame({
                '列名': st.session_state.data.columns,
                '数据类型': st.session_state.data.dtypes.values,
                '非空数量': st.session_state.data.count().values,
                '缺失数量': st.session_state.data.isnull().sum().values,
                '唯一值数量': st.session_state.data.nunique().values
            })
            st.dataframe(col_info, use_container_width=True)


def render_statistics():
    """渲染统计分析"""
    if st.session_state.data is not None:
        st.subheader("📈 统计分析")
        
        df = st.session_state.data
        
        # 获取数值列
        numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
        
        if not numeric_cols:
            st.warning("⚠️ 未找到数值列，无法进行统计分析")
            return
        
        # 选择分析列
        selected_cols = st.multiselect(
            "选择要分析的列",
            numeric_cols,
            default=numeric_cols[:3] if len(numeric_cols) >= 3 else numeric_cols,
            key="stats_cols"
        )
        
        if selected_cols:
            # 基本统计
            stats = get_summary_statistics(df, selected_cols)
            
            # 显示统计卡片
            cols = st.columns(len(selected_cols))
            for i, col in enumerate(selected_cols):
                with cols[i]:
                    st.metric(
                        label=f"{col} 均值",
                        value=f"{stats[col]['mean']:,.2f}"
                    )
                    st.metric(
                        label=f"{col} 总计",
                        value=f"{stats[col]['sum']:,.2f}"
                    )
            
            # 详细统计表
            with st.expander("📊 详细统计信息"):
                stats_df = pd.DataFrame(stats).T
                st.dataframe(stats_df, use_container_width=True)
            
            # 可视化
            render_charts(df, selected_cols, key_prefix="stats")


def render_charts(df, columns, key_prefix="chart"):
    """渲染图表"""
    st.subheader("📉 数据可视化")
    
    chart_type = st.selectbox(
        "选择图表类型",
        ["柱状图", "折线图", "饼图", "箱线图", "散点图"],
        key=f"{key_prefix}_type"
    )
    
    if chart_type == "柱状图":
        fig = px.bar(
            df[columns].sum().reset_index(),
            x='index',
            y=0,
            title="各列汇总",
            labels={'index': '类别', '0': '金额'}
        )
        st.plotly_chart(fig, use_container_width=True)
        
    elif chart_type == "折线图":
        if len(columns) >= 2:
            fig = px.line(
                df,
                y=columns,
                title="趋势分析"
            )
            st.plotly_chart(fig, use_container_width=True)
        else:
            st.info("折线图需要至少2个数值列")
            
    elif chart_type == "饼图":
        fig = px.pie(
            df[columns].sum().reset_index(),
            values=0,
            names='index',
            title="占比分析"
        )
        st.plotly_chart(fig, use_container_width=True)
        
    elif chart_type == "箱线图":
        fig = px.box(
            df[columns],
            title="数据分布"
        )
        st.plotly_chart(fig, use_container_width=True)
        
    elif chart_type == "散点图":
        if len(columns) >= 2:
            x_col = st.selectbox("X轴", columns, index=0, key=f"{key_prefix}_x")
            y_col = st.selectbox("Y轴", columns, index=1, key=f"{key_prefix}_y")
            fig = px.scatter(
                df,
                x=x_col,
                y=y_col,
                title=f"{x_col} vs {y_col}"
            )
            st.plotly_chart(fig, use_container_width=True)


def render_export():
    """渲染导出功能"""
    if st.session_state.data is not None:
        st.subheader("📤 数据导出")
        
        df = st.session_state.data
        
        col1, col2 = st.columns(2)
        
        with col1:
            st.markdown("### 📄 导出为Excel")
            
            # 文件名
            filename = st.text_input(
                "文件名",
                value=f"财务报表_{datetime.now().strftime('%Y%m%d')}"
            )
            
            # 选择导出内容
            export_options = st.multiselect(
                "选择导出内容",
                ["原始数据", "统计汇总", "分类汇总", "数据透视表"],
                default=["原始数据", "统计汇总"]
            )
            
            # 是否包含图表
            include_charts = st.checkbox("包含图表", value=True)
            
            if st.button("📥 导出Excel报表", type="primary"):
                with st.spinner("正在生成报表..."):
                    try:
                        # 生成Excel文件
                        excel_buffer = export_to_excel(
                            df,
                            filename,
                            export_options,
                            include_charts
                        )
                        
                        # 提供下载
                        st.download_button(
                            label="⬇️ 下载Excel文件",
                            data=excel_buffer,
                            file_name=f"{filename}.xlsx",
                            mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        )
                        st.success("✅ 报表生成成功！")
                        
                    except Exception as e:
                        st.error(f"❌ 导出失败: {str(e)}")
        
        with col2:
            st.markdown("### 📊 使用VBA模板导出")
            
            # VBA模板选择
            vba_templates = get_available_vba_templates()
            selected_template = st.selectbox(
                "选择VBA模板",
                vba_templates,
                key="vba_template"
            )
            
            st.info("""
            💡 **VBA模板说明**
            - 标准财务报表模板：自动生成资产负债表、利润表
            - 现金流量表模板：自动生成现金流量表
            - 管理报表模板：生成管理层所需的汇总报表
            """)
            
            if st.button("📥 使用VBA模板导出", type="secondary"):
                with st.spinner("正在应用VBA模板..."):
                    try:
                        excel_buffer = export_with_vba_template(
                            df,
                            selected_template
                        )
                        
                        st.download_button(
                            label="⬇️ 下载VBA模板报表",
                            data=excel_buffer,
                            file_name=f"VBA报表_{datetime.now().strftime('%Y%m%d')}.xlsm",
                            mime="application/vnd.ms-excel.sheet.macroEnabled.12"
                        )
                        st.success("✅ VBA模板报表生成成功！")
                        
                    except Exception as e:
                        st.error(f"❌ 导出失败: {str(e)}")


def get_available_vba_templates():
    """获取可用的VBA模板列表"""
    vba_dir = os.path.join(os.path.dirname(__file__), "vba")
    if os.path.exists(vba_dir):
        return [f for f in os.listdir(vba_dir) if f.endswith(('.xlsm', '.xltm'))]
    return ["标准财务报表模板.xlsm"]


def render_column_mapping():
    """渲染列映射配置"""
    if st.session_state.data is not None:
        st.subheader("🔧 列映射配置")
        
        df = st.session_state.data
        columns = df.columns.tolist()
        
        col1, col2 = st.columns(2)
        
        with col1:
            st.markdown("### 日期列映射")
            date_col = st.selectbox(
                "选择日期列",
                ["无"] + columns,
                index=0,
                key="map_date_col"
            )
            
            if date_col != "无":
                st.session_state.column_mapping['date'] = date_col
                
                # 日期格式
                date_format = st.text_input(
                    "日期格式",
                    value="%Y-%m-%d",
                    help="例如: %Y-%m-%d, %Y/%m/%d, %d/%m/%Y",
                    key="map_date_format"
                )
                st.session_state.column_mapping['date_format'] = date_format
        
        with col2:
            st.markdown("### 金额列映射")
            amount_col = st.selectbox(
                "选择金额列",
                ["无"] + columns,
                index=0,
                key="map_amount_col"
            )
            
            if amount_col != "无":
                st.session_state.column_mapping['amount'] = amount_col
                
                # 金额格式
                amount_format = st.selectbox(
                    "金额格式",
                    ["标准", "千分位", "万元"],
                    key="map_amount_format"
                )
                st.session_state.column_mapping['amount_format'] = amount_format
        
        # 分类列映射
        st.markdown("### 分类列映射")
        category_col = st.selectbox(
            "选择分类列（用于分组统计）",
            ["无"] + columns,
            index=0,
            key="map_category_col"
        )
        
        if category_col != "无":
            st.session_state.column_mapping['category'] = category_col
        
        # 保存配置
        if st.button("💾 保存列映射配置"):
            save_column_mapping(st.session_state.column_mapping)
            st.success("✅ 配置保存成功！")


def save_column_mapping(mapping):
    """保存列映射配置"""
    config_dir = os.path.join(os.path.dirname(__file__), "config")
    os.makedirs(config_dir, exist_ok=True)
    
    config_path = os.path.join(config_dir, "column_mapping.json")
    with open(config_path, 'w', encoding='utf-8') as f:
        json.dump(mapping, f, ensure_ascii=False, indent=2)


def render_anomaly_detection():
    """渲染异常检测"""
    if st.session_state.data is not None:
        st.subheader("🔍 异常检测")
        
        df = st.session_state.data
        numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
        
        if not numeric_cols:
            st.warning("⚠️ 未找到数值列，无法进行异常检测")
            return
        
        col1, col2 = st.columns(2)
        
        with col1:
            amount_col = st.selectbox("选择金额列", numeric_cols, key="anomaly_amount")
        
        with col2:
            threshold = st.slider("异常阈值（标准差倍数）", 1.0, 4.0, 2.0, 0.1)
        
        if st.button("🔍 开始检测"):
            anomalies = detect_anomalies(df, amount_col, threshold)
            
            if len(anomalies) > 0:
                st.warning(f"⚠️ 发现 {len(anomalies)} 个异常值")
                
                # 显示异常数据
                st.dataframe(anomalies, use_container_width=True)
                
                # 可视化异常
                fig = go.Figure()
                
                # 正常数据
                normal_data = df[~df.index.isin(anomalies.index)]
                fig.add_trace(go.Scatter(
                    x=normal_data.index,
                    y=normal_data[amount_col],
                    mode='markers',
                    name='正常数据',
                    marker=dict(color='blue', size=8)
                ))
                
                # 异常数据
                fig.add_trace(go.Scatter(
                    x=anomalies.index,
                    y=anomalies[amount_col],
                    mode='markers',
                    name='异常数据',
                    marker=dict(color='red', size=12, symbol='x')
                ))
                
                fig.update_layout(
                    title="异常值分布",
                    xaxis_title="数据索引",
                    yaxis_title="金额"
                )
                
                st.plotly_chart(fig, use_container_width=True)
            else:
                st.success("✅ 未发现异常值")


def render_advanced_analysis():
    """渲染高级分析"""
    if st.session_state.data is not None:
        st.subheader("📊 高级分析")
        
        df = st.session_state.data
        numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
        categorical_cols = df.select_dtypes(include=['object']).columns.tolist()
        
        analysis_type = st.selectbox(
            "选择分析类型",
            ["分组汇总", "相关性分析", "趋势分析"],
            key="analysis_type"
        )
        
        if analysis_type == "分组汇总":
            if categorical_cols and numeric_cols:
                group_col = st.selectbox("选择分组列", categorical_cols, key="group_col")
                value_col = st.selectbox("选择数值列", numeric_cols, key="value_col")
                
                if st.button("📊 生成分组汇总"):
                    grouped = df.groupby(group_col)[value_col].agg(['sum', 'mean', 'count']).reset_index()
                    grouped.columns = [group_col, '合计', '均值', '数量']
                    grouped = grouped.sort_values('合计', ascending=False)
                    
                    st.dataframe(grouped, use_container_width=True)
                    
                    # 柱状图
                    fig = px.bar(
                        grouped,
                        x=group_col,
                        y='合计',
                        title=f"按{group_col}分组汇总"
                    )
                    st.plotly_chart(fig, use_container_width=True)
            else:
                st.warning("⚠️ 需要至少一个分类列和一个数值列")
        
        elif analysis_type == "相关性分析":
            if len(numeric_cols) >= 2:
                if st.button("📊 生成相关性矩阵"):
                    corr_matrix = df[numeric_cols].corr()
                    
                    # 热力图
                    fig = px.imshow(
                        corr_matrix,
                        title="相关性矩阵",
                        color_continuous_scale='RdBu_r',
                        aspect="auto"
                    )
                    st.plotly_chart(fig, use_container_width=True)
                    
                    # 显示相关系数
                    st.dataframe(corr_matrix.style.background_gradient(cmap='RdBu_r'), use_container_width=True)
            else:
                st.warning("⚠️ 需要至少两个数值列进行相关性分析")
        
        elif analysis_type == "趋势分析":
            date_cols = [col for col in df.columns if 'date' in col.lower() or '日期' in col]
            
            if date_cols and numeric_cols:
                date_col = st.selectbox("选择日期列", date_cols, key="trend_date")
                value_col = st.selectbox("选择数值列", numeric_cols, key="trend_value")
                
                if st.button("📊 生成趋势图"):
                    df_sorted = df.sort_values(date_col)
                    
                    fig = px.line(
                        df_sorted,
                        x=date_col,
                        y=value_col,
                        title=f"{value_col}趋势分析"
                    )
                    st.plotly_chart(fig, use_container_width=True)
            else:
                st.warning("⚠️ 需要至少一个日期列和一个数值列")


def render_main_content():
    """渲染主内容"""
    # 创建标签页
    tab1, tab2, tab3, tab4, tab5, tab6, tab7 = st.tabs([
        "📊 数据预览",
        "📈 统计分析",
        "📉 数据可视化",
        "🔍 异常检测",
        "📊 高级分析",
        "🔧 列映射",
        "📤 数据导出"
    ])
    
    with tab1:
        render_data_preview()
    
    with tab2:
        render_statistics()
    
    with tab3:
        if st.session_state.data is not None:
            df = st.session_state.data
            numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
            if numeric_cols:
                render_charts(df, numeric_cols, key_prefix="main")
            else:
                st.warning("⚠️ 未找到数值列")
    
    with tab4:
        render_anomaly_detection()
    
    with tab5:
        render_advanced_analysis()
    
    with tab6:
        render_column_mapping()
    
    with tab7:
        render_export()


def main():
    """主函数"""
    init_session_state()
    render_header()
    
    # 侧边栏
    uploaded_file, encoding, separator, date_column, amount_column = render_sidebar()
    
    # 处理上传的文件
    if uploaded_file is not None:
        process_uploaded_file(uploaded_file, encoding, separator)
    
    # 主内容
    if st.session_state.data is not None:
        render_main_content()
    else:
        # 欢迎页面
        st.markdown("""
        ## 👋 欢迎使用财务自动化工具
        
        ### 🚀 快速开始
        1. 在左侧上传CSV文件
        2. 选择正确的编码和分隔符
        3. 系统将自动加载并分析数据
        
        ### 📋 功能特点
        - **数据导入**: 支持多种CSV格式和编码
        - **统计分析**: 自动生成财务统计指标
        - **数据可视化**: 多种图表类型展示数据
        - **报表导出**: 一键导出Excel报表
        - **VBA模板**: 使用预设模板生成标准报表
        
        ### 💡 使用提示
        - 支持UTF-8、GBK、GB2312等多种编码
        - 可自定义列映射，适配不同数据格式
        - 支持导出为Excel和VBA宏文件
        """)
        
        # 示例数据
        st.markdown("---")
        st.markdown("### 📁 示例数据")
        
        if st.button("📥 加载示例数据"):
            example_data = create_example_data()
            st.session_state.data = example_data
            st.rerun()


def create_example_data():
    """创建示例数据"""
    import numpy as np
    
    dates = pd.date_range(start='2024-01-01', periods=100, freq='D')
    categories = ['办公费', '差旅费', '工资', '房租', '水电费', '其他']
    
    data = {
        '日期': dates,
        '部门': np.random.choice(['销售部', '技术部', '财务部', '人事部'], 100),
        '费用类别': np.random.choice(categories, 100),
        '金额': np.random.uniform(100, 10000, 100).round(2),
        '备注': [f'费用{i}' for i in range(100)]
    }
    
    return pd.DataFrame(data)


if __name__ == "__main__":
    main()
