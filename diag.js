// Pink Whale 🐳 诊断脚本：收集 DSH 页面结构与目标元素样式
// 由主进程读取后通过 executeJavaScript 注入执行。
(() => {
  const tags = {};
  const classes = {};
  for (const el of document.querySelectorAll('*')) {
    const t = el.tagName.toLowerCase();
    tags[t] = (tags[t] || 0) + 1;
    if (typeof el.className === 'string') {
      for (const c of el.className.split(/\s+/)) {
        if (c) classes[c] = (classes[c] || 0) + 1;
      }
    }
  }

  // 页面所有定位的非透明元素（找白色遮罩层）
  const whiteOverlays = [];
  for (const el of document.querySelectorAll('*')) {
    if (whiteOverlays.length >= 15) break;
    const cs = getComputedStyle(el);
    const b = cs.backgroundColor;
    const isWhite = b === 'rgb(255, 255, 255)'
      || (typeof b === 'string' && b.startsWith('rgba(255, 255, 255'));
    if (isWhite && cs.position !== 'static') {
      whiteOverlays.push({
        tag: el.tagName.toLowerCase(),
        cls: typeof el.className === 'string' ? el.className : '',
        bg: b,
        pos: cs.position,
        z: cs.zIndex
      });
    }
  }

  // owvEQG_card 的祖先链（父元素往上 4 层）
  const card = document.querySelector('[class*="owvEQG_card"]');
  const ancestorsInfo = [];
  if (card) {
    let el = card.parentElement;
    let depth = 0;
    while (el && depth < 4) {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      ancestorsInfo.push({
        depth: depth + 1,
        cls: typeof el.className === 'string' ? el.className : '',
        tag: el.tagName.toLowerCase(),
        size: Math.round(r.width) + 'x' + Math.round(r.height),
        backgroundColor: cs.backgroundColor,
        backgroundImage: cs.backgroundImage.slice(0, 80),
        boxShadow: cs.boxShadow,
        position: cs.position,
        zIndex: cs.zIndex,
        color: cs.color
      });
      el = el.parentElement;
      depth++;
    }
  }

  // 找"给智能体发消息"相关元素（TreeWalker 精确查文本节点）
  const targetText = '给智能体发消息';
  const textEls = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    const t = node.textContent.trim();
    if (t.includes(targetText)) {
      textEls.push({
        tag: node.parentElement.tagName.toLowerCase(),
        cls: typeof node.parentElement.className === 'string' ? node.parentElement.className : '',
        text: t.slice(0, 30)
      });
    }
  }
  const attrEls = [];
  for (const el of document.querySelectorAll('[data-placeholder], [placeholder], [aria-label], [title], [data-ph]')) {
    for (const a of ['data-placeholder', 'placeholder', 'aria-label', 'title', 'data-ph']) {
      const v = el.getAttribute(a);
      if (v && v.includes(targetText)) {
        attrEls.push({
          tag: el.tagName.toLowerCase(),
          cls: typeof el.className === 'string' ? el.className : '',
          attr: a,
          value: v.slice(0, 30)
        });
      }
    }
  }

  // owvEQG_input 输入框详情（placeholder 实现方式）
  const inputEl = document.querySelector('[class*="owvEQG_input"]');
  const inputInfo = inputEl ? {
    tag: inputEl.tagName.toLowerCase(),
    cls: typeof inputEl.className === 'string' ? inputEl.className : '',
    contentEditable: inputEl.isContentEditable,
    textContent: (inputEl.textContent || '').slice(0, 60),
    innerHTML: (inputEl.innerHTML || '').slice(0, 120),
    dataPh: inputEl.getAttribute('data-ph') || inputEl.getAttribute('data-placeholder'),
    placeholder: inputEl.getAttribute('placeholder'),
    ariaLabel: inputEl.getAttribute('aria-label'),
    beforeContent: getComputedStyle(inputEl, '::before').content,
    afterContent: getComputedStyle(inputEl, '::after').content
  } : null;

  // "新会话"按钮 label 的详情（找"小疙瘩"来源）
  const nsEl = document.querySelector('[class*="_7_8YhW_newSessionLabel"]');
  const nsInfo = nsEl ? (() => {
    const cs = getComputedStyle(nsEl);
    const ps = getComputedStyle(nsEl.parentElement);
    const before = getComputedStyle(nsEl, '::before');
    const after = getComputedStyle(nsEl, '::after');
    const pAfter = getComputedStyle(nsEl.parentElement, '::after');
    return {
      tag: nsEl.tagName.toLowerCase(),
      cls: nsEl.className,
      text: (nsEl.textContent || '').trim(),
      textDecoration: cs.textDecorationLine,
      boxShadow: cs.boxShadow,
      beforeContent: before.content,
      beforeSize: before.width + 'x' + before.height,
      beforeBg: before.backgroundColor,
      afterContent: after.content,
      afterSize: after.width + 'x' + after.height,
      afterBg: after.backgroundColor,
      parentCls: typeof nsEl.parentElement.className === 'string' ? nsEl.parentElement.className : '',
      parentBoxShadow: ps.boxShadow,
      parentAfterContent: pAfter.content,
      parentAfterBg: pAfter.backgroundColor,
      parentAfterSize: pAfter.width + 'x' + pAfter.height,
      children: [...nsEl.children].map(c => ({
        tag: c.tagName.toLowerCase(),
        cls: typeof c.className === 'string' ? c.className : ''
      }))
    };
  })() : null;

  // 页面上所有小圆点/小方块元素（找"小疙瘩"）
  const dots = [];
  for (const el of document.querySelectorAll('*')) {
    if (dots.length >= 20) break;
    const r = el.getBoundingClientRect();
    if (r.width > 2 && r.width < 24 && r.height > 2 && r.height < 24) {
      const cs = getComputedStyle(el);
      const br = parseFloat(cs.borderRadius) || 0;
      if (br >= 4) {
        dots.push({
          tag: el.tagName.toLowerCase(),
          cls: typeof el.className === 'string' ? el.className : '',
          size: Math.round(r.width) + 'x' + Math.round(r.height),
          bg: cs.backgroundColor,
          bgImg: cs.backgroundImage.slice(0, 50),
          pos: cs.position,
          left: Math.round(r.left),
          top: Math.round(r.top)
        });
      }
    }
  }

  // "新会话"按钮的祖先链 + 兄弟元素
  const nsBtn = document.querySelector('[class*="_7_8YhW_newSession"]');
  const nsAncestors = [];
  if (nsBtn) {
    let el = nsBtn.parentElement;
    let d = 0;
    while (el && d < 4) {
      const cs = getComputedStyle(el);
      nsAncestors.push({
        depth: d + 1,
        cls: typeof el.className === 'string' ? el.className : '',
        tag: el.tagName.toLowerCase(),
        bg: cs.backgroundColor,
        bgImg: cs.backgroundImage.slice(0, 60),
        children: [...el.children].slice(0, 10).map(c => ({
          tag: c.tagName.toLowerCase(),
          cls: typeof c.className === 'string' ? c.className : '',
          text: (c.textContent || '').trim().slice(0, 12)
        }))
      });
      el = el.parentElement;
      d++;
    }
  }

  // "新会话"按钮内部结构与原生 hover 样式
  const nsBtnEl = document.querySelector('[class*="_7_8YhW_newSession"]');
  const nsBtnInfo = nsBtnEl ? (() => {
    const label = nsBtnEl.querySelector('[class*="_7_8YhW_newSessionLabel"]');
    const lr = label ? label.getBoundingClientRect() : null;
    const br = nsBtnEl.getBoundingClientRect();
    const hov = getComputedStyle(nsBtnEl, ':hover');
    // 子元素布局（确认 SVG 在按钮里的位置）
    const childLayout = [...nsBtnEl.children].map(c => {
      const r = c.getBoundingClientRect();
      return {
        tag: c.tagName.toLowerCase(),
        isSvg: c instanceof SVGElement,
        cls: typeof c.className === 'string' ? c.className : '',
        pos: Math.round(r.left - br.left) + ',' + Math.round(r.top - br.top) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height),
        display: getComputedStyle(c).display,
        text: (c.textContent || '').trim().slice(0, 8)
      };
    });
    return {
      innerHTML: nsBtnEl.innerHTML.slice(0, 200),
      childCount: nsBtnEl.children.length,
      btnSize: Math.round(br.width) + 'x' + Math.round(br.height),
      labelOffsetTop: lr ? Math.round(lr.top - br.top) : null,
      labelBottomToBtnBottom: lr ? Math.round(br.bottom - lr.bottom) : null,
      childLayout,
      hoverBg: hov.backgroundColor,
      hoverShadow: hov.boxShadow,
      hoverAfter: getComputedStyle(nsBtnEl, ':hover::after').content,
      hoverBefore: getComputedStyle(nsBtnEl, ':hover::before').content
    };
  })() : null;

  // 带渐变背景的元素
  const grads = [];
  for (const el of document.querySelectorAll('*')) {
    if (grads.length >= 25) break;
    const bi = getComputedStyle(el).backgroundImage;
    if (bi && bi !== 'none' && bi.includes('gradient')) {
      grads.push({
        tag: el.tagName.toLowerCase(),
        cls: typeof el.className === 'string' ? el.className : '',
        bg: bi.slice(0, 90)
      });
    }
  }

  return JSON.stringify({
    url: location.href,
    title: document.title,
    bodyBg: getComputedStyle(document.body).backgroundColor,
    tags: Object.entries(tags).sort((a, b) => b[1] - a[1]).slice(0, 15),
    classes: Object.entries(classes).sort((a, b) => b[1] - a[1]).slice(0, 60),
    whiteOverlays,
    grads,
    ancestorsInfo,
    textEls,
    attrEls,
    inputInfo,
    nsInfo,
    nsBtnInfo,
    dots,
    nsAncestors
  });
})()
