//以下注释由GLM5.1生成，非人工编写，可能存在不准确或不完整的情况，请谨慎参考。
//全局状态
var current = 0;
var total = 4;
var animating = false;

/* LOADING */
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

//背景音乐
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

//整屏滚动
var pages = document.getElementById('pages');
var dots = document.querySelectorAll('#dots .dot');
var pageind = document.getElementById('curPage');
var nav = document.getElementById('nav');

//多方向错落进入动画
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
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); goTo(current + 1); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') { e.preventDefault(); goTo(current - 1); }
});

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

//Markdown 解析器
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

/* 加载文章 */
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
    fetch('Article/manifest.json').then(function (r) { return r.json(); }).then(function (data) {
        posts = data.posts || [];
        renderCards();
    }).catch(function () {
        document.getElementById('grid').innerHTML =
            '<div class="card" style="grid-column:1/-1;padding:30px">' +
            '<div class="meta"><span class="cat">提示</span></div><h3>无法读取文章数据</h3>' +
            '<p class="ex">请通过 HTTP 服务器打开本页面（如 VS Code Live Server 或 python -m http.server）。</p></div>';
    });
})();