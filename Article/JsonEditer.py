import json
import tkinter as tk
from tkinter import ttk, messagebox, filedialog
from datetime import datetime
import os
import glob

class LogGenerator:
    def __init__(self, root):
        """
        初始化JSON编辑器应用程序
        :param root: Tkinter根窗口
        """
        self.root = root
        self.root.title("JSON编辑器 - Lictober7th")  # 设置窗口标题
        self.root.geometry("850x720")  # 设置窗口大小
        self.root.resizable(True, True)  # 允许窗口调整大小
        
        # 存储所有帖子数据
        self.posts = []  # 存储所有帖子数据的列表
        self.current_post_index = -1  # 当前选中的帖子索引，-1表示没有选中
        self.manifest_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "manifest.json")
        
        # 设置主题
        self.setup_ui()  # 初始化用户界面
        
        # 扫描.md文件
        self.scan_md_files()  # 扫描当前目录下的.md文件
        
        # 加载manifest.json
        self.load_manifest()  # 加载manifest.json文件
        
    def setup_ui(self):
        """
        设置用户界面，创建主框架和各个UI组件
        """
        # 主框架
        main_frame = ttk.Frame(self.root, padding="10")  # 创建主框架，添加10像素的内边距
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))  # 将主框架放置在网格中，使其可以拉伸
        
        # 标题
        title_label = ttk.Label(main_frame, text="JSON编辑器", font=("Arial", 16, "bold"))  # 创建标题标签
        title_label.grid(row=0, column=0, columnspan=2, pady=(0, 10))  # 放置标题标签，跨两列
        
        subtitle_label = ttk.Label(main_frame, text="Lictober7th://LOG", font=("Arial", 10))  # 创建副标题标签
        subtitle_label.grid(row=1, column=0, columnspan=2, pady=(0, 20))  # 放置副标题标签，跨两列
        
        # 分隔线
        ttk.Separator(main_frame, orient='horizontal').grid(row=2, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=(0, 10))  # 创建水平分隔线
        
        # 创建输入区域
        self.create_input_fields(main_frame)  # 创建输入字段区域
        
        # 按钮区域
        self.create_button_area(main_frame)  # 创建按钮区域
        
        # 帖子列表区域
        self.create_post_list_area(main_frame)  # 创建帖子列表区域
        
        # 底部操作按钮
        self.create_bottom_buttons(main_frame)  # 创建底部按钮区域
        
    def create_input_fields(self, parent):
        """
        创建输入字段区域，包括文件名、标题、时间、分类等
        :param parent: 父级容器
        """
        # 输入框架
        input_frame = ttk.LabelFrame(parent, text="帖子信息", padding="10")  # 创建输入框架，标题为"帖子信息"
        input_frame.grid(row=3, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=(0, 10))  # 放置输入框架
        
        # 文件名 - 下拉选择框显示.md文件
        ttk.Label(input_frame, text="文件名:").grid(row=0, column=0, sticky=tk.W, pady=2)  # 创建文件名标签
        
        # 创建文件选择的框架
        file_frame = ttk.Frame(input_frame)  # 创建文件选择框架
        file_frame.grid(row=0, column=1, columnspan=2, sticky=tk.W, pady=2, padx=(5, 0))  # 放置文件选择框架
        
        self.file_var = tk.StringVar()  # 创建文件名字符串变量
        self.file_combobox = ttk.Combobox(file_frame, textvariable=self.file_var, width=27)  # 创建文件下拉选择框
        self.file_combobox.pack(side=tk.LEFT)  # 将下拉选择框放在左侧
        
        # 刷新按钮
        ttk.Button(input_frame, text="刷新列表", command=self.scan_md_files).grid(row=0, column=3, padx=(5, 0))  # 创建刷新按钮
        
        # 标题
        ttk.Label(input_frame, text="标题:").grid(row=1, column=0, sticky=tk.W, pady=2)  # 创建标题标签
        self.title_entry = ttk.Entry(input_frame, width=40)  # 创建标题输入框
        self.title_entry.grid(row=1, column=1, columnspan=3, sticky=tk.W, pady=2, padx=(5, 0))  # 放置标题输入框
        
        # 时间（自动生成当前时间）
        ttk.Label(input_frame, text="时间:").grid(row=2, column=0, sticky=tk.W, pady=2)  # 创建时间标签
        self.time_entry = ttk.Entry(input_frame, width=40)  # 创建时间输入框
        self.time_entry.grid(row=2, column=1, columnspan=3, sticky=tk.W, pady=2, padx=(5, 0))  # 放置时间输入框
        self.time_entry.insert(0, datetime.now().strftime("%Y-%m-%d %H:%M:%S"))  # 设置默认值为当前时间
        ttk.Button(input_frame, text="当前时间", command=self.set_current_time).grid(row=2, column=3, padx=(5, 0))  # 创建当前时间按钮
        
        # 分类（添加了"其他"）
        ttk.Label(input_frame, text="分类:").grid(row=3, column=0, sticky=tk.W, pady=2)  # 创建分类标签
        self.cat_frame = ttk.Frame(input_frame)  # 创建分类框架
        self.cat_frame.grid(row=3, column=1, columnspan=3, sticky=tk.W, pady=2, padx=(5, 0))  # 放置分类框架
        
        self.cat_var = tk.StringVar(value="dev")  # 创建分类字符串变量，默认值为"dev"
        categories = [  # 分类选项列表
            ("开发", "dev"),
            ("游戏", "game"),
            ("考据", "lore"),
            ("其他", "other")
        ]
        for i, (label, value) in enumerate(categories):  # 创建单选按钮
            ttk.Radiobutton(self.cat_frame, text=label, variable=self.cat_var, 
                           value=value).grid(row=0, column=i, padx=5)  # 放置单选按钮
        
        # 大标签
        ttk.Label(input_frame, text="大标签:").grid(row=4, column=0, sticky=tk.W, pady=2)  # 创建大标签标签
        self.cat_label_entry = ttk.Entry(input_frame, width=40)  # 创建大标签输入框
        self.cat_label_entry.grid(row=4, column=1, columnspan=3, sticky=tk.W, pady=2, padx=(5, 0))  # 放置大标签输入框
        
        # 标签
        ttk.Label(input_frame, text="标签 (用逗号分隔):").grid(row=5, column=0, sticky=tk.W, pady=2)  # 创建标签标签
        self.tags_entry = ttk.Entry(input_frame, width=40)  # 创建标签输入框
        self.tags_entry.grid(row=5, column=1, columnspan=3, sticky=tk.W, pady=2, padx=(5, 0))  # 放置标签输入框
        ttk.Label(input_frame, text="例如: Python, JSON, 日志").grid(row=5, column=3, padx=(5, 0))  # 创建标签示例标签
        
        # 摘要
        ttk.Label(input_frame, text="摘要:").grid(row=6, column=0, sticky=tk.W, pady=2)  # 创建摘要标签
        self.excerpt_entry = ttk.Entry(input_frame, width=40)  # 创建摘要输入框
        self.excerpt_entry.grid(row=6, column=1, columnspan=3, sticky=tk.W, pady=2, padx=(5, 0))  # 放置摘要输入框
        
        # 精选
        ttk.Label(input_frame, text="精选:").grid(row=7, column=0, sticky=tk.W, pady=2)  # 创建精选标签
        self.featured_var = tk.BooleanVar(value=False)  # 创建精选布尔变量，默认值为False
        ttk.Checkbutton(input_frame, text="设为精选", variable=self.featured_var).grid(row=7, column=1, sticky=tk.W, pady=2, padx=(5, 0))  # 创建精选复选框
        
    def scan_md_files(self):
        """扫描当前目录下的所有.md文件"""
        try:
            # 获取当前脚本所在目录
            current_dir = os.path.dirname(os.path.abspath(__file__))
            # 扫描所有.md文件
            md_files = glob.glob(os.path.join(current_dir, "*.md"))
            # 获取完整文件名（含扩展名）
            file_names = [os.path.basename(f) for f in md_files]
            # 按名称排序
            file_names.sort()
            
            # 更新下拉列表
            self.file_combobox['values'] = file_names
            
            # 如果有文件，默认选择第一个
            if file_names:
                self.file_combobox.set(file_names[0])
            else:
                self.file_combobox.set("")
                
            # 显示扫描结果
            status = f"找到 {len(file_names)} 个.md文件"
            if hasattr(self, 'status_label'):
                self.status_label.config(text=status)
            else:
                print(status)
                
        except Exception as e:
            messagebox.showerror("错误", f"扫描.md文件失败：{str(e)}")
    
    def load_manifest(self):
        """加载manifest.json文件"""
        try:
            if os.path.exists(self.manifest_path):
                with open(self.manifest_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                if "posts" in data:
                    self.posts = data["posts"]
                    self.update_post_list()
                    self.status_label.config(text=f"已加载 manifest.json，共 {len(self.posts)} 个帖子")
                else:
                    self.status_label.config(text="manifest.json 中缺少 'posts' 字段")
            else:
                self.status_label.config(text="未找到 manifest.json 文件，将创建新文件")
                
        except json.JSONDecodeError as e:
            messagebox.showerror("错误", f"manifest.json 解析失败：{str(e)}")
            self.status_label.config(text="manifest.json 解析失败")
        except Exception as e:
            messagebox.showerror("错误", f"加载 manifest.json 失败：{str(e)}")
            self.status_label.config(text="加载 manifest.json 失败")
    
    def create_button_area(self, parent):
        """
        创建按钮区域，包含添加/更新帖子、清空表单和删除当前帖子三个功能按钮
        
        参数:
            parent: 父级容器，用于放置按钮区域
        """
        button_frame = ttk.Frame(parent)  # 创建一个Frame容器用于放置按钮
        button_frame.grid(row=4, column=0, columnspan=2, pady=10)  # 使用grid布局管理器设置Frame的位置和间距
        
        # 创建三个功能按钮并添加到Frame中
        # 添加/更新帖子按钮：点击时调用add_or_update_post方法
        ttk.Button(button_frame, text="添加/更新帖子", command=self.add_or_update_post).pack(side=tk.LEFT, padx=5)
        # 清空表单按钮：点击时调用clear_form方法
        ttk.Button(button_frame, text="清空表单", command=self.clear_form).pack(side=tk.LEFT, padx=5)
        # 删除当前帖子按钮：点击时调用delete_current_post方法
        ttk.Button(button_frame, text="删除当前帖子", command=self.delete_current_post).pack(side=tk.LEFT, padx=5)
        
    def create_post_list_area(self, parent):
        """
        创建帖子列表区域
        参数:
            parent: 父容器，用于放置帖子列表区域
        """
        # 帖子列表框架
        list_frame = ttk.LabelFrame(parent, text="帖子列表", padding="10")
        list_frame.grid(row=5, column=0, columnspan=2, sticky=(tk.W, tk.E, tk.N, tk.S), pady=(0, 10))
        
        # 创建Treeview组件，用于显示帖子列表
        columns = ("#", "文件名", "标题", "分类", "标签", "摘要")
        self.post_tree = ttk.Treeview(list_frame, columns=columns, show="headings", height=8)
        
        # 设置列
        self.post_tree.heading("#", text="#")
        self.post_tree.heading("文件名", text="文件名")
        self.post_tree.heading("标题", text="标题")
        self.post_tree.heading("分类", text="分类")
        self.post_tree.heading("标签", text="标签")
        self.post_tree.heading("摘要", text="摘要")
        
        self.post_tree.column("#", width=40)
        self.post_tree.column("文件名", width=120)
        self.post_tree.column("标题", width=150)
        self.post_tree.column("分类", width=80)
        self.post_tree.column("标签", width=130)
        self.post_tree.column("摘要", width=180)
        
        # 滚动条
        scrollbar = ttk.Scrollbar(list_frame, orient="vertical", command=self.post_tree.yview)
        self.post_tree.configure(yscrollcommand=scrollbar.set)
        
        self.post_tree.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        scrollbar.grid(row=0, column=1, sticky=(tk.N, tk.S))
        
        # 绑定选择事件
        self.post_tree.bind('<<TreeviewSelect>>', self.on_post_select)
        
    def create_bottom_buttons(self, parent):
        bottom_frame = ttk.Frame(parent)
        bottom_frame.grid(row=6, column=0, columnspan=2, pady=10)
        
        ttk.Button(bottom_frame, text="保存到 manifest.json", command=self.save_manifest).pack(side=tk.LEFT, padx=5)
        ttk.Button(bottom_frame, text="清空所有帖子", command=self.clear_all_posts).pack(side=tk.LEFT, padx=5)
        
        # 状态标签
        self.status_label = ttk.Label(bottom_frame, text="就绪", foreground="gray")
        self.status_label.pack(side=tk.RIGHT, padx=10)
        
    def set_current_time(self):
        """
        设置当前时间到时间输入框中
        该方法会清除输入框中原有内容，然后插入当前系统时间
        """
        # 删除时间输入框中的所有内容（从第0个字符到末尾）
        self.time_entry.delete(0, tk.END)
        # 获取当前系统时间并按"年-月-日 时:分:秒"格式化后插入到输入框的开头位置
        self.time_entry.insert(0, datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
        
    def get_post_data(self):
        """从表单获取帖子数据"""
        return {
            "file": self.file_var.get().strip(),
            "title": self.title_entry.get().strip(),
            "date": self.time_entry.get().strip(),
            "cat": self.cat_var.get(),
            "catLabel": self.cat_label_entry.get().strip(),
            "tags": [tag.strip() for tag in self.tags_entry.get().split(",") if tag.strip()],
            "excerpt": self.excerpt_entry.get().strip(),
            "featured": self.featured_var.get()
        }
    
    def add_or_update_post(self):
        """添加或更新帖子"""
        post_data = self.get_post_data()
        
        # 验证必要字段
        if not post_data["file"] or not post_data["title"]:
            messagebox.showwarning("警告", "文件名和标题不能为空！")
            return
        
        if self.current_post_index >= 0:
            # 更新现有帖子
            self.posts[self.current_post_index] = post_data
            self.current_post_index = -1
            messagebox.showinfo("成功", "帖子已更新！")
        else:
            # 添加新帖子到开头
            self.posts.insert(0, post_data)  # 使用insert(0, ...)在开头插入
            messagebox.showinfo("成功", "帖子已添加！")
        
        self.update_post_list()
        self.clear_form()
        
    def delete_current_post(self):
        """删除当前选中的帖子"""
        selected = self.post_tree.selection()
        if not selected:
            messagebox.showwarning("警告", "请先选择要删除的帖子！")
            return
        
        if messagebox.askyesno("确认", "确定要删除选中的帖子吗？"):
            index = int(self.post_tree.item(selected[0])['values'][0]) - 1
            del self.posts[index]
            self.update_post_list()
            self.clear_form()
            self.current_post_index = -1
            messagebox.showinfo("成功", "帖子已删除！")
        
    def on_post_select(self, event):
        """选择帖子时加载到表单"""
        selected = self.post_tree.selection()
        if not selected:
            return
        
        index = int(self.post_tree.item(selected[0])['values'][0]) - 1
        if 0 <= index < len(self.posts):
            self.current_post_index = index
            post = self.posts[index]
            
            # 填充表单
            self.file_var.set(post.get("file", ""))
            
            self.title_entry.delete(0, tk.END)
            self.title_entry.insert(0, post.get("title", ""))
            
            self.time_entry.delete(0, tk.END)
            self.time_entry.insert(0, post.get("date", datetime.now().strftime("%Y-%m-%d %H:%M:%S")))
            
            self.cat_var.set(post.get("cat", "dev"))
            
            self.cat_label_entry.delete(0, tk.END)
            self.cat_label_entry.insert(0, post.get("catLabel", ""))
            
            self.tags_entry.delete(0, tk.END)
            self.tags_entry.insert(0, ", ".join(post.get("tags", [])))
            
            self.excerpt_entry.delete(0, tk.END)
            self.excerpt_entry.insert(0, post.get("excerpt", ""))
            
            self.featured_var.set(post.get("featured", False))
    
    def clear_form(self):
        """清空表单"""
        # 不清空文件名选择，保留当前选择
        # self.file_var.set("")  # 注释掉，保留文件名
        
        self.title_entry.delete(0, tk.END)
        self.time_entry.delete(0, tk.END)
        self.time_entry.insert(0, datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
        self.cat_var.set("dev")
        self.cat_label_entry.delete(0, tk.END)
        self.tags_entry.delete(0, tk.END)
        self.excerpt_entry.delete(0, tk.END)
        self.featured_var.set(False)
        self.current_post_index = -1
        self.post_tree.selection_remove(self.post_tree.selection())
        
    def update_post_list(self):
        """更新帖子列表显示"""
        # 清空列表
        for item in self.post_tree.get_children():
            self.post_tree.delete(item)
        
        # 重新填充
        # 分类映射用于显示
        cat_display = {
            "dev": "开发",
            "game": "游戏",
            "lore": "考据",
            "other": "其他"
        }
        
        for i, post in enumerate(self.posts, 1):
            tags_str = ", ".join(post.get("tags", []))[:30] + ("..." if len(", ".join(post.get("tags", []))) > 30 else "")
            # 获取分类显示名称
            cat_value = post.get("cat", "")
            cat_display_name = cat_display.get(cat_value, cat_value)
            
            self.post_tree.insert("", "end", values=(
                i,
                post.get("file", ""),
                post.get("title", ""),
                cat_display_name,
                tags_str,
                post.get("excerpt", "")[:30] + ("..." if len(post.get("excerpt", "")) > 30 else "")
            ))
        
        # 更新状态
        if hasattr(self, 'status_label'):
            self.status_label.config(text=f"共 {len(self.posts)} 个帖子")
    
    def clear_all_posts(self):
        """清空所有帖子"""
        if not self.posts:
            return
            
        if messagebox.askyesno("确认", "确定要清空所有帖子吗？"):
            self.posts.clear()
            self.update_post_list()
            self.clear_form()
            messagebox.showinfo("成功", "所有帖子已清空！")
    
    def save_manifest(self):
        """保存到manifest.json文件"""
        try:
            json_data = {
                "title": "日志",
                "subtitle": "Lictober7th://LOG",
                "posts": self.posts
            }
            
            with open(self.manifest_path, 'w', encoding='utf-8') as f:
                json.dump(json_data, f, ensure_ascii=False, indent=2)
            
            self.status_label.config(text=f"已保存到 manifest.json，共 {len(self.posts)} 个帖子")
            messagebox.showinfo("成功", f"数据已保存到：\n{self.manifest_path}")
                
        except Exception as e:
            messagebox.showerror("错误", f"保存失败：{str(e)}")

def main():
    root = tk.Tk()
    app = LogGenerator(root)
    root.mainloop()

if __name__ == "__main__":
    main()