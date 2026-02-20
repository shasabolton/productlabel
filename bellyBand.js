class bellyBand {
  constructor(data) {
    this.labelData = data;
    this.boxSize = { width: 310, height: 220, depth: 20 };
  }
  // --- Original canvas render (commented out) ---
  // render() {
  //   var pageKey = document.getElementById("pageSizeSelect").value;
  //   var canvas = document.createElement("canvas");
  //   canvas.id = "canvas";
  //   this.ctx = canvas.getContext("2d");
  //   var dpi = 300;
  //   var page = pages[pageKey];
  //   var pageWidthPx = page.width / 25.4 * dpi;
  //   var pageHeightPx = page.height / 25.4 * dpi;
  //   var marginPx = (page.margin || 10) / 25.4 * dpi;
  //   canvas.width = pageWidthPx;
  //   canvas.height = pageHeightPx;
  //   var container = document.querySelector(".canvas-container");
  //   if (container) container.appendChild(canvas);
  //   else document.body.append(canvas);
  //
  //   var bs = this.boxSize;
  //   var mmToPx = dpi / 25.4;
  //   var topH = bs.depth * mmToPx;
  //   var frontH = bs.height * mmToPx;
  //   var bottomH = bs.depth * mmToPx;
  //   var backH = bs.height * mmToPx;
  //   var totalH = topH + frontH + bottomH + backH;
  //   var availW = pageWidthPx - 2 * marginPx;
  //   var availH = pageHeightPx - 2 * marginPx;
  //
  //   var data = this.normalizeBellyBandData();
  //
  //   function drawSections(assets) {
  //     assets = assets || {};
  //     ctx.fillStyle = data.style.backgroundColor || "#ffffff";
  //     ctx.fillRect(0, 0, canvas.width, canvas.height);
  //
  //     if (availH >= totalH) {
  //       var x = marginPx;
  //       var w = availW;
  //       var y = marginPx;
  //       drawSpine(ctx, data, assets, x, y, w, topH);
  //       y += topH;
  //       drawFront(ctx, data, assets, x, y, w, frontH);
  //       y += frontH;
  //       drawBottom(ctx, data, assets, x, y, w, bottomH);
  //       y += bottomH;
  //       drawBack(ctx, data, assets, x, y, w, backH);
  //     } else {
  //       var colW = (pageWidthPx - 4 * marginPx) / 2;
  //       var leftX = marginPx;
  //       var rightX = marginPx + colW + 2 * marginPx;
  //       var y = marginPx;
  //       drawSpine(ctx, data, assets, leftX, y, colW, topH);
  //       y += topH;
  //       drawFront(ctx, data, assets, leftX, y, colW, frontH);
  //       drawBack(ctx, data, assets, rightX, y, colW, backH);
  //       drawVerticalLine(ctx, leftX + colW, y, frontH, data.style.borderColor);
  //       y += frontH;
  //       drawBottom(ctx, data, assets, leftX, y, colW, bottomH);
  //     }
  //   }
  //
  //   var ctx = this.ctx;
  //   drawSections({});
  //
  //   if (data.assets && Object.keys(data.assets).length > 0) {
  //     loadAssets(data.assets).then(function (assets) {
  //       drawSections(assets);
  //     });
  //   }
  // }

  render() {
    var pageKey = document.getElementById("pageSizeSelect").value;
    var dpi = 300;
    var page = pages[pageKey];
    var pageWidthPx = page.width / 25.4 * dpi;
    var pageHeightPx = page.height / 25.4 * dpi;
    var marginPx = (page.margin || 10) / 25.4 * dpi;

    var bs = this.boxSize;
    var mmToPx = dpi / 25.4;
    var topH = bs.depth * mmToPx;
    var frontH = bs.height * mmToPx;
    var bottomH = bs.depth * mmToPx;
    var backH = bs.height * mmToPx;
    var totalH = topH + frontH + bottomH + backH;
    var availW = pageWidthPx - 2 * marginPx;
    var availH = pageHeightPx - 2 * marginPx;

    var data = this.normalizeBellyBandData();
    var content = data.content || {};
    var front = content.front || {};
    var back = content.back || {};
    var spineTop = content.spineTop || {};
    var spineBottom = content.spineBottom || {};
    var style = data.style || {};
    var th = selectedTheme || { headings: "Harrington", headingsWeight: "400", body: "Arial" };
    style.fontTitle = th.headingsWeight + " 48px " + th.headings;
    style.fontSubtitle = "italic 24px " + th.body;
    style.fontBody = "20px " + th.body;
    style.fontSmall = "14px " + th.body;
    var assets = data.assets || {};

    var container = document.querySelector(".canvas-container") || document.body;
    var oldCanvas = document.getElementById("canvas");
    var oldPage = document.getElementById("belly-band-page");
    if (oldCanvas) oldCanvas.remove();
    if (oldPage) oldPage.remove();

    var pageDiv = document.createElement("div");
    pageDiv.id = "belly-band-page";
    pageDiv.style.cssText = "box-sizing:border-box;width:" + pageWidthPx + "px;height:" + pageHeightPx + "px;padding:" + marginPx + "px;background:" + (style.backgroundColor || "#fff") + ";display:flex;flex-direction:column;gap:0;";
    pageDiv.style.setProperty("--bb-scale", "1");

    var vertical = availH >= totalH;
    var colW = vertical ? availW : (pageWidthPx - 4 * marginPx) / 2;
    var sectionW = vertical ? availW : colW;
    var gapPx = vertical ? 0 : 2 * marginPx;

    if (vertical) {
      var col = document.createElement("div");
      col.style.cssText = "display:flex;flex-direction:column;flex:0 0 auto;width:100%;";
      col.appendChild(buildSectionTop(sectionW, topH, spineTop, back, style, backH));
      col.appendChild(buildSectionFront(sectionW, frontH, front, style, assets));
      col.appendChild(buildSectionBottom(sectionW, bottomH, spineBottom, back, style, backH));
      col.appendChild(buildSectionBack(sectionW, backH, back, style, assets));
      pageDiv.appendChild(col);
    } else {
      var leftCol = document.createElement("div");
      leftCol.style.cssText = "display:flex;flex-direction:column;flex:0 0 auto;width:" + colW + "px;";
      leftCol.appendChild(buildSectionTop(sectionW, topH, spineTop, back, style, backH));
      leftCol.appendChild(buildSectionFront(sectionW, frontH, front, style, assets));
      leftCol.appendChild(buildSectionBottom(sectionW, bottomH, spineBottom, back, style, backH));

      var rightCol = document.createElement("div");
      rightCol.style.cssText = "display:flex;flex-direction:column;flex:0 0 auto;width:" + colW + "px;margin-left:" + gapPx + "px;border-left:1px solid " + (style.borderColor || "#222") + ";";
      var spacer = document.createElement("div");
      spacer.style.cssText = "height:" + topH + "px;flex-shrink:0;";
      rightCol.appendChild(spacer);
      rightCol.appendChild(buildSectionBack(sectionW, backH, back, style, assets));

      var row = document.createElement("div");
      row.style.cssText = "display:flex;flex-direction:row;flex:0 0 auto;align-items:flex-start;";
      row.appendChild(leftCol);
      row.appendChild(rightCol);
      pageDiv.appendChild(row);
    }

    container.appendChild(pageDiv);
    var self = this;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        self.fitTextToSections(pageDiv);
      });
    });
  }

  fitTextToSections(pageDiv) {
    var scale = 1;
    var maxPasses = 5;
    for (var pass = 0; pass < maxPasses; pass++) {
      var minScale = 1;
      var elements = pageDiv.querySelectorAll(".bb-scalable");
      for (var i = 0; i < elements.length; i++) {
        var el = elements[i];
        var cw = el.clientWidth;
        var ch = el.clientHeight;
        var sw = el.scrollWidth;
        var sh = el.scrollHeight;
        if (sw > cw && cw > 0) minScale = Math.min(minScale, cw / sw);
        if (sh > ch && ch > 0) minScale = Math.min(minScale, ch / sh);
      }
      var sections = pageDiv.querySelectorAll(".bb-section");
      for (var j = 0; j < sections.length; j++) {
        var sec = sections[j];
        if (sec.scrollHeight > sec.clientHeight && sec.clientHeight > 0) {
          minScale = Math.min(minScale, sec.clientHeight / sec.scrollHeight);
        }
      }
      scale *= minScale;
      pageDiv.style.setProperty("--bb-scale", String(Math.max(0.4, scale)));
      if (minScale >= 0.99) break;
    }
    this.balanceTextInSections(pageDiv);
  }

  balanceTextInSections(pageDiv) {
    var elements = pageDiv.querySelectorAll(".bb-balance");
    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];
      var text = (el.textContent || "").trim();
      if (!text) continue;
      var words = text.split(/\s+/);
      if (words.length < 2) continue;
      var lineHeight = parseFloat(getComputedStyle(el).lineHeight) || parseFloat(getComputedStyle(el).fontSize) * 1.2;
      var numLines = Math.max(1, Math.round(el.scrollHeight / lineHeight));
      if (numLines <= 1) continue;
      var totalChars = text.length;
      var targetPerLine = totalChars / numLines;
      var lines = [];
      var current = [];
      var currentChars = 0;
      for (var w = 0; w < words.length; w++) {
        var word = words[w];
        var add = word.length + (current.length > 0 ? 1 : 0);
        var wouldBe = currentChars + add;
        var shouldBreak = current.length > 0 && wouldBe > targetPerLine && lines.length < numLines - 1;
        if (shouldBreak) {
          lines.push(current.join(" "));
          current = [word];
          currentChars = word.length;
        } else {
          current.push(word);
          currentChars = wouldBe;
        }
      }
      if (current.length > 0) lines.push(current.join(" "));
      if (lines.length > 1) el.innerHTML = lines.join("<br>");
    }
  }

  normalizeBellyBandData() {
    var d = this.labelData;
    if (d.style && d.content) {
      var c = d.content;
      c.back = c.back || {};
      c.spineTop = c.spineTop || {};
      c.spineBottom = c.spineBottom || {};
      if (c.spine && !c.back.title) {
        c.back.title = c.spine.title;
        c.back.specs = c.spine.specs || [];
      }
      if (!c.spineTop.title) c.spineTop.title = c.back.title || (c.spine && c.spine.title);
      if (!c.spineBottom.title) c.spineBottom.title = c.back.title || (c.spine && c.spine.title);
      return d;
    }
    var th = selectedTheme || { headings: "Harrington", headingsWeight: "400", body: "Arial" };
    return {
      style: {
        backgroundColor: "#ffffff",
        borderColor: "#222",
        textColor: "#111",
        fontTitle: th.headingsWeight + " 48px " + th.headings,
        fontSubtitle: "italic 24px " + th.body,
        fontBody: "20px " + th.body,
        fontSmall: "14px " + th.body
      },
      content: {
        front: {
          eyebrow: "",
          title: d.title,
          subtitle: "",
          tagline: d.description || "",
          features: ""
        },
        spineTop: { title: d.title },
        spineBottom: { title: d.title },
        back: {
          title: d.title,
          specs: [],
          description: d.description || "",
          bullets: [],
          qrLabel: "",
          model: ""
        }
      },
      assets: d.assets || {}
    };
  }

  tile(n) {
    try { document.getElementById("canvas").remove(); } catch (e) {}
    try { document.getElementById("belly-band-page").remove(); } catch (e) {}
    this.render();
  }
}

function getFontFamily(fontStr) {
  if (!fontStr) return "inherit";
  var m = (fontStr + "").match(/\d+px\s+(.+)$/);
  var family = m ? m[1].trim() : fontStr;
  var parts = family.split(",").map(function (s) { return s.trim(); });
  return parts.map(function (p) {
    return p.indexOf(" ") >= 0 ? '"' + p + '"' : p;
  }).join(", ");
}

function buildSectionTop(w, h, spineTop, back, style, backH) {
  var title = (spineTop && spineTop.title) || back.title || back.spineTitle || "";
  var subheadingBase = (backH || h) / 14;
  var fontTitle = getFontFamily(style.fontTitle);
  var div = document.createElement("div");
  div.className = "bb-section bb-top";
  div.style.cssText = "box-sizing:border-box;width:" + w + "px;height:" + h + "px;border:1px solid " + (style.borderColor || "#222") + ";padding:2%;display:flex;align-items:center;justify-content:center;overflow:hidden;";
  var span = document.createElement("span");
  span.className = "bb-scalable bb-balance";
  span.style.cssText = "color:" + (style.textColor || "#111") + ";font-family:" + fontTitle + ";font-size:calc(" + subheadingBase + "px * var(--bb-scale, 1));text-align:center;";
  span.textContent = title;
  div.appendChild(span);
  return div;
}

function buildSectionFront(w, h, front, style, assets) {
  var headingBase = h / 8;
  var subheadingBase = h / 14;
  var contentBase = h / 20;
  var fontTitle = getFontFamily(style.fontTitle);
  var fontSubtitle = getFontFamily(style.fontSubtitle);
  var fontBody = getFontFamily(style.fontBody);
  var div = document.createElement("div");
  div.className = "bb-section bb-front";
  div.style.cssText = "box-sizing:border-box;width:" + w + "px;height:" + h + "px;border:1px solid " + (style.borderColor || "#222") + ";padding:4%;display:flex;flex-direction:column;overflow:hidden;color:" + (style.textColor || "#111") + ";";
  if (front.eyebrow) {
    var eb = document.createElement("div");
    eb.className = "bb-eyebrow bb-scalable bb-balance";
    eb.style.cssText = "text-align:center;font-family:" + fontSubtitle + ";font-size:calc(" + subheadingBase + "px * var(--bb-scale, 1));margin-bottom:0.3em;";
    eb.textContent = front.eyebrow;
    div.appendChild(eb);
    var dl = document.createElement("hr");
    dl.style.cssText = "border:none;border-top:2px solid " + (style.borderColor || "#222") + ";margin:0.2em 0 0.5em 0;";
    div.appendChild(dl);
    var dl2 = document.createElement("hr");
    dl2.style.cssText = "border:none;border-top:1px solid " + (style.borderColor || "#222") + ";margin:-3px 0 0.5em 0;";
    div.appendChild(dl2);
  }
  if (front.title) {
    var tit = document.createElement("h1");
    tit.className = "bb-title bb-scalable bb-balance";
    tit.style.cssText = "text-align:center;font-family:" + fontTitle + ";font-size:calc(" + headingBase + "px * var(--bb-scale, 1));margin:0 0 0.3em 0;line-height:1.1;";
    tit.textContent = front.title;
    div.appendChild(tit);
  }
  if (front.subtitle) {
    var sub = document.createElement("div");
    sub.className = "bb-subtitle bb-scalable bb-balance";
    sub.style.cssText = "text-align:center;font-family:" + fontSubtitle + ";font-style:italic;font-size:calc(" + contentBase + "px * var(--bb-scale, 1));margin-bottom:0.2em;";
    sub.textContent = front.subtitle;
    div.appendChild(sub);
  }
  if (front.tagline) {
    var tag = document.createElement("div");
    tag.className = "bb-tagline bb-scalable bb-balance";
    tag.style.cssText = "text-align:center;font-family:" + fontBody + ";font-size:calc(" + contentBase + "px * var(--bb-scale, 1));margin-bottom:0.5em;";
    tag.textContent = front.tagline;
    div.appendChild(tag);
  }
  var imgWrap = document.createElement("div");
  imgWrap.style.cssText = "flex:1;min-height:0;display:flex;flex-direction:column;gap:0.3em;";
  var hero = document.createElement("img");
  hero.alt = "Hero";
  hero.style.cssText = "width:100%;height:auto;max-height:" + (h * 0.38) + "px;object-fit:contain;";
  hero.src = (assets && assets.heroImage) || "";
  if (!hero.src) hero.style.background = "#eee";
  imgWrap.appendChild(hero);
  var draw = document.createElement("img");
  draw.alt = "Drawing";
  draw.style.cssText = "width:100%;height:auto;max-height:" + (h * 0.18) + "px;object-fit:contain;";
  draw.src = (assets && assets.engineeringDrawing) || "";
  if (!draw.src) draw.style.background = "#ddd";
  imgWrap.appendChild(draw);
  div.appendChild(imgWrap);
  if (front.features) {
    var feat = document.createElement("div");
    feat.className = "bb-features bb-scalable bb-balance";
    feat.style.cssText = "text-align:center;font-family:" + fontBody + ";font-size:calc(" + contentBase + "px * var(--bb-scale, 1));margin-top:0.3em;";
    feat.textContent = front.features;
    div.appendChild(feat);
  }
  return div;
}

function buildSectionBottom(w, h, spineBottom, back, style, backH) {
  var title = (spineBottom && spineBottom.title) || back.title || back.spineTitle || "";
  var subheadingBase = (backH || h) / 14;
  var fontTitle = getFontFamily(style.fontTitle);
  var div = document.createElement("div");
  div.className = "bb-section bb-bottom";
  div.style.cssText = "box-sizing:border-box;width:" + w + "px;height:" + h + "px;border:1px solid " + (style.borderColor || "#222") + ";padding:2%;display:flex;align-items:center;justify-content:center;overflow:hidden;";
  var span = document.createElement("span");
  span.className = "bb-scalable bb-balance";
  span.style.cssText = "color:" + (style.textColor || "#111") + ";font-family:" + fontTitle + ";font-size:calc(" + subheadingBase + "px * var(--bb-scale, 1));text-align:center;";
  span.textContent = title;
  div.appendChild(span);
  return div;
}

function buildSectionBack(w, h, back, style, assets) {
  var subheadingBase = h / 14;
  var contentBase = h / 20;
  var tinyBase = h / 35;
  var fontTitle = getFontFamily(style.fontTitle);
  var fontBody = getFontFamily(style.fontBody);
  var fontSmall = getFontFamily(style.fontSmall);
  var div = document.createElement("div");
  div.className = "bb-section bb-back";
  div.style.cssText = "box-sizing:border-box;width:" + w + "px;height:" + h + "px;border:1px solid " + (style.borderColor || "#222") + ";padding:4%;display:flex;flex-direction:column;overflow:hidden;color:" + (style.textColor || "#111") + ";";
  if (back.title || back.spineTitle) {
    var st = document.createElement("h2");
    st.className = "bb-scalable bb-balance";
    st.style.cssText = "text-align:center;font-family:" + fontTitle + ";font-size:calc(" + subheadingBase + "px * var(--bb-scale, 1));margin:0 0 0.5em 0;";
    st.textContent = back.title || back.spineTitle;
    div.appendChild(st);
  }
  if (back.specs && back.specs.length) {
    var ul = document.createElement("ul");
    ul.className = "bb-scalable";
    ul.style.cssText = "font-family:" + fontBody + ";font-size:calc(" + contentBase + "px * var(--bb-scale, 1));margin:0 0 0.5em 0;padding-left:1.2em;list-style:disc;";
    back.specs.forEach(function (s) {
      var li = document.createElement("li");
      li.textContent = s;
      ul.appendChild(li);
    });
    div.appendChild(ul);
    var hr1 = document.createElement("hr");
    hr1.style.cssText = "border:none;border-top:1px solid " + (style.borderColor || "#222") + ";margin:0.2em 0;";
    div.appendChild(hr1);
  }
  if (back.description) {
    var desc = document.createElement("div");
    desc.className = "bb-scalable";
    desc.style.cssText = "font-family:" + fontBody + ";font-size:calc(" + contentBase + "px * var(--bb-scale, 1));margin-bottom:0.5em;text-align:justify;white-space:pre-wrap;";
    desc.textContent = back.description;
    div.appendChild(desc);
    var hr2 = document.createElement("hr");
    hr2.style.cssText = "border:none;border-top:1px solid " + (style.borderColor || "#222") + ";margin:0.2em 0;";
    div.appendChild(hr2);
  }
  if (back.bullets && back.bullets.length) {
    var bul = document.createElement("ul");
    bul.className = "bb-scalable";
    bul.style.cssText = "font-family:" + fontBody + ";font-size:calc(" + contentBase + "px * var(--bb-scale, 1));margin:0 0 0.5em 0;padding-left:1.2em;list-style:disc;";
    back.bullets.forEach(function (b) {
      var li = document.createElement("li");
      li.textContent = b;
      bul.appendChild(li);
    });
    div.appendChild(bul);
    var hr3 = document.createElement("hr");
    hr3.style.cssText = "border:none;border-top:1px solid " + (style.borderColor || "#222") + ";margin:0.2em 0;";
    div.appendChild(hr3);
  }
  var footer = document.createElement("div");
  footer.style.cssText = "margin-top:auto;display:flex;flex-direction:column;gap:0;";
  var borderColor = style.borderColor || "#222";

  var qrRow = document.createElement("div");
  qrRow.style.cssText = "display:flex;align-items:center;gap:0.5em;padding:0.3em 0;";
  var qr = document.createElement("img");
  qr.alt = "QR";
  qr.style.cssText = "width:80px;height:80px;object-fit:contain;background:#eee;flex-shrink:0;";
  qr.src = (assets && assets.qrCode) || "";
  qrRow.appendChild(qr);
  if (back.qrLabel) {
    var qrLab = document.createElement("div");
    qrLab.className = "bb-scalable bb-balance";
    qrLab.style.cssText = "font-family:" + fontSmall + ";font-size:calc(" + tinyBase + "px * var(--bb-scale, 1));";
    qrLab.innerHTML = (back.qrLabel || "").split("\n").join("<br>");
    qrRow.appendChild(qrLab);
  }
  footer.appendChild(qrRow);

  var hrFooter = document.createElement("hr");
  hrFooter.style.cssText = "border:none;border-top:1px solid " + borderColor + ";margin:0.2em 0;";
  footer.appendChild(hrFooter);

  var barRow = document.createElement("div");
  barRow.style.cssText = "display:flex;align-items:center;gap:0.5em;padding:0.3em 0;";
  var bar = document.createElement("img");
  bar.alt = "Barcode";
  bar.style.cssText = "width:150px;height:50px;object-fit:contain;background:#eee;flex-shrink:0;";
  bar.src = (assets && assets.barcode) || "";
  barRow.appendChild(bar);
  if (back.model) {
    var mod = document.createElement("div");
    mod.className = "bb-scalable";
    mod.style.cssText = "font-family:" + fontSmall + ";font-size:calc(" + tinyBase + "px * var(--bb-scale, 1));";
    mod.textContent = back.model;
    barRow.appendChild(mod);
  }
  footer.appendChild(barRow);
  div.appendChild(footer);
  return div;
}

function loadAssets(paths) {
  var result = {};
  var keys = Object.keys(paths || {});
  var done = 0;
  return new Promise(function (resolve) {
    if (keys.length === 0) { resolve({}); return; }
    keys.forEach(function (key) {
      loadImage(paths[key]).then(function (img) {
        result[key] = img;
        done++;
        if (done === keys.length) resolve(result);
      });
    });
  });
}

function loadImage(src) {
  return new Promise(function (resolve) {
    var img = new Image();
    img.onload = function () { resolve(img); };
    img.onerror = function () { resolve(null); };
    img.src = src;
  });
}

function drawBorder(ctx, x, y, w, h, color) {
  ctx.strokeStyle = color || "#222";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);
}

function fontAtSize(baseFont, sizePx) {
  if (!baseFont) return baseFont;
  return (baseFont || "").replace(/\d+px/, Math.round(sizePx) + "px");
}

function drawHorizontalLine(ctx, x, y, w, color) {
  ctx.strokeStyle = color || "#222";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.stroke();
}

function drawDoubleLine(ctx, x, y, w, color) {
  ctx.strokeStyle = color || "#222";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y + 3);
  ctx.lineTo(x + w, y + 3);
  ctx.stroke();
}

function drawVerticalLine(ctx, x, y, h, color) {
  ctx.strokeStyle = color || "#222";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + h);
  ctx.stroke();
}

function drawPlaceholder(ctx, x, y, w, h, text) {
  ctx.strokeStyle = "#999";
  ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = "#999";
  ctx.font = "14px Arial";
  ctx.fillText(text, x + 10, y + 20);
}

function drawImageOrPlaceholder(ctx, img, x, y, w, h, label) {
  if (img) {
    ctx.drawImage(img, x, y, w, h);
  } else {
    drawPlaceholder(ctx, x, y, w, h, label);
  }
}

function drawFront(ctx, data, assets, x, y, w, h) {
  drawBorder(ctx, x, y, w, h, data.style.borderColor);
  ctx.fillStyle = data.style.textColor || "#111";

  var pad = Math.max(16, Math.min(w, h) * 0.04);
  var cx = x + w / 2;
  var contentW = w - pad * 2;
  var contentTop = y + pad;
  var contentBottom = y + h - pad;
  var availableH = contentBottom - contentTop;

  var headingSize = h / 10;
  var subheadingSize = h / 16;
  var contentSize = h / 22;
  var tinySize = h / 38;
  var gapAfterDoubleLine = subheadingSize * 1.4;

  ctx.font = fontAtSize(data.style.fontSubtitle, subheadingSize);
  var eyebrowH = data.content.front.eyebrow
    ? measureWrapHeight(ctx, data.content.front.eyebrow, contentW, subheadingSize * 1.2) + subheadingSize * 0.3 + 6 + gapAfterDoubleLine
    : 0;
  ctx.font = fontAtSize(data.style.fontTitle, headingSize);
  var titleH = measureWrapHeight(ctx, data.content.front.title, contentW, headingSize * 1.1) + headingSize * 0.4;
  ctx.font = fontAtSize(data.style.fontSubtitle, contentSize);
  var subtitleH = data.content.front.subtitle
    ? measureWrapHeight(ctx, data.content.front.subtitle, contentW, contentSize * 1.3) + contentSize * 0.2
    : 0;
  ctx.font = fontAtSize(data.style.fontBody, contentSize);
  var taglineH = measureWrapHeight(ctx, data.content.front.tagline, contentW, contentSize * 1.3) + contentSize * 0.5;
  var imgH = Math.min(h * 0.35, Math.max(60, availableH * 0.45));
  var drawH = Math.min(h * 0.15, 100);
  ctx.font = fontAtSize(data.style.fontBody, contentSize);
  var featuresH = data.content.front.features
    ? measureWrapHeight(ctx, data.content.front.features, contentW, contentSize * 1.2)
    : 0;

  var totalNeededH = eyebrowH + titleH + subtitleH + taglineH + contentSize + imgH + contentSize + drawH + contentSize + featuresH;
  var scale = totalNeededH > availableH ? Math.max(0.5, availableH / totalNeededH) : 1;
  if (scale < 1) {
    headingSize *= scale;
    subheadingSize *= scale;
    contentSize *= scale;
    tinySize *= scale;
    gapAfterDoubleLine = subheadingSize * 1.4;
    imgH *= scale;
    drawH *= scale;
  }

  var textY = contentTop;

  if (data.content.front.eyebrow) {
    ctx.font = fontAtSize(data.style.fontSubtitle, subheadingSize);
    textY = wrapTextCentered(ctx, data.content.front.eyebrow, cx, textY, contentW, subheadingSize * 1.2) + subheadingSize * 0.3;
    drawDoubleLine(ctx, x + pad, textY, contentW, data.style.borderColor);
    textY += 6 + gapAfterDoubleLine;
  }

  ctx.font = fontAtSize(data.style.fontTitle, headingSize);
  textY = wrapTextCentered(ctx, data.content.front.title, cx, textY, contentW, headingSize * 1.1) + headingSize * 0.4;

  if (data.content.front.subtitle) {
    ctx.font = fontAtSize(data.style.fontSubtitle, contentSize);
    textY = wrapTextCentered(ctx, data.content.front.subtitle, cx, textY, contentW, contentSize * 1.3) + contentSize * 0.2;
  }
  ctx.font = fontAtSize(data.style.fontBody, contentSize);
  textY = wrapTextCentered(ctx, data.content.front.tagline, cx, textY, contentW, contentSize * 1.3) + contentSize * 0.5;

  imgH = Math.min(imgH, Math.max(60, contentBottom - textY - drawH - contentSize * 3));
  drawImageOrPlaceholder(ctx, assets.heroImage, x + pad, textY, contentW, imgH, "Hero Image");
  textY += imgH + contentSize;

  drawImageOrPlaceholder(ctx, assets.engineeringDrawing, x + pad, textY, contentW, drawH, "Engineering Drawing");
  textY += drawH + contentSize;

  if (data.content.front.features) {
    ctx.font = fontAtSize(data.style.fontBody, contentSize);
    var featuresHeight = measureWrapHeight(ctx, data.content.front.features, contentW, contentSize * 1.2);
    wrapTextCentered(ctx, data.content.front.features, cx, contentBottom - pad - featuresHeight, contentW, contentSize * 1.2);
  }
}

function drawSpine(ctx, data, assets, x, y, w, h) {
  drawBorder(ctx, x, y, w, h, data.style.borderColor);
  var title = (data.content.back && data.content.back.title) || (data.content.back && data.content.back.spineTitle) || (data.content.spine && data.content.spine.title) || "";
  if (!title) return;
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = data.style.textColor || "#111";
  ctx.font = fontAtSize(data.style.fontBody, Math.min(w, h) / 12);
  ctx.fillText(title, -h / 2 + Math.max(8, h * 0.04), 0);
  ctx.restore();
}

function drawBack(ctx, data, assets, x, y, w, h) {
  drawBorder(ctx, x, y, w, h, data.style.borderColor);
  ctx.fillStyle = data.style.textColor || "#111";

  var pad = Math.max(16, Math.min(w, h) * 0.04);
  var cx = x + w / 2;
  var contentW = w - pad * 2;
  var contentTop = y + pad;
  var contentBottom = y + h - pad;
  var availableH = contentBottom - contentTop;

  var subheadingSize = h / 16;
  var contentSize = h / 22;
  var tinySize = h / 38;
  var lineH = contentSize * 1.3;

  var qrSize = Math.min(100, w * 0.2);
  var barcodeH = 60;
  var footerH = qrSize + tinySize * 3 + barcodeH;

  ctx.font = fontAtSize(data.style.fontBody, contentSize);
  var titleH = 0;
  var specsH = 0;
  var descriptionH = 0;
  var bulletsH = 0;
  var back = data.content.back || {};
  if (back.title) titleH = subheadingSize * 1.3;
  if (back.specs && back.specs.length) specsH = (lineH + 2) * back.specs.length + lineH * 1.5;
  if (back.description) descriptionH = measureWrapHeight(ctx, back.description, contentW, lineH) + lineH;
  if (back.bullets && back.bullets.length) bulletsH = (lineH + 2) * back.bullets.length + lineH * 1.5;

  var totalContentH = titleH + specsH + descriptionH + bulletsH + lineH;
  var contentAreaH = availableH - footerH;
  var scale = totalContentH > contentAreaH ? Math.max(0.5, contentAreaH / totalContentH) : 1;
  if (scale < 1) {
    subheadingSize *= scale;
    contentSize *= scale;
    tinySize *= scale;
    lineH = contentSize * 1.3;
    footerH = qrSize + tinySize * 3 + barcodeH;
  }

  var textY = contentTop;

  if (back.title) {
    ctx.font = fontAtSize(data.style.fontTitle, subheadingSize);
    fillTextCentered(ctx, back.title, cx, textY);
    textY += subheadingSize * 1.3;
  }
  if (back.specs && back.specs.length) {
    ctx.font = fontAtSize(data.style.fontBody, contentSize);
    back.specs.forEach(function (s) {
      ctx.fillText("• " + s, x + pad, textY);
      textY += lineH + 2;
    });
    textY += lineH * 0.5;
    drawHorizontalLine(ctx, x + pad, textY, contentW, data.style.borderColor);
    textY += lineH;
  }

  if (back.description) {
    ctx.font = fontAtSize(data.style.fontBody, contentSize);
    textY = wrapText(ctx, back.description, x + pad, textY, contentW, lineH) + lineH * 0.5;
    drawHorizontalLine(ctx, x + pad, textY, contentW, data.style.borderColor);
    textY += lineH;
  }

  (back.bullets || []).forEach(function (b) {
    ctx.font = fontAtSize(data.style.fontBody, contentSize);
    ctx.fillText("• " + b, x + pad, textY);
    textY += lineH + 2;
  });
  textY += lineH * 0.5;
  drawHorizontalLine(ctx, x + pad, textY, contentW, data.style.borderColor);
  textY += lineH;

  var footerTop = contentBottom - pad - footerH;
  drawImageOrPlaceholder(ctx, assets.qrCode, x + pad, footerTop, qrSize, qrSize, "QR");
  ctx.font = fontAtSize(data.style.fontSmall, tinySize);
  (back.qrLabel || "").split("\n").forEach(function (line, i) {
    ctx.fillText(line, x + pad + qrSize + 12, footerTop + tinySize + i * (tinySize + 4));
  });

  drawImageOrPlaceholder(ctx, assets.barcode, x + w - pad - 180, contentBottom - pad - barcodeH - tinySize, 180, barcodeH, "Barcode");
  ctx.fillText(back.model || "", x + w - pad - 180, contentBottom - pad - tinySize);
}

function drawBottom(ctx, data, assets, x, y, w, h) {
  drawBorder(ctx, x, y, w, h, data.style.borderColor);
  var title = (data.content.back && data.content.back.title) || (data.content.back && data.content.back.spineTitle) || (data.content.spine && data.content.spine.title) || "";
  if (!title) return;
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.font = fontAtSize(data.style.fontBody, Math.min(w, h) / 12);
  ctx.fillStyle = data.style.textColor || "#111";
  ctx.fillText(title, -h / 2 + Math.max(8, h * 0.04), 0);
  ctx.restore();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  if (!text) return y;
  var paragraphs = text.split("\n");
  paragraphs.forEach(function (p) {
    var words = p.split(" ");
    var line = "";
    for (var n = 0; n < words.length; n++) {
      var testLine = line + words[n] + " ";
      var metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = words[n] + " ";
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
    y += lineHeight;
  });
  return y;
}

function wrapTextCentered(ctx, text, cx, y, maxWidth, lineHeight) {
  if (!text) return y;
  var paragraphs = text.split("\n");
  paragraphs.forEach(function (p) {
    var words = p.split(" ");
    var line = "";
    for (var n = 0; n < words.length; n++) {
      var testLine = line + words[n] + " ";
      var metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, cx - ctx.measureText(line).width / 2, y);
        line = words[n] + " ";
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, cx - ctx.measureText(line).width / 2, y);
    y += lineHeight;
  });
  return y;
}

function fillTextCentered(ctx, text, cx, y) {
  ctx.fillText(text, cx - ctx.measureText(text).width / 2, y);
}

function measureWrapHeight(ctx, text, maxWidth, lineHeight) {
  if (!text) return 0;
  var total = 0;
  var paragraphs = text.split("\n");
  paragraphs.forEach(function (p) {
    var words = p.split(" ");
    var line = "";
    for (var n = 0; n < words.length; n++) {
      var testLine = line + words[n] + " ";
      var metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        total += lineHeight;
        line = words[n] + " ";
      } else {
        line = testLine;
      }
    }
    total += lineHeight;
  });
  return total;
}
