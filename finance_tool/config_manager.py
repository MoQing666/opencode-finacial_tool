"""
配置管理模块
负责用户配置的保存和加载
"""

import json
import os
from typing import Dict, Any, Optional
from pathlib import Path


# 默认配置
DEFAULT_CONFIG = {
    "app": {
        "language": "zh-CN",
        "theme": "light",
        "auto_save": True
    },
    "data": {
        "default_encoding": "utf-8",
        "default_separator": ",",
        "date_format": "%Y-%m-%d",
        "amount_format": "standard"
    },
    "export": {
        "default_filename": "财务报表",
        "include_charts": True,
        "export_options": ["原始数据", "统计汇总"],
        "vba_template": "标准财务报表模板.xlsm"
    },
    "column_mapping": {
        "date": "",
        "amount": "",
        "category": "",
        "department": ""
    },
    "display": {
        "decimal_places": 2,
        "show_percentage": True,
        "chart_theme": "plotly"
    }
}


class ConfigManager:
    """配置管理器"""
    
    def __init__(self, config_dir: str = None):
        """
        初始化配置管理器
        
        Args:
            config_dir: 配置文件目录，默认为当前目录下的config文件夹
        """
        if config_dir is None:
            config_dir = os.path.join(os.path.dirname(__file__), "config")
        
        self.config_dir = config_dir
        self.config_file = os.path.join(config_dir, "config.json")
        self.config = DEFAULT_CONFIG.copy()
        
        # 确保配置目录存在
        os.makedirs(config_dir, exist_ok=True)
        
        # 加载配置
        self.load_config()
    
    def load_config(self) -> Dict[str, Any]:
        """
        加载配置文件
        
        Returns:
            配置字典
        """
        if os.path.exists(self.config_file):
            try:
                with open(self.config_file, 'r', encoding='utf-8') as f:
                    saved_config = json.load(f)
                    # 合并配置（保留默认值）
                    self.config = self._merge_config(DEFAULT_CONFIG, saved_config)
            except Exception as e:
                print(f"加载配置失败: {e}")
                self.config = DEFAULT_CONFIG.copy()
        
        return self.config
    
    def save_config(self, config: Dict[str, Any] = None) -> bool:
        """
        保存配置文件
        
        Args:
            config: 要保存的配置，如果为None则保存当前配置
        
        Returns:
            是否保存成功
        """
        if config is not None:
            self.config = config
        
        try:
            with open(self.config_file, 'w', encoding='utf-8') as f:
                json.dump(self.config, f, ensure_ascii=False, indent=2)
            return True
        except Exception as e:
            print(f"保存配置失败: {e}")
            return False
    
    def get(self, key: str, default: Any = None) -> Any:
        """
        获取配置值
        
        Args:
            key: 配置键，支持点号分隔（如"data.default_encoding"）
            default: 默认值
        
        Returns:
            配置值
        """
        keys = key.split('.')
        value = self.config
        
        for k in keys:
            if isinstance(value, dict) and k in value:
                value = value[k]
            else:
                return default
        
        return value
    
    def set(self, key: str, value: Any) -> bool:
        """
        设置配置值
        
        Args:
            key: 配置键，支持点号分隔
            value: 配置值
        
        Returns:
            是否设置成功
        """
        keys = key.split('.')
        config = self.config
        
        # 遍历到最后一个键的父级
        for k in keys[:-1]:
            if k not in config:
                config[k] = {}
            config = config[k]
        
        # 设置值
        config[keys[-1]] = value
        
        # 自动保存
        if self.config.get("app", {}).get("auto_save", True):
            self.save_config()
        
        return True
    
    def _merge_config(self, default: Dict, saved: Dict) -> Dict:
        """
        合并配置（保留默认值）
        
        Args:
            default: 默认配置
            saved: 保存的配置
        
        Returns:
            合并后的配置
        """
        result = default.copy()
        
        for key, value in saved.items():
            if key in result and isinstance(result[key], dict) and isinstance(value, dict):
                result[key] = self._merge_config(result[key], value)
            else:
                result[key] = value
        
        return result
    
    def reset_to_default(self) -> bool:
        """
        重置为默认配置
        
        Returns:
            是否重置成功
        """
        self.config = DEFAULT_CONFIG.copy()
        return self.save_config()
    
    def get_column_mapping(self) -> Dict[str, str]:
        """
        获取列映射配置
        
        Returns:
            列映射字典
        """
        return self.config.get("column_mapping", {})
    
    def set_column_mapping(self, mapping: Dict[str, str]) -> bool:
        """
        设置列映射配置
        
        Args:
            mapping: 列映射字典
        
        Returns:
            是否设置成功
        """
        self.config["column_mapping"] = mapping
        return self.save_config()
    
    def get_export_config(self) -> Dict[str, Any]:
        """
        获取导出配置
        
        Returns:
            导出配置字典
        """
        return self.config.get("export", {})
    
    def set_export_config(self, export_config: Dict[str, Any]) -> bool:
        """
        设置导出配置
        
        Args:
            export_config: 导出配置字典
        
        Returns:
            是否设置成功
        """
        self.config["export"] = export_config
        return self.save_config()
    
    def get_display_config(self) -> Dict[str, Any]:
        """
        获取显示配置
        
        Returns:
            显示配置字典
        """
        return self.config.get("display", {})
    
    def set_display_config(self, display_config: Dict[str, Any]) -> bool:
        """
        设置显示配置
        
        Args:
            display_config: 显示配置字典
        
        Returns:
            是否设置成功
        """
        self.config["display"] = display_config
        return self.save_config()


# 全局配置管理器实例
config_manager = ConfigManager()


def get_config(key: str, default: Any = None) -> Any:
    """
    获取配置值（便捷函数）
    
    Args:
        key: 配置键
        default: 默认值
    
    Returns:
        配置值
    """
    return config_manager.get(key, default)


def set_config(key: str, value: Any) -> bool:
    """
    设置配置值（便捷函数）
    
    Args:
        key: 配置键
        value: 配置值
    
    Returns:
        是否设置成功
    """
    return config_manager.set(key, value)


def load_config() -> Dict[str, Any]:
    """
    加载配置（便捷函数）
    
    Returns:
        配置字典
    """
    return config_manager.load_config()


def save_config(config: Dict[str, Any] = None) -> bool:
    """
    保存配置（便捷函数）
    
    Args:
        config: 要保存的配置
    
    Returns:
        是否保存成功
    """
    return config_manager.save_config(config)
