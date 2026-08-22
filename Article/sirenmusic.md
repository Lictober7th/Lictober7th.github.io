# monster-siren
# -Minecraftjavamod-
一个将 Monster Siren Records 的音乐和网页内容带入游戏的 Minecraft 模组，支持本地音乐播放、自定义链接，还有漂亮的无边框界面。A Minecraft mod that brings Monster Siren Records' music and web content into the game, with support for local music playback, custom links, and a beautiful borderless UI.

[2026.8.12-20：19]追加：收藏添加页面的输入框长度限制没取消，可在[版本文件夹]/sirenmusic/information/favourite.json直接修改。

#----------中文----------

#支持版本:
Minecraft-JavaEdition-26.1.2-Fabric

#前置模组:
mcef-morden
(截止到2026/08/12我只找到这一个可供我在26.1.2Fabric使用的API)

#主要功能:
1.塞壬唱片
2.本地音乐播放器
3.简易浏览器

#简易浏览器:
1.历史记录
2.收藏
3.http/https/file三种协议

#设置:
1.原版bgm行为管理
2.独立UI缩放控制
3.网页缩放
4.模组播放行为管理
5.独立语言切换

#已发现的问题:
1.原版音乐不全
2.当你在自定义链接中用file协议打开本地的音乐文件且设置中"关闭UI时关闭音乐"为关闭状态时,反复打开UI会播放多个音乐叠加在一起。可通过”强制终止键“终止。发生情况少见,不打算修
3.浏览器中无法使用Del,Backspace,Enter等非ACII键,这是MCEF-Morden的问题。
4.浏览器打开诸如Bilibili,Bing等网站无法点击视频,搜索结果。原因推测为MCEF-Morden不支持在新标签页中打开,因为它就是渲染框架而非完整的浏览器。

#目标:
压缩代码
修完bug

#注释:
本模组由DeepSeek-V4-Pro辅助开发。
大胖蓝鲸鱼吃了我447,278,136Tokens和72h的时间。
之后我会转向其他项目,所以下个版本估计没有了,维护也没有。
你如果觉得这玩意四不像,那是因为这是即兴模组。

#作者:
Lictober7th

#联系:
lictober7th@qq.com

#----------English (machine translation)----------

#Supported Versions:
Minecraft-JavaEdition-26.1.2-Fabric

#Required Mod:
mcef-morden
(As of 2026/08/12, this is the only API I found that can be used with 26.1.2 Fabric)

#Main Features:
1. Siren Records
2. Local Music Player
3. Simple Browser

#Simple Browser:
1. History
2. Favorites
3. Support for http/https/file protocols

#Settings:
1. Manage vanilla BGM behavior
2. Independent UI scaling control
3. Web page zoom
4. Mod playback behavior management
5. Independent language switching

#Known Issues:
1. Vanilla music is incomplete
2. When opening local music files using the file protocol in custom links and the "Close music when UI is closed" setting is off, repeatedly opening the UI will play multiple overlapping tracks. This can be stopped using the "Force Stop Key." This issue is rare and will not be fixed.
3. Non-ASCII keys like Del, Backspace, and Enter cannot be used in the browser. This is a problem with MCEF-Morden.
4. Websites like Bilibili and Bing cannot be interacted with in the browser, such as clicking videos or search results. This is likely because MCEF-Morden does not support opening in new tabs, as it is a rendering framework rather than a full browser.

#Goals:
- Optimize code
- Fix bugs

#Notes:
This mod was co-developed with the assistance of DeepSeek-V4-Pro.
The large blue whale consumed 447,278,136 tokens and 72 hours of time.
I will move on to other projects afterward, so there likely won’t be a next version, and maintenance will not continue.
If you feel this mod is a bit odd, it’s because it is an improvisational mod.

#Author:
Lictober7th

#Contact:
lictober7th@qq.com
