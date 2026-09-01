//以下注释由GLM5.1生成，非人工编写，可能存在不准确或不完整的情况，请谨慎参考。
//====================全局状态====================
var current = 0;
var total = 4;
var animating = false;

//====================LOADING====================
(function () {
    var pct = document.querySelector('#loader .pct');
    var n = 0;
    var t = setInterval(function () {
        n += Math.floor(Math.random() * 12) + 5;
        if (n >= 100) { n = 100; clearInterval(t); setTimeout(function () { document.getElementById('loader').classList.add('done'); }, 350); }
        pct.innerHTML = n + '<em>%</em>';
    }, 110);
})();

//主题切换
(function () {
    var btn = document.getElementById('themeBtn');
    var moon = btn.querySelector('.icon-moon');
    var sun = btn.querySelector('.icon-sun');
    function apply(t) {
        document.documentElement.setAttribute('data-theme', t);
        moon.style.display = t === 'dark' ? '' : 'none';
        sun.style.display = t === 'light' ? '' : 'none';
        try { localStorage.setItem('orig-log-theme', t); } catch (e) { }
    }
    var saved = 'dark';
    try { saved = localStorage.getItem('orig-log-theme') || 'dark'; } catch (e) { }
    apply(saved);
    btn.addEventListener('click', function () {
        var cur = document.documentElement.getAttribute('data-theme');
        apply(cur === 'dark' ? 'light' : 'dark');
    });
})();

//====================背景音乐====================
(function () {
    var audio = new Audio('./file/audio/background-music.mp3');
    audio.loop = true;
    audio.volume = 0.5;

    var btn = document.getElementById('musicBtn');
    if (!btn) return;
    var on = btn.querySelector('.icon-music');
    var off = btn.querySelector('.icon-music-off');
    var playing = false;

    function setState(p) {
        playing = p;
        if (on) on.style.display = p ? 'none' : '';
        if (off) off.style.display = p ? '' : 'none';
    }

    function play() {
        var pr = audio.play();
        if (pr && typeof pr.then === 'function') {
            pr.then(function () {
                setState(true);
            }).catch(function () {
                setState(false);
            });
        } else {
            setState(true);
        }
    }

    setState(false);
    play();

    //创建隐藏遮罩
    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;opacity:0;pointer-events:auto;';
    document.body.appendChild(overlay);

    var hasInteracted = false;
    function onFirstInteraction() {
        if (hasInteracted) return;
        hasInteracted = true;
        if (!playing) { play(); }
        overlay.remove();
        window.removeEventListener('keydown', onFirstInteraction);
        window.removeEventListener('wheel', onFirstInteraction);
    }
    overlay.addEventListener('click', onFirstInteraction);
    window.addEventListener('keydown', onFirstInteraction);
    window.addEventListener('wheel', onFirstInteraction);

    btn.addEventListener('click', function (e) {
        e.stopPropagation();
        if (playing) { audio.pause(); setState(false); }
        else { play(); }
    });

    audio.addEventListener('play', function () { setState(true); });
    audio.addEventListener('pause', function () { setState(false); });
})();

//====================整屏滚动====================
var pages = document.getElementById('pages');
var dots = document.querySelectorAll('#dots .dot');
var pageind = document.getElementById('curPage');
var nav = document.getElementById('nav');

//====================多方向错落进入动画====================
var staggerDirs = ['sl', 'su', 'sr', 'ss', 'sd'];

//为带有'stagger'类的元素添加动画效果，每个元素有不同的动画方向和延迟时间
//@param {Element} sec - 包含需要动画元素的父元素
function animateStagger(sec) {
    // 如果没有传入sec参数，则直接返回
    if (!sec) return;
    // 获取所有带有'stagger'类的元素，并为每个元素设置动画
    sec.querySelectorAll('.stagger').forEach(function (el, idx) {
        // 移除所有可能的动画方向类
        staggerDirs.forEach(function (d) { el.classList.remove(d); });
        // 根据索引添加对应的动画方向类
        el.classList.add(staggerDirs[idx % staggerDirs.length]);
        // 设置每个元素的动画延迟时间，基于索引乘以0.07秒
        el.style.transitionDelay = (idx * 0.07) + 's';
        // 移除'in'类，然后强制重绘，再添加'in'类以触发动画
        el.classList.remove('in');
        void el.offsetWidth; // 触发重绘
        el.classList.add('in');
    });
}

//====================页面导航=========
//页面导航函数，用于控制页面切换和动画效果
//@param {number} i - 要跳转到的页面索引
//@param {boolean} immediate - 是否立即切换，不使用过渡动画
function goTo(i, immediate) {
    // 检查目标索引是否有效，或者是否正在动画中且不是立即切换
    if (i < 0 || i >= total || (animating && !immediate)) return;
    // 如果目标索引与当前索引相同且不是立即切换，则直接返回
    if (i === current && !immediate) return;
    // 设置动画状态为true，更新当前页面索引
    animating = true;
    current = i;

    // 处理所有页面的位置和过渡效果
    document.querySelectorAll('.page').forEach(function (p) {
        // 获取页面的索引值
        var pi = parseInt(p.getAttribute('data-i'), 10);
        // 如果页面索引小于目标索引，添加left类
        if (pi < i) {
            p.classList.add('left');
        } else {
            p.classList.remove('left');
        }
        // 如果是立即切换，禁用过渡效果
        if (immediate) {
            p.style.transition = 'none';
            // 触发重排以应用样式变化
            void p.offsetWidth;
            p.style.transition = '';
        }
    });

    //页间过渡序号（简洁大气）
    if (!immediate) {
        var tn = document.getElementById('transNum');
        if (tn) { tn.textContent = '0' + (i + 1); }
        var tt = document.getElementById('transition');
        if (tt) { tt.classList.remove('show'); void tt.offsetWidth; tt.classList.add('show'); }
    }
    //更新导航点 + 顶栏菜单高亮 + 页码
    dots.forEach(function (d, idx) { d.classList.toggle('active', idx === i); });
    document.querySelectorAll('nav.menu a').forEach(function (a) {
        a.classList.toggle('active', parseInt(a.getAttribute('data-goto'), 10) === i);
    });
    pageind.textContent = (i + 1 < 10 ? '0' + (i + 1) : i + 1) + ' / 04';
    //触发当前页 stagger 动画
    setTimeout(function () {
        animateStagger(document.querySelector('.page[data-i="' + i + '"]'));
        animating = false;
    }, immediate ? 0 : 950);
}

//初始化：先给首页加动画
setTimeout(function () {
    animateStagger(document.querySelector('.page[data-i="0"]'));
}, 600);

//====================页面交互映射=========
//滚轮（纵向滚轮 + 触控板横向滑动都映射为翻页）
var wheelLock = false;
window.addEventListener('wheel', function (e) {
    if (document.getElementById('reader').classList.contains('open')) return;
    if (wheelLock) return;
    var d = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    if (Math.abs(d) < 20) return;
    //当前页内容可滚动时，优先滚动内容，滚到底/顶才翻页
    var pageEl = document.querySelector('.page[data-i="' + current + '"]');
    if (pageEl && pageEl.scrollHeight > pageEl.clientHeight + 1) {
        var atTop = pageEl.scrollTop <= 1;
        var atBottom = pageEl.scrollTop + pageEl.clientHeight >= pageEl.scrollHeight - 1;
        if ((d > 0 && !atBottom) || (d < 0 && !atTop)) {
            return;
        }
    }
    wheelLock = true;
    setTimeout(function () { wheelLock = false; }, 1250);
    if (d > 0) goTo(current + 1); else goTo(current - 1);
}, { passive: true });

//触摸（左右滑动翻页）
var touchX = 0, touchY = 0;
window.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; touchY = e.touches[0].clientY; }, { passive: true });
window.addEventListener('touchend', function (e) {
    if (document.getElementById('reader').classList.contains('open')) return;
    var dx = touchX - e.changedTouches[0].clientX;
    var dy = touchY - e.changedTouches[0].clientY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) { if (dx > 0) goTo(current + 1); else goTo(current - 1); }
}, { passive: true });

//键盘
window.addEventListener('keydown', function (e) {
    if (document.getElementById('reader').classList.contains('open')) {
        if (e.key === 'Escape') closeReader();
        return;
    }
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); goTo(current + 1); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') { e.preventDefault(); goTo(current - 1); }
});

//====================导航点/按钮/菜单项跳转====================
//导航点/按钮/菜单项跳转
document.querySelectorAll('[data-goto]').forEach(function (el) {
    el.addEventListener('click', function (e) {
        e.preventDefault();
        var i = parseInt(el.getAttribute('data-goto'), 10);
        goTo(i);
    });
});

//顶部导航随滚动高亮（无需滚动位置，用 current）
function refreshNav() { nav.classList.toggle('scrolled', current > 0); }
var origGoTo = goTo;
goTo = function (i, immediate) {
    origGoTo(i, immediate);
    refreshNav();
};

//====================Markdown解析器====================
//对HTML特殊字符进行转义，防止XSS攻击
//@param {string} s - 需要转义的原始字符串
//@returns {string} 转义后的安全字符串
function escapeHtml(s) {
    // 将 & 符号转义为 &amp;
    // 将 < 符号转义为 &lt;
    // 将 > 符号转义为 &gt;
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

//渲染行内文本，将Markdown风格的文本转换为HTML格式
//@param {string} text - 需要渲染的文本内容
//@returns {string} 渲染后的HTML文本
function renderInline(text) {
    //行内代码（最先处理并保护，避免内部被解析）
    var codeSpans = [];
    text = text.replace(/`([^`]+)`/g, function (_, c) {
        codeSpans.push('<code>' + escapeHtml(c) + '</code>');
        return '\x00' + (codeSpans.length - 1) + '\x00';
    });

    //自动链接 <url> 和 <email>
    text = text.replace(/<([a-z][a-z0-9+.-]*:[^>]+)>/gi, '<a href="$1" target="_blank" rel="noopener">$1</a>');
    text = text.replace(/<([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})>/gi, '<a href="mailto:$1">$1</a>');

    //图片（必须在链接之前）
    text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1"/>');
    //链接
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    //粗体
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    //斜体
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    //删除线
    text = text.replace(/~~([^~]+)~~/g, '<del>$1</del>');
    //高亮
    text = text.replace(/==([^=]+)==/g, '<mark>$1</mark>');
    //下标
    text = text.replace(/~([^~]+)~/g, '<sub>$1</sub>');
    //上标
    text = text.replace(/\^([^\^]+)\^/g, '<sup>$1</sup>');

    //恢复行内代码
    text = text.replace(/\x00(\d+)\x00/g, function (_, i) { return codeSpans[+i]; });
    return text;
}

function mdToHtml(md) {
    var lines = md.split(/\r?\n/);
    var html = '';
    var inCode = false, codeBuf = [], codeLang = '';
    var listStack = []; //支持嵌套列表 [{type:'ul', indent:0}, ...]
    var i = 0;

    //关闭所有缩进级别大于等于指定值的列表
    //@param {number} toIndent - 需要关闭的列表的缩进级别
    function closeLists(toIndent) {
        // 当列表栈不为空且栈顶列表的缩进大于等于指定值时
        while (listStack.length > 0 && listStack[listStack.length - 1].indent >= toIndent) {
            // 从栈中弹出最后一个列表
            var lst = listStack.pop();
            // 根据列表类型添加相应的闭合标签，并换行
            html += (lst.type === 'ul' ? '</ul>' : '</ol>') + '\n';
        }
    }
    //关闭所有未闭合的列表标签
    //该函数会遍历列表栈(listStack)，依次关闭所有打开的列表
    //根据列表类型(ul/ol)生成对应的结束标签
    function closeAllLists() {
        // 当列表栈不为空时，持续循环处理
        while (listStack.length > 0) {
            // 从栈顶取出一个列表项
            var lst = listStack.pop();
            // 根据列表类型添加对应的结束标签，并换行
            html += (lst.type === 'ul' ? '</ul>' : '</ol>') + '\n';
        }
    }
    //获取当前列表的缩进级别
    //@returns {number} 返回当前列表的缩进级别，如果没有列表则返回-1
    function currentListIndent() {
        // 如果listStack数组不为空，返回最后一个元素的indent属性值
        // 如果listStack数组为空，返回-1表示没有列表
        return listStack.length ? listStack[listStack.length - 1].indent : -1;
    }

    while (i < lines.length) {
        var line = lines[i];
        var trimmed = line.trim();

        //代码块
        if (/^```/.test(trimmed)) {
            closeAllLists();
            if (inCode) {
                html += '<pre><code' + (codeLang ? ' class="language-' + escapeHtml(codeLang) + '"' : '') + '>' +
                    escapeHtml(codeBuf.join('\n')) + '</code></pre>\n';
                codeBuf = []; inCode = false; codeLang = '';
            } else {
                inCode = true; codeLang = trimmed.slice(3).trim();
            }
            i++; continue;
        }
        if (inCode) { codeBuf.push(line); i++; continue; }

        //空行
        if (trimmed === '') { closeAllLists(); i++; continue; }

        //Setext 风格标题
        if (i + 1 < lines.length && !/^\s*$/.test(trimmed) &&
            !/^(#{1,6}\s|>|\s*[-*+]|\s*\d+\.|```)/.test(trimmed)) {
            var nextTrim = lines[i + 1].trim();
            if (/^=+$/.test(nextTrim)) {
                closeAllLists();
                html += '<h1>' + renderInline(trimmed) + '</h1>\n';
                i += 2; continue;
            }
            if (/^-+$/.test(nextTrim)) {
                closeAllLists();
                html += '<h2>' + renderInline(trimmed) + '</h2>\n';
                i += 2; continue;
            }
        }

        //ATX 标题
        var h = trimmed.match(/^(#{1,6})\s+(.*)/);
        if (h) {
            closeAllLists();
            var lv = h[1].length;
            html += '<h' + lv + '>' + renderInline(h[2]) + '</h' + lv + '>\n';
            i++; continue;
        }

        //分隔线
        if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
            closeAllLists();
            html += '<hr/>\n';
            i++; continue;
        }

        //引用块（支持嵌套解析）
        if (/^>/.test(trimmed)) {
            closeAllLists();
            var quoteLines = [];
            while (i < lines.length && /^>/.test(lines[i].trim())) {
                quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
                i++;
            }
            html += '<blockquote>\n' + mdToHtml(quoteLines.join('\n')) + '</blockquote>\n';
            continue;
        }

        //列表（无序 / 有序 / 任务列表 / 嵌套）
        var listMatch = trimmed.match(/^(\s*)([-*+]|\d+\.)\s+(.*)/);
        if (listMatch) {
            var indent = listMatch[1].length;
            var marker = listMatch[2];
            var content = listMatch[3];
            var isTask = /\[([ xX])\]\s+(.*)/.test(content);
            var taskCheck = '';
            if (isTask) {
                var tm = content.match(/\[([ xX])\]\s+(.*)/);
                var checked = tm[1].toLowerCase() === 'x';
                taskCheck = '<input type="checkbox" disabled' + (checked ? ' checked' : '') + '/> ';
                content = tm[2];
            }

            var type = /^\d+\./.test(marker) ? 'ol' : 'ul';

            //嵌套层级处理
            if (listStack.length === 0 || indent > currentListIndent()) {
                html += (type === 'ul' ? '<ul>' : '<ol>') + '\n';
                listStack.push({ type: type, indent: indent });
            } else if (indent < currentListIndent()) {
                closeLists(indent);
                if (listStack.length === 0 || listStack[listStack.length - 1].type !== type) {
                    html += (type === 'ul' ? '<ul>' : '<ol>') + '\n';
                    listStack.push({ type: type, indent: indent });
                }
            } else if (listStack[listStack.length - 1].type !== type) {
                closeLists(indent);
                html += (type === 'ul' ? '<ul>' : '<ol>') + '\n';
                listStack.push({ type: type, indent: indent });
            }

            //收集列表项的多行内容
            var itemLines = [content];
            i++;
            while (i < lines.length) {
                var nextLine = lines[i];
                var nextTrim = nextLine.trim();
                if (nextTrim === '') break;
                var nextIndent = nextLine.match(/^(\s*)/)[1].length;
                var nextList = nextTrim.match(/^(\s*)([-*+]|\d+\.)\s+/);
                if (nextList && nextList[1].length <= indent) break;
                if (nextIndent > indent || (!nextList && nextTrim !== '')) {
                    itemLines.push(nextLine.replace(new RegExp('^ {' + (indent + 2) + '}'), ''));
                    i++;
                } else {
                    break;
                }
            }

            var itemContent = itemLines.join('\n');
            if (/^(#{1,6}\s|>|```|\s*[-*+]|\s*\d+\.|\|)/m.test(itemContent)) {
                itemContent = mdToHtml(itemContent);
            } else {
                itemContent = renderInline(itemContent);
            }
            html += '<li>' + taskCheck + itemContent + '</li>\n';
            continue;
        }

        //表格（支持对齐语法）
        if (/^\|/.test(trimmed)) {
            closeAllLists();
            var rows = [];
            while (i < lines.length && /^\|/.test(lines[i].trim())) {
                rows.push(lines[i].trim()); i++;
            }
            if (rows.length >= 2) {
                var cells = function (r) {
                    return r.replace(/^\||\|$/g, '').split('|').map(function (c) { return c.trim(); });
                };
                var header = cells(rows[0]);
                var alignRow = cells(rows[1]);
                var aligns = alignRow.map(function (c) {
                    c = c.replace(/\s/g, '');
                    if (/^:.*:$/.test(c)) return 'center';
                    if (/^:.*$/.test(c)) return 'left';
                    if (/^.*:$/.test(c)) return 'right';
                    return '';
                });
                html += '<table><thead><tr>' +
                    header.map(function (c, idx) {
                        var a = aligns[idx] ? ' style="text-align:' + aligns[idx] + '"' : '';
                        return '<th' + a + '>' + renderInline(c) + '</th>';
                    }).join('') +
                    '</tr></thead><tbody>';
                for (var r = 2; r < rows.length; r++) {
                    var cs = cells(rows[r]);
                    html += '<tr>' + cs.map(function (c, idx) {
                        var a = aligns[idx] ? ' style="text-align:' + aligns[idx] + '"' : '';
                        return '<td' + a + '>' + renderInline(c) + '</td>';
                    }).join('') + '</tr>';
                }
                html += '</tbody></table>\n';
            }
            continue;
        }

        //段落（支持硬换行行尾两个空格）
        closeAllLists();
        var paraLines = [trimmed];
        i++;
        while (i < lines.length && lines[i].trim() !== '' &&
            !/^(#{1,6}\s|>|\s*[-*+]|\s*\d+\.|```|\|)/.test(lines[i].trim())) {
            var pl = lines[i];
            var prev = paraLines[paraLines.length - 1];
            if (/  $/.test(prev)) {
                paraLines[paraLines.length - 1] = prev.replace(/  $/, '') + '<br/>';
            }
            paraLines.push(pl.trim());
            i++;
        }
        html += '<p>' + renderInline(paraLines.join(' ')) + '</p>\n';
    }

    closeAllLists();
    if (inCode) {
        html += '<pre><code' + (codeLang ? ' class="language-' + escapeHtml(codeLang) + '"' : '') + '>' +
            escapeHtml(codeBuf.join('\n')) + '</code></pre>\n';
    }
    return html.trim();
}

//====================加载文章====================
var posts = [];
var activeCat = 'all';
var pageSize = 3;
var curPage = 1;

//渲染文章卡片列表
//根据当前分类和页码筛选文章，生成对应的卡片元素并添加到网格中
//同时处理分页信息和卡片动画效果
function renderCards() {
    var grid = document.getElementById('grid');
    //先按分类筛选文章
    var list = posts.filter(function (p) {
        return activeCat === 'all' || p.cat === activeCat;
    });
    // 计算总页数，确保至少为1页
    var totalPages = Math.max(1, Math.ceil(list.length / pageSize));
    // 确保当前页码在有效范围内
    if (curPage > totalPages) curPage = totalPages;
    if (curPage < 1) curPage = 1;
    // 计算当前页的起始索引
    var start = (curPage - 1) * pageSize;
    // 获取当前页的文章列表
    var pageList = list.slice(start, start + pageSize);

    // 清空网格容器
    grid.innerHTML = '';
    // 遍历当前页的文章列表，生成卡片
    pageList.forEach(function (p) {
        var idx = posts.indexOf(p);
        var art = document.createElement('article');
        // 设置卡片基本类名和特色文章类名
        art.className = 'card stagger' + (p.featured ? ' featured' : '');
        if (p.featured) {
            // 如果是特色文章，使用特色文章的HTML模板
            art.innerHTML =
                '<div class="thumb"><span class="glyph">' + (p.tags[0] || 'POST').toUpperCase() + '</span></div>' +
                '<div class="body"><div class="meta"><span class="cat">' + escapeHtml(p.catLabel) + '</span><span class="date">' + escapeHtml(p.date) + '</span></div>' +
                '<h3>' + escapeHtml(p.title) + '</h3><p class="ex">' + escapeHtml(p.excerpt) + '</p>' +
                '<div class="foot"><div class="tags">' + p.tags.map(function (t) { return '<span>' + escapeHtml(t) + '</span>'; }).join('') + '</div><span class="read">READ <span class="arr">→</span></span></div></div>';
        } else {
            // 如果不是特色文章，使用普通文章的HTML模板
            art.innerHTML =
                '<div class="meta"><span class="cat">' + escapeHtml(p.catLabel) + '</span><span class="date">' + escapeHtml(p.date) + '</span></div>' +
                '<h3>' + escapeHtml(p.title) + '</h3><p class="ex">' + escapeHtml(p.excerpt) + '</p>' +
                '<div class="foot"><div class="tags">' + p.tags.map(function (t) { return '<span>' + escapeHtml(t) + '</span>'; }).join('') + '</div><span class="read">READ <span class="arr">→</span></span></div>';
        }
        // 添加点击事件，点击后打开阅读器
        art.addEventListener('click', function () { openReader(idx); });
        // 将生成的卡片添加到网格中
        grid.appendChild(art);
    });

    //更新分页信息显示
    document.getElementById('pgInfo').innerHTML = (curPage < 10 ? '0' + curPage : curPage) + ' / ' + (totalPages < 10 ? '0' + totalPages : totalPages);
    // 设置上一页按钮状态
    document.getElementById('pgPrev').disabled = curPage <= 1;
    // 设置下一页按钮状态
    document.getElementById('pgNext').disabled = curPage >= totalPages;

    //卡片错落进入动画
    grid.querySelectorAll('.card').forEach(function (el, i) {
        // 移除所有方向类
        staggerDirs.forEach(function (d) { el.classList.remove(d); });
        // 添加当前卡片的方向类
        el.classList.add(staggerDirs[i % staggerDirs.length]);
        // 设置动画延迟
        el.style.transitionDelay = (i * 0.08) + 's';
        // 触发重排以应用动画
        void el.offsetWidth;
        // 添加进入动画类
        el.classList.add('in');
    });
}
//打开阅读器并加载文章内容
//@param {number} idx - 文章索引，用于从posts数组中获取对应文章
function openReader(idx) {
    // 根据索引获取文章对象
    var p = posts[idx];
    // 如果文章不存在则直接返回
    if (!p) return;
    // 设置阅读器元信息，包括分类标签和日期
    document.getElementById('readerMeta').innerHTML =
        '<span class="cat">' + escapeHtml(p.catLabel) + '</span><span class="date">' + escapeHtml(p.date) + '</span>';
    // 设置文章标题
    document.getElementById('readerTitle').textContent = p.title;
    // 获取文章内容容器
    var body = document.getElementById('readerBody');
    var open = function () { document.getElementById('reader').classList.add('open'); document.getElementById('reader').scrollTop = 0; };
    body.innerHTML = '<p style="color:var(--text-faint)">加载中…</p>';
    fetch('Article/' + p.file).then(function (r) { if (!r.ok) throw 0; return r.text(); }).then(function (md) {
        body.innerHTML = mdToHtml(md);
    }).catch(function () {
        body.innerHTML = '<blockquote>无法加载文章内容：' + escapeHtml(p.file) + '。<br>请通过本地 HTTP 服务器打开本页面（如 VS Code Live Server 或 python -m http.server）。</blockquote>';
    });
    open();
}
function closeReader() { document.getElementById('reader').classList.remove('open'); }
document.getElementById('readerBack').addEventListener('click', closeReader);

//Tab 切换
document.querySelectorAll('.tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
        document.querySelectorAll('.tab').forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        activeCat = tab.getAttribute('data-cat');
        curPage = 1;
        renderCards();
    });
});

//分页翻页
document.getElementById('pgPrev').addEventListener('click', function () {
    if (curPage > 1) { curPage--; renderCards(); }
});
document.getElementById('pgNext').addEventListener('click', function () {
    var list = posts.filter(function (p) { return activeCat === 'all' || p.cat === activeCat; });
    var totalPages = Math.max(1, Math.ceil(list.length / pageSize));
    if (curPage < totalPages) { curPage++; renderCards(); }
});

//加载文章数据
(function initPosts() {
    fetch('article/manifest.json').then(function (r) { return r.json(); }).then(function (data) {
        posts = data.posts || [];
        renderCards();
    }).catch(function () {
        document.getElementById('grid').innerHTML =
            '<div class="card" style="grid-column:1/-1;padding:30px">' +
            '<div class="meta"><span class="cat">提示</span></div><h3>无法读取文章数据</h3>' +
            '<p class="ex">请通过 HTTP 服务器打开本页面（如 VS Code Live Server 或 python -m http.server）。</p></div>';
    });
})();

//====================动态光标====================
(function () {
    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    let dotX = mouseX, dotY = mouseY;
    let ringX = mouseX, ringY = mouseY;

    let isHovering = false; // 新增状态

    // --- 悬停检测 ---
    document.addEventListener('mouseover', (e) => {
        const target = e.target.closest('a, button, [role="button"], input[type="submit"], .clickable');
        if (target) {
            isHovering = true;
            ring.classList.add('hover');
        }
    });

    document.addEventListener('mouseout', (e) => {
        const target = e.target.closest('a, button, [role="button"], input[type="submit"], .clickable');
        if (target) {
            isHovering = false;
            ring.classList.remove('hover');
        }
    });

    // --- 鼠标移动 ---
    document.addEventListener('mousemove', e => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animate() {
        // 圆点：即时跟随
        dotX += (mouseX - dotX) * 0.85;
        dotY += (mouseY - dotY) * 0.85;
        dot.style.transform = `translate(${dotX}px, ${dotY}px) translate(-50%, -50%)`;

        // 圆环：根据悬停状态使用不同 lerp 系数
        const ringLerp = isHovering ? 0.25 : 0.08;   // 悬停时降低延迟
        ringX += (mouseX - ringX) * ringLerp;
        ringY += (mouseY - ringY) * ringLerp;
        ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;

        requestAnimationFrame(animate);
    }
    animate();
})();

//====================终端====================
(function () {
    const getElementById = id => document.getElementById(id);
    const terminalWindow = getElementById('terminalWindow'),
        terminalOutput = getElementById('terminalOutput'),
        blackOverlay = getElementById('LOGTM'),
        maximizeButton = getElementById('maximizeButton'),
        titleBar = getElementById('titleBar'),
        taskbar = getElementById('taskbar'),
        resizeCorner = getElementById('resizeCorner'),
        resizeRightEdge = getElementById('resizeRightEdge'),
        resizeBottomEdge = getElementById('resizeBottomEdge');

    const terminalLog = [];
    let flowState = 'idle',
        flowTimer = null,
        animationTimer = null,
        savedRect = null,
        isFullscreen = false,
        currentInputLine = null,
        currentUser = null;

    const PROMPT_TEXT = 'LOG:\\>';
    const DEFAULT_USERS = [{ username: 'admin', key: 'admin' }];
    let userData = DEFAULT_USERS;
    const DEFAULT_SETTINGS = { version: '未获取到', 'terminal-statement': '初始数据获取失败\n键入 \'help\' 查看可用命令\n------------' };
    let settingsData = DEFAULT_SETTINGS;

    (async () => {
        try {
            const response = await fetch('./file/userdata.json', { headers: { 'Cache-Control': 'no-cache' } });
            if (response.ok) { const data = await response.json(); if (Array.isArray(data.users)) userData = data.users; }
        } catch (error) { }
        try {
            const response = await fetch('./file/setting.json', { headers: { 'Cache-Control': 'no-cache' } });
            if (response.ok) { const data = await response.json(); if (data && typeof data === 'object') settingsData = { ...DEFAULT_SETTINGS, ...data }; }
        } catch (error) { }
    })();

    const formatTimestamp = (date = new Date()) => {
        const pad = n => String(n).padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${String(date.getMilliseconds()).padStart(3, '0')}`;
    };

    const moveInputLineToEnd = () => { if (currentInputLine && terminalOutput.lastElementChild !== currentInputLine) terminalOutput.appendChild(currentInputLine); };

    const addLine = (text, type = 'system-message', record = true) => {
        const div = document.createElement('div');
        div.className = type;
        div.textContent = text;
        terminalOutput.appendChild(div);
        moveInputLineToEnd();
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
        if (record) terminalLog.push({ time: new Date(), text, type });
    };

    const addInputEcho = (text) => {
        const div = document.createElement('div');
        div.className = 'input-echo';
        div.textContent = PROMPT_TEXT + ' ' + text;
        terminalOutput.appendChild(div);
        moveInputLineToEnd();
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
        terminalLog.push({ time: new Date(), text: PROMPT_TEXT + ' ' + text, type: 'input-echo' });
    };

    const createInputLine = (placeholder = '键入命令...') => {
        const line = document.createElement('div');
        line.className = 'input-line';
        const promptSpan = document.createElement('span');
        promptSpan.className = 'terminal-prompt';
        promptSpan.textContent = PROMPT_TEXT;
        const input = document.createElement('input');
        input.type = 'text';
        input.autocomplete = 'off';
        input.spellcheck = false;
        input.placeholder = placeholder;
        input.disabled = !['idle', 'prompt_user', 'prompt_key'].includes(flowState);
        line.appendChild(promptSpan);
        line.appendChild(input);
        terminalOutput.appendChild(line);
        currentInputLine = line;
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
        if (!input.disabled) input.focus();
        input.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter') return;
            const value = input.value.trim();
            if (!value) return;
            const echoDiv = document.createElement('div');
            echoDiv.className = 'input-echo';
            echoDiv.textContent = PROMPT_TEXT + ' ' + value;
            line.replaceWith(echoDiv);
            currentInputLine = null;
            terminalLog.push({ time: new Date(), text: PROMPT_TEXT + ' ' + value, type: 'input-echo' });
            terminalOutput.scrollTop = terminalOutput.scrollHeight;
            processInput(value);
            if (flowState === 'idle') createInputLine('键入命令...');
            else if (flowState === 'prompt_user') createInputLine('键入用户名...');
            else if (flowState === 'prompt_key') createInputLine('键入密钥...');
            else createInputLine('LOG™运行中...');
        });
        return line;
    };

    const processInput = (value) => {
        if (flowState === 'prompt_user') handleUserName(value);
        else if (flowState === 'prompt_key') handleKey(value);
        else if (flowState === 'idle') handleCommand(value);
    };

    const clearAnimationTimer = () => { if (animationTimer) { clearInterval(animationTimer); animationTimer = null; } };

    const resetFlow = () => {
        clearAnimationTimer();
        if (flowTimer) { clearTimeout(flowTimer); flowTimer = null; }
        flowState = 'idle';
        currentUser = null;
        if (currentInputLine) {
            const input = currentInputLine.querySelector('input');
            if (input) { input.placeholder = '键入命令...'; input.disabled = false; input.focus(); }
        }
    };

    const closeTerminal = (animated = true) => {
        resetFlow();
        if (!animated) { terminalWindow.classList.remove('active'); return; }
        terminalWindow.classList.add('no-transition');
        void terminalWindow.offsetWidth;
        terminalWindow.classList.remove('no-transition');
        terminalWindow.classList.remove('active');
    };

    const minimizeTerminal = () => {
        if (isFullscreen) {
            terminalWindow.classList.remove('fullscreen');
            isFullscreen = false;
            maximizeButton.textContent = '▢';
            if (savedRect) { terminalWindow.style.left = savedRect.left; terminalWindow.style.top = savedRect.top; terminalWindow.style.width = savedRect.width; terminalWindow.style.height = savedRect.height; }
        }
        terminalWindow.classList.remove('active');
        taskbar.classList.add('active');
    };

    const restoreFromTaskbar = () => {
        taskbar.classList.remove('active');
        terminalWindow.classList.add('active');
        if (isFullscreen) { terminalWindow.classList.add('fullscreen'); maximizeButton.textContent = '❐'; }
        if (currentInputLine) { const input = currentInputLine.querySelector('input'); if (input && !input.disabled) input.focus(); }
    };

    const openTerminal = () => {
        taskbar.classList.remove('active');
        const width = 720,
            height = 440;
        terminalWindow.style.width = width + 'px';
        terminalWindow.style.height = height + 'px';
        terminalWindow.style.left = ((window.innerWidth - width) / 2) + 'px';
        terminalWindow.style.top = ((window.innerHeight - height) / 2) + 'px';
        savedRect = null;
        isFullscreen = false;
        terminalWindow.classList.remove('fullscreen');
        maximizeButton.textContent = '▢';
        if (terminalLog.length === 0) {
            const statement = settingsData['terminal-statement'] || DEFAULT_SETTINGS['terminal-statement'];
            statement.split('\n').forEach(line => addLine(line, 'system-message'));
        }
        if (currentInputLine) { currentInputLine.remove(); currentInputLine = null; }
        createInputLine('键入命令...');
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
        terminalWindow.classList.add('active');
        setTimeout(() => { const input = currentInputLine?.querySelector('input'); if (input && !input.disabled) input.focus(); }, 50);
    };

    const toggleFullscreen = () => {
        if (!isFullscreen) {
            savedRect = { left: terminalWindow.style.left, top: terminalWindow.style.top, width: terminalWindow.style.width, height: terminalWindow.style.height };
            terminalWindow.classList.add('fullscreen');
            isFullscreen = true;
            maximizeButton.textContent = '❐';
        } else {
            terminalWindow.classList.remove('fullscreen');
            isFullscreen = false;
            maximizeButton.textContent = '▢';
            if (savedRect) { terminalWindow.style.left = savedRect.left; terminalWindow.style.top = savedRect.top; terminalWindow.style.width = savedRect.width; terminalWindow.style.height = savedRect.height; }
        }
        if (currentInputLine) { const input = currentInputLine.querySelector('input'); if (input && !input.disabled) input.focus(); }
    };

    // 拖拽移动
    let isDragging = false,
        dragOffsetX = 0,
        dragOffsetY = 0;
    titleBar.addEventListener('mousedown', (event) => {
        if (isFullscreen || event.target.tagName === 'BUTTON') return;
        terminalWindow.classList.add('no-transition');
        const rect = terminalWindow.getBoundingClientRect();
        isDragging = true;
        dragOffsetX = event.clientX - rect.left;
        dragOffsetY = event.clientY - rect.top;
        event.preventDefault();
    });
    document.addEventListener('mousemove', (event) => {
        if (isDragging) {
            let newLeft = event.clientX - dragOffsetX,
                newTop = event.clientY - dragOffsetY;
            newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - 80));
            newTop = Math.max(0, Math.min(newTop, window.innerHeight - 40));
            terminalWindow.style.left = newLeft + 'px';
            terminalWindow.style.top = newTop + 'px';
        }
    });
    document.addEventListener('mouseup', () => { if (isDragging) { isDragging = false; terminalWindow.classList.remove('no-transition'); } });

    // 调整大小
    let resizeMode = null,
        resizeStartX = 0,
        resizeStartY = 0,
        resizeStartWidth = 0,
        resizeStartHeight = 0,
        resizeStartLeft = 0,
        resizeStartTop = 0;
    const startResize = (mode, event) => {
        if (isFullscreen) return;
        const rect = terminalWindow.getBoundingClientRect();
        resizeMode = mode;
        resizeStartX = event.clientX;
        resizeStartY = event.clientY;
        resizeStartWidth = rect.width;
        resizeStartHeight = rect.height;
        resizeStartLeft = rect.left;
        resizeStartTop = rect.top;
        terminalWindow.classList.add('no-transition');
        event.preventDefault();
        event.stopPropagation();
    };
    resizeCorner.addEventListener('mousedown', event => startResize('se', event));
    resizeRightEdge.addEventListener('mousedown', event => startResize('e', event));
    resizeBottomEdge.addEventListener('mousedown', event => startResize('s', event));
    document.addEventListener('mousemove', (event) => {
        if (!resizeMode) return;
        const deltaX = event.clientX - resizeStartX,
            deltaY = event.clientY - resizeStartY;
        let newWidth = resizeStartWidth,
            newHeight = resizeStartHeight;
        if (resizeMode.includes('e')) newWidth = Math.max(400, Math.min(resizeStartWidth + deltaX, window.innerWidth - resizeStartLeft));
        if (resizeMode.includes('s')) newHeight = Math.max(280, Math.min(resizeStartHeight + deltaY, window.innerHeight - resizeStartTop));
        terminalWindow.style.width = newWidth + 'px';
        terminalWindow.style.height = newHeight + 'px';
    });
    document.addEventListener('mouseup', () => { if (resizeMode) { resizeMode = null; terminalWindow.classList.remove('no-transition'); } });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && flowState !== 'idle' && terminalWindow.classList.contains('active')) {
            event.preventDefault();
            addLine('⏹ LOG™已终止', 'amber-message');
            resetFlow();
            closeTerminal();
        }
    });

    const handleCommand = (command) => {
        const parts = command.toLowerCase().split(/\s+/);
        if (parts[0] === 'run') {
            if (parts.length === 2 && parts[1] === 'log') { startFlow(); return; }
            if (parts.length >= 2 && parts[1] !== 'log') {
                const address = parts.slice(1).join(' ').trim();
                if (address) { let url = address; if (!/^https?:\/\//i.test(url)) url = 'https://' + url; addLine('正在打开 ' + url + ' ...', 'info-message'); window.open(url, '_blank'); return; }
            }
            addLine('错误：run命令未包含输入值', 'error-message');
            return;
        }
        switch (parts[0]) {
            case 'help':
                addLine('── 可用命令 ──', 'info-message');
                ['help        显示帮助信息', 'exit        关闭整个网页', 'run [网址]  打开指定网址', 'run log     启动LOG™', 'time        显示当前精确日期时间', 'config      显示浏览器所有可获取数据', 'export      导出终端记录（带时间戳）', 'version     显示当前版本号'].forEach(line => addLine('  ' + line, 'dim-message'));
                break;
            case 'exit':
                addLine('正在尝试关闭页面...', 'amber-message');
                setTimeout(() => { closeTerminal(); try { window.close(); } catch (error) { } addLine('浏览器拒绝自动关闭，已关闭终端窗口', 'dim-message'); }, 300);
                break;
            case 'time':
                addLine('当前时间: ' + formatTimestamp(), 'info-message');
                addLine('ISO格式: ' + new Date().toISOString(), 'dim-message');
                break;
            case 'config': showConfig(); break;
            case 'export': exportLog(); break;
            case 'version': addLine('版本: ' + (settingsData.version || DEFAULT_SETTINGS.version), 'info-message'); break;
            default: addLine(`'${command}' 不是内部或外部命令，也不是可运行的程序或批处理文件。`, 'error-message');
        }
    };

    const showConfig = async () => {
        addLine('── 浏览器信息 ──', 'info-message');
        const userAgent = navigator.userAgent;
        addLine('User Agent: ' + userAgent, 'system-message');
        addLine('平台: ' + navigator.platform, 'system-message');
        addLine('语言: ' + navigator.language, 'system-message');
        addLine('时区: ' + Intl.DateTimeFormat().resolvedOptions().timeZone, 'system-message');
        addLine('屏幕分辨率: ' + screen.width + '×' + screen.height, 'system-message');
        addLine('窗口分辨率: ' + window.innerWidth + '×' + window.innerHeight, 'system-message');
        addLine('设备像素比: ' + window.devicePixelRatio, 'system-message');
        addLine('颜色深度: ' + screen.colorDepth + 'bit', 'system-message');
        addLine('在线状态: ' + (navigator.onLine ? '在线' : '离线'), 'system-message');
        addLine('Cookie启用: ' + (navigator.cookieEnabled ? '是' : '否'), 'system-message');
        addLine('硬件并发数: ' + (navigator.hardwareConcurrency || '未知'), 'system-message');
        addLine('设备内存: ' + (navigator.deviceMemory ? navigator.deviceMemory + 'GB' : '未知'), 'system-message');
        addLine('触摸支持: ' + ('ontouchstart' in window ? '是' : '否'), 'system-message');
        if (navigator.connection) {
            addLine('网络类型: ' + (navigator.connection.effectiveType || '未知'), 'system-message');
            addLine('下行速度: ' + (navigator.connection.downlink || '未知') + ' Mbps', 'system-message');
            addLine('RTT: ' + (navigator.connection.rtt || '未知') + 'ms', 'system-message');
        }
        const isChrome = /Chrome/.test(userAgent) && !/Edg/.test(userAgent),
            isEdge = /Edg/.test(userAgent),
            isFirefox = /Firefox/.test(userAgent),
            isSafari = /Safari/.test(userAgent) && !isChrome && !isEdge;
        addLine('浏览器: ' + (isChrome ? 'Chrome' : isEdge ? 'Edge' : isFirefox ? 'Firefox' : isSafari ? 'Safari' : '其他'), 'system-message');
        if (userAgent.includes('Windows')) addLine('操作系统: Windows', 'system-message');
        else if (userAgent.includes('Mac')) addLine('操作系统: macOS', 'system-message');
        else if (userAgent.includes('Linux')) addLine('操作系统: Linux', 'system-message');
        else if (userAgent.includes('Android')) addLine('操作系统: Android', 'system-message');
        else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) addLine('操作系统: iOS', 'system-message');
        addLine('正在获取IP地址...', 'dim-message');
        try {
            const response = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(5000) });
            const data = await response.json();
            addLine('IP地址: ' + data.ip, 'info-message');
        } catch (error) {
            try {
                const response = await fetch('https://httpbin.org/ip', { signal: AbortSignal.timeout(5000) });
                const data = await response.json();
                addLine('IP地址: ' + data.origin, 'info-message');
            } catch (error) {
                addLine('IP地址: 无法获取（网络限制）', 'error-message');
            }
        }
    };

    const exportLog = () => {
        if (terminalLog.length === 0) { addLine('无记录可导出', 'error-message'); return; }
        const lines = terminalLog.map(entry => `[${formatTimestamp(entry.time)}] ${entry.type === 'input-echo' ? '▶ ' : '  '}${entry.text}`);
        const content = 'ASDFG Terminal Export\n' + '='.repeat(50) + '\n' + lines.join('\n');
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `terminal-export-${formatTimestamp().replace(/[:.]/g, '-')}.txt`;
        anchor.click();
        URL.revokeObjectURL(url);
        addLine('已导出 ' + terminalLog.length + ' 条记录', 'info-message');
    };

    const startFlow = () => {
        resetFlow();
        flowState = 'loading';
        if (currentInputLine) { const input = currentInputLine.querySelector('input'); if (input) input.disabled = true; }
        addLine('正在启动LOG™......', 'info-message');
        const spinnerChars = ['-', '\\', '|', '/'];
        let spinnerIndex = 0;
        animationTimer = setInterval(() => {
            const lastLine = terminalOutput.lastElementChild;
            if (lastLine && lastLine.classList.contains('info-message') && lastLine.textContent.startsWith('正在启动')) {
                lastLine.textContent = '正在启动LOG™......' + spinnerChars[spinnerIndex];
                spinnerIndex = (spinnerIndex + 1) % spinnerChars.length;
                terminalOutput.scrollTop = terminalOutput.scrollHeight;
            }
        }, 100);
        flowTimer = setTimeout(() => {
            clearAnimationTimer();
            addLine('启动成功,按ESC键关闭程序', 'green-message');
            flowState = 'waiting_esc';
            flowTimer = setTimeout(() => {
                addLine('请键入用户名:', 'amber-message');
                flowState = 'prompt_user';
                if (currentInputLine) { const input = currentInputLine.querySelector('input'); if (input) { input.placeholder = '键入用户名...'; input.disabled = false; input.focus(); } }
            }, 800);
        }, 2000);
    };

    const handleUserName = (username) => {
        const user = userData.find(u => u.username === username);
        if (user) {
            currentUser = user;
            addLine('✓ 用户名正确', 'green-message');
            addLine('请键入密钥:', 'amber-message');
            flowState = 'prompt_key';
        } else {
            currentUser = null;
            addLine('未找到用户,请重新键入', 'error-message');
            addLine('请键入用户名:', 'amber-message');
            flowState = 'prompt_user';
        }
    };

    const handleKey = (key) => {
        if (currentUser && key === currentUser.key) {
            addLine('✓ 密钥正确', 'green-message');
            flowState = 'logging_in';
            if (currentInputLine) { const input = currentInputLine.querySelector('input'); if (input) input.disabled = true; }
            addLine('正在登录......', 'info-message');
            let progress = 0;
            animationTimer = setInterval(() => {
                progress += 5;
                if (progress > 100) progress = 100;
                const barLength = 20,
                    filled = Math.round(barLength * progress / 100);
                const progressBar = '[' + '#'.repeat(filled) + '-'.repeat(barLength - filled) + '] ' + progress + '%';
                const lastLine = terminalOutput.lastElementChild;
                if (lastLine && lastLine.textContent.startsWith('正在登录')) lastLine.textContent = '正在登录...... ' + progressBar;
                else addLine(progressBar, 'info-message');
                terminalOutput.scrollTop = terminalOutput.scrollHeight;
                if (progress >= 100) {
                    clearAnimationTimer();
                    flowTimer = setTimeout(() => {
                        flowState = 'idle';
                        blackOverlay.style.display = 'block';
                        addLine('登录成功', 'green-message');
                        resetFlow();
                    }, 300);
                }
            }, 50);
        } else {
            currentUser = null;
            addLine('密码错误,请重试', 'error-message');
            addLine('请键入用户名:', 'amber-message');
            flowState = 'prompt_user';
        }
    };

    terminalOutput.addEventListener('click', () => {
        if (currentInputLine) { const input = currentInputLine.querySelector('input'); if (input && !input.disabled) input.focus(); }
    });

    window.openTerminal = openTerminal;
    window.closeTerminal = closeTerminal;
    window.toggleFullscreen = toggleFullscreen;
    window.minimizeTerminal = minimizeTerminal;
    window.restoreFromTaskbar = restoreFromTaskbar;
})();

//====================LOG™====================
// ============================================================
//  参数配置（修改这里可调整效果）
// ============================================================
const STEP = 2;     // 采样步长：每S个像素取1个粒子→粒子数减少为1/(S²)
const Q = 0.66;     // 粒子大小系数
const R = 110;      // 排斥半径
const P = 40;       // 排斥力强度
const K = 0.007;    // 弹回力强度
const D = 0.82;     // 阻尼
const M = 600;      // 图像最大尺寸限制
// ============================================================

const c = document.getElementById('c');
const x = c.getContext('2d', { alpha: true }); // 透明画布

// 读取 CSS 变量 --particle 作为粒子颜色（带默认值）
function getParticleColor() {
    const color = getComputedStyle(document.documentElement)
        .getPropertyValue('--particle').trim();
    return color || '#40c0ff';
}

let particleColor = getParticleColor();

// 监听 CSS 变量变化（性能优化：只在变化时重新读取，而不是每帧读取）
const observer = new MutationObserver(() => {
    const newColor = getParticleColor();
    if (newColor !== particleColor) {
        particleColor = newColor;
    }
});
observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['style', 'class']
});

let W, H, S, N, mX = -1e9, mY = -1e9, T = 0, F = [], f = 0, a = 0;
let BX, BY, X, Y, VX, VY, E;

// 鼠标事件
onmousemove = e => {
    const r = c.getBoundingClientRect();
    const s = c.width / r.width;
    mX = (e.clientX - r.left) * s;
    mY = (e.clientY - r.top) * s;
};
onmouseleave = () => { mX = -1e9 };

// 加载 GIF
fetch('./file/image/drive.gif').then(r => r.arrayBuffer()).then(async b => {
    if (!self.ImageDecoder) return alert('浏览器版本过低');
    const d = new ImageDecoder({ data: b, type: 'image/gif' });
    await d.tracks.ready;
    const t = d.tracks.selectedTrack;
    const { image: p } = await d.decode({ frameIndex: 0 });
    let w = p.displayWidth, h = p.displayHeight;
    p.close();

    if (w > M || h > M) {
        const s = M / Math.max(w, h);
        w = ~~(w * s);
        h = ~~(h * s);
    }

    const rawW = w, rawH = h;
    const smallW = Math.ceil(rawW / STEP);
    const smallH = Math.ceil(rawH / STEP);
    W = smallW;
    H = smallH;
    N = W * H;

    // 计算粒子间距
    S = Math.max(3, Math.min(8,
        ~~((innerWidth - 16) / (W * STEP)),
        ~~((innerHeight - 16) / (H * STEP))
    ));
    if (S < 2) S = 2;

    c.width = W * STEP * S;
    c.height = H * STEP * S;

    // 初始化数组
    BX = new Float32Array(N);
    BY = new Float32Array(N);
    X = new Float32Array(N);
    Y = new Float32Array(N);
    VX = new Float32Array(N);
    VY = new Float32Array(N);
    E = new Uint8Array(N);

    for (let i = 0; i < N; i++) {
        const col = i % W, row = (i / W) | 0;
        BX[i] = col * STEP * S + S / 2;
        BY[i] = row * STEP * S + S / 2;
        X[i] = BX[i];
        Y[i] = BY[i];
    }

    // 读取 GIF 帧
    const g = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
    g.canvas.width = rawW;
    g.canvas.height = rawH;

    for (let i = 0; i < t.frameCount; i++) {
        const { image: v } = await d.decode({ frameIndex: i });
        g.drawImage(v, 0, 0, rawW, rawH);
        const data = g.getImageData(0, 0, rawW, rawH).data;
        const u = new Uint8Array(N);

        for (let j = 0; j < N; j++) {
            const col = j % W, row = (j / W) | 0;
            const px = col * STEP, py = row * STEP;
            const idx = (py * rawW + px) * 4;
            const rC = data[idx], gC = data[idx + 1], bC = data[idx + 2], aC = data[idx + 3];
            const lum = 0.299 * rC + 0.587 * gC + 0.114 * bC;
            u[j] = (aC > 40 && lum > 20) ? 1 : 0;
        }

        F.push({
            e: u,
            d: (v.duration > 0 ? v.duration / 1000 : 80)
        });
        v.close();
    }
    d.close();

    E.set(F[0].e);
    T = performance.now();
    requestAnimationFrame(L);
}).catch(() => {
    x.fillStyle = '#222';
    x.fillRect(0, 0, c.width || innerWidth, c.height || innerHeight);
    x.fillStyle = '#888';
    x.font = '18px sans-serif';
    x.textAlign = 'center';
    x.fillText('请将 GIF 命名为 drive.gif 放在./file/image/', innerWidth / 2, innerHeight / 2);
});

// 动画循环
function L(t) {
    a += t - T;
    T = t;
    if (a >= F[f].d) {
        a -= F[f].d;
        f = (f + 1) % F.length;
        E.set(F[f].e);
    }

    const r2 = R * R;
    const hasMouse = mX > -1e8;

    for (let i = 0; i < N; i++) {
        let ax = 0, ay = 0;

        // 光标排斥力
        if (hasMouse && E[i]) {
            const dx = X[i] - mX, dy = Y[i] - mY;
            const d2 = dx * dx + dy * dy;
            if (d2 < r2 && d2 > 0.5) {
                const d = Math.sqrt(d2);
                const n = (1 - d / R) * P;
                ax += (dx / d) * n;
                ay += (dy / d) * n;
            }
        }

        // 弹回力
        ax += (BX[i] - X[i]) * K;
        ay += (BY[i] - Y[i]) * K;

        // 速度更新 + 阻尼
        VX[i] = (VX[i] + ax) * D;
        VY[i] = (VY[i] + ay) * D;
        X[i] += VX[i];
        Y[i] += VY[i];
    }

    // 渲染（透明背景）
    x.clearRect(0, 0, c.width, c.height);

    // 使用从 CSS 变量读取的颜色（已在循环外缓存）
    x.fillStyle = particleColor;
    x.beginPath();
    const radius = S * Q;
    for (let i = 0; i < N; i++) {
        if (E[i]) {
            x.moveTo(X[i] + radius, Y[i]);
            x.arc(X[i], Y[i], radius, 0, 7);
        }
    }
    x.fill();

    requestAnimationFrame(L);
}