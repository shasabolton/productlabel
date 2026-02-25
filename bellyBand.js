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
    pageDiv._bellyBand = this;
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
      col.appendChild(buildSectionBottom(sectionW, bottomH, spineBottom, back, style, backH, assets));
      col.appendChild(buildSectionBack(sectionW, backH, back, style, assets, true));
      pageDiv.appendChild(col);
    } else {
      var leftCol = document.createElement("div");
      leftCol.style.cssText = "display:flex;flex-direction:column;flex:0 0 auto;width:" + colW + "px;";
      leftCol.appendChild(buildSectionTop(sectionW, topH, spineTop, back, style, backH));
      leftCol.appendChild(buildSectionFront(sectionW, frontH, front, style, assets));
      leftCol.appendChild(buildSectionBottom(sectionW, bottomH, spineBottom, back, style, backH, assets));

      var rightCol = document.createElement("div");
      rightCol.style.cssText = "display:flex;flex-direction:column;flex:0 0 auto;width:" + colW + "px;margin-left:" + gapPx + "px;";
      var spacer = document.createElement("div");
      spacer.style.cssText = "height:" + topH + "px;flex-shrink:0;";
      rightCol.appendChild(spacer);
      rightCol.appendChild(buildSectionBack(sectionW, backH, back, style, assets, false));

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
        self.sizeBackSectionLogos(pageDiv);
      });
    });
  }

  sizeBackSectionLogos(pageDiv) {
    var logoMaxPx = Math.floor(100 * 300 / 25.4);
    var logoPad = 12;
    var sections = pageDiv.querySelectorAll(".bb-section.bb-back");
    for (var i = 0; i < sections.length; i++) {
      var section = sections[i];
      var contentWrap = section.children[1];
      if (!contentWrap) continue;
      var logoWrap = contentWrap.querySelector(".bb-logo-wrap");
      if (!logoWrap) continue;
      var logo = logoWrap.querySelector(".bb-spine-logo") || logoWrap.querySelector("img");
      if (!logo) continue;
      var contentRect = contentWrap.getBoundingClientRect();
      var wrapRect = logoWrap.getBoundingClientRect();
      var availableH = contentRect.bottom - wrapRect.top;
      var innerH = Math.max(0, availableH - logoPad * 2);
      var logoH = Math.min(innerH, logoMaxPx);
      if (logoH <= 0) continue;
      logo.style.height = logoH + "px";
      logo.style.width = "auto";
      if (logo.naturalWidth && logo.naturalHeight) sizeImgForExport(logo, logoMaxPx, logoH);
    }
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
      d.assets = d.assets || {};
      if (!d.assets.spineLogo) d.assets.spineLogo = "photos/logo/logosb.jpg";
      return d;
    }
    var th = selectedTheme || { headings: "Harrington", headingsWeight: "400", body: "Arial" };
    var defaultAssets = d.assets || {};
    if (!defaultAssets.spineLogo) defaultAssets = Object.assign({ spineLogo: "photos/logo/logosb.jpg" }, defaultAssets);
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
      assets: defaultAssets
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

// html2canvas ignores object-fit, so set explicit dimensions to avoid stretching.
function sizeImgForExport(img, maxW, maxH) {
  if (!img.naturalWidth || !img.naturalHeight) return;
  var r = img.naturalWidth / img.naturalHeight;
  var w, he;
  if (maxW / maxH > r) {
    he = maxH;
    w = maxH * r;
  } else {
    w = maxW;
    he = maxW / r;
  }
  img.style.width = w + "px";
  img.style.height = he + "px";
}

function imageHasAlpha(img, callback) {
  if (!img.naturalWidth || !img.naturalHeight) { callback(false); return; }
  try {
    var canvas = document.createElement("canvas");
    canvas.width = Math.min(img.naturalWidth, 64);
    canvas.height = Math.min(img.naturalHeight, 64);
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    var data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    for (var i = 3; i < data.length; i += 4) {
      if (data[i] < 255) { callback(true); return; }
    }
    callback(false);
  } catch (e) {
    callback(false);
  }
}

function getAlphaBoundingBoxX(img, callback) {
  getAlphaBoundingBox(img, function (bbox) {
    if (!bbox) { callback(null); return; }
    callback({ minX: bbox.minX, maxX: bbox.maxX, contentWidth: bbox.contentWidth, contentCenterX: bbox.contentCenterX });
  });
}

function getAlphaBoundingBox(img, callback) {
  if (!img.naturalWidth || !img.naturalHeight) { callback(null); return; }
  var alphaThreshold = 10;
  var maxDim = 400;
  try {
    var cw = img.naturalWidth;
    var ch = img.naturalHeight;
    if (cw > maxDim || ch > maxDim) {
      var s = maxDim / Math.max(cw, ch);
      cw = Math.max(1, Math.round(cw * s));
      ch = Math.max(1, Math.round(ch * s));
    }
    var canvas = document.createElement("canvas");
    canvas.width = cw;
    canvas.height = ch;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, cw, ch);
    var data = ctx.getImageData(0, 0, cw, ch).data;
    var minX = cw, maxX = -1, minY = ch, maxY = -1;
    for (var y = 0; y < ch; y++) {
      for (var x = 0; x < cw; x++) {
        var i = (y * cw + x) * 4 + 3;
        if (data[i] > alphaThreshold) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX < minX || maxY < minY) { callback(null); return; }
    var toNaturalW = img.naturalWidth / cw;
    var toNaturalH = img.naturalHeight / ch;
    var contentWidth = (maxX - minX + 1) * toNaturalW;
    var contentHeight = (maxY - minY + 1) * toNaturalH;
    var contentCenterX = (minX + maxX) / 2 * toNaturalW;
    var contentCenterY = (minY + maxY) / 2 * toNaturalH;
    callback({
      minX: minX * toNaturalW, maxX: maxX * toNaturalW,
      minY: minY * toNaturalH, maxY: maxY * toNaturalH,
      contentWidth: contentWidth, contentHeight: contentHeight,
      contentCenterX: contentCenterX, contentCenterY: contentCenterY
    });
  } catch (e) {
    callback(null);
  }
}

function imageUrlSuggestsAlpha(url) {
  if (!url || typeof url !== "string") return false;
  return /\.(png|webp)(\?|#|$)/i.test(url.split("/").pop());
}

function buildSectionTop(w, h, spineTop, back, style, backH) {
  var title = (spineTop && spineTop.title) || back.title || back.spineTitle || "";
  var subheadingBase = (backH || h) / 14;
  var fontTitle = getFontFamily(style.fontTitle);
  var div = document.createElement("div");
  div.className = "bb-section bb-top";
  div.style.cssText = "box-sizing:border-box;width:" + w + "px;height:" + h + "px;border:8px solid " + (style.borderColor || "#222") + ";padding:2%;display:flex;align-items:center;justify-content:center;overflow:hidden;";
  var span = document.createElement("span");
  span.className = "bb-scalable bb-balance";
  span.style.cssText = "color:" + (style.textColor || "#111") + ";font-family:" + fontTitle + ";font-size:calc(" + subheadingBase + "px * var(--bb-scale, 1));text-align:center;";
  span.textContent = title;
  div.appendChild(span);
  return div;
}

function buildDecorDoubleLineBand(borderColor) {
  var gap = 12;
  var lineThick = 8;
  var bandH = gap + lineThick + gap + lineThick;
  var c = borderColor || "#222";
  var wrap = document.createElement("div");
  wrap.style.cssText = "flex-shrink:0;height:" + bandH + "px;opacity:0.5;padding-top:" + gap + "px;box-sizing:border-box;";
  var l1 = document.createElement("hr");
  l1.style.cssText = "border:none;border-top:" + lineThick + "px solid " + c + ";margin:0;";
  wrap.appendChild(l1);
  var spacer = document.createElement("div");
  spacer.style.cssText = "height:" + gap + "px;";
  wrap.appendChild(spacer);
  var l2 = document.createElement("hr");
  l2.style.cssText = "border:none;border-top:" + lineThick + "px solid " + c + ";margin:0;";
  wrap.appendChild(l2);
  return wrap;
}

function buildSectionFront(w, h, front, style, assets) {
  var headingBase = h / 8;
  var subheadingBase = h / 14;
  var contentBase = h / 20;
  var fontTitle = getFontFamily(style.fontTitle);
  var fontSubtitle = getFontFamily(style.fontSubtitle);
  var fontBody = getFontFamily(style.fontBody);
  var borderColor = style.borderColor || "#222";
  var div = document.createElement("div");
  div.className = "bb-section bb-front";
  div.style.cssText = "box-sizing:border-box;width:" + w + "px;height:" + h + "px;border:8px solid " + borderColor + ";padding:12px 0;margin-top:-8px;display:flex;flex-direction:column;overflow:visible;color:" + (style.textColor || "#111") + ";position:relative;";
  var bandH = 12 + 8 + 12 + 8;
  var sectionContentW = w - 16;
  var oneMargin = sectionContentW * 0.04;
  var targetAlphaW = sectionContentW + oneMargin;
  var sectionBg = style.backgroundColor || "#fff";
  var hero = document.createElement("img");
  hero.alt = "Hero";
  hero.crossOrigin = "anonymous";
  hero.style.cssText = "position:absolute;left:0;top:0;width:" + targetAlphaW + "px;height:auto;display:block;";
  hero.src = (assets && assets.heroImage) ? String(assets.heroImage) : "";
  if (!hero.src) hero.style.background = "#eee";
  if (hero.src) {
    hero.onload = function () {
      getAlphaBoundingBox(this, function (bbox) {
        if (bbox && bbox.contentWidth > 0) {
          var scale = targetAlphaW / bbox.contentWidth;
          var imgW = this.naturalWidth * scale;
          var imgH = this.naturalHeight * scale;
          var heroLeft = -bbox.minX * scale - oneMargin / 2;
          this.style.width = imgW + "px";
          this.style.height = imgH + "px";
          this.style.left = heroLeft + "px";
          var alphaReachesBottom = bbox.maxY >= this.naturalHeight * 0.995;
          var fadeOverlay = null;
          var fadeHeight = 0;
          var applyHeroFade = false;
          if (alphaReachesBottom && bbox.contentHeight > 0 && applyHeroFade) {
            var alphaH = bbox.contentHeight * scale;
            fadeHeight = Math.max(8, 0.05 * alphaH);
            fadeOverlay = document.createElement("div");
            fadeOverlay.setAttribute("aria-hidden", "true");
            fadeOverlay.style.cssText = "position:absolute;left:" + heroLeft + "px;width:" + imgW + "px;height:" + fadeHeight + "px;pointer-events:none;background:linear-gradient(to top, " + sectionBg + " 0%, transparent 100%);";
            fadeOverlay.style.top = (imgH - fadeHeight) + "px";
            div.appendChild(fadeOverlay);
          }
          var section = this.parentElement;
          var taglineEl = section && section.querySelector(".bb-tagline");
          if (taglineEl) {
            var self = this;
            var bboxY = bbox.minY;
            var scaleY = scale;
            var overlay = fadeOverlay;
            var fh = fadeHeight;
            requestAnimationFrame(function () {
              requestAnimationFrame(function () {
                if (!section.isConnected) return;
                var sectionRect = section.getBoundingClientRect();
                var taglineRect = taglineEl.getBoundingClientRect();
                var taglineBottomFromSectionTop = taglineRect.bottom - sectionRect.top;
                var top = Math.max(0, taglineBottomFromSectionTop - bboxY * scaleY);
                self.style.top = top + "px";
                if (overlay && fh) {
                  overlay.style.top = (top + imgH - fh) + "px";
                  overlay.style.left = heroLeft + "px";
                }
                var heroSpacer = section.querySelector(".bb-hero-spacer");
                if (heroSpacer) heroSpacer.style.height = Math.max(0, top + imgH - taglineBottomFromSectionTop) + "px";
              });
            });
          } else if (fadeOverlay) {
            fadeOverlay.style.top = (imgH - fadeHeight) + "px";
          }
          if (!taglineEl) {
            var sectionRef = this.parentElement;
            var spacerRef = sectionRef && sectionRef.querySelector(".bb-hero-spacer");
            var imgHNoTag = imgH;
            if (spacerRef) {
              requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                  if (!sectionRef || !sectionRef.isConnected) return;
                  var prev = spacerRef.previousElementSibling;
                  var aboveBottom = prev ? (prev.getBoundingClientRect().bottom - sectionRef.getBoundingClientRect().top) : bandH * 2;
                  spacerRef.style.height = Math.max(0, imgHNoTag - aboveBottom) + "px";
                });
              });
            }
          }
        } else {
          this.style.width = targetAlphaW + "px";
          this.style.height = "auto";
        }
      }.bind(this));
    };
  }
  div.appendChild(hero);
  div.appendChild(buildDecorDoubleLineBand(borderColor));
  var contentWrap = document.createElement("div");
  contentWrap.style.cssText = "flex:1;min-height:0;display:flex;flex-direction:column;padding:" + bandH + "px 4% " + bandH + "px 4%;box-sizing:border-box;overflow:visible;";
  if (front.eyebrow) {
    var eb = document.createElement("div");
    eb.className = "bb-eyebrow bb-scalable bb-balance";
    eb.style.cssText = "text-align:center;font-family:" + fontSubtitle + ";font-size:calc(" + subheadingBase + "px * var(--bb-scale, 1));margin-bottom:0.3em;";
    eb.textContent = front.eyebrow;
    contentWrap.appendChild(eb);
    var dl = document.createElement("hr");
    dl.style.cssText = "border:none;border-top:2px solid " + borderColor + ";margin:0.2em 0 0.5em 0;opacity:1;";
    contentWrap.appendChild(dl);
    var dl2 = document.createElement("hr");
    dl2.style.cssText = "border:none;border-top:1px solid " + borderColor + ";margin:-3px 0 0.5em 0;opacity:1;";
    contentWrap.appendChild(dl2);
  }
  if (front.title) {
    var tit = document.createElement("h1");
    tit.className = "bb-title bb-scalable bb-balance";
    tit.style.cssText = "text-align:center;font-family:" + fontTitle + ";font-size:calc(" + headingBase + "px * var(--bb-scale, 1));margin:0 0 0.3em 0;line-height:1.1;";
    tit.textContent = front.title;
    contentWrap.appendChild(tit);
  }
  if (front.subtitle) {
    var sub = document.createElement("div");
    sub.className = "bb-subtitle bb-scalable bb-balance";
    sub.style.cssText = "text-align:center;font-family:" + fontSubtitle + ";font-style:italic;font-size:calc(" + contentBase + "px * var(--bb-scale, 1));margin-bottom:0.2em;";
    sub.textContent = front.subtitle;
    contentWrap.appendChild(sub);
  }
  if (front.tagline) {
    var tag = document.createElement("div");
    tag.className = "bb-tagline bb-scalable bb-balance";
    tag.style.cssText = "text-align:center;font-family:" + fontBody + ";font-size:calc(" + contentBase + "px * var(--bb-scale, 1));margin-bottom:0.5em;";
    tag.textContent = front.tagline;
    contentWrap.appendChild(tag);
  }
  var heroSpacer = document.createElement("div");
  heroSpacer.className = "bb-hero-spacer";
  heroSpacer.style.cssText = "flex-shrink:0;height:0;";
  contentWrap.appendChild(heroSpacer);
  var dividerStyle = "border:none;border-top:8px solid " + borderColor + ";margin:0.2em 0;opacity:0.5;";
  var hrHeroDraw = document.createElement("hr");
  hrHeroDraw.style.cssText = dividerStyle;
  contentWrap.appendChild(hrHeroDraw);
  var imgBlock = document.createElement("div");
  imgBlock.style.cssText = "flex:1;min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;margin-top:0.3em;";
  // Engineering drawing below hero: max width = border width, height fits above features (flex space)
  var draw = document.createElement("img");
  draw.alt = "Drawing";
  var drawUrl = (assets && assets.engineeringDrawing) ? String(assets.engineeringDrawing) : "";
  if (drawUrl && !/\.svg(\?|#|$)/i.test(drawUrl)) draw.crossOrigin = "anonymous";
  draw.style.cssText = "max-width:" + sectionContentW + "px;width:100%;max-height:100%;object-fit:contain;object-position:top;display:block;";
  draw.src = drawUrl;
  if (!draw.src) draw.style.background = "#ddd";
  imgBlock.appendChild(draw);
  contentWrap.appendChild(imgBlock);
  if (front.features) {
    var feat = document.createElement("div");
    feat.className = "bb-features bb-scalable bb-balance";
    feat.style.cssText = "text-align:center;font-family:" + fontBody + ";font-size:calc(" + contentBase + "px * var(--bb-scale, 1));margin-top:0.3em;";
    feat.textContent = front.features;
    contentWrap.appendChild(feat);
  }
  div.appendChild(contentWrap);
  div.appendChild(buildDecorDoubleLineBand(borderColor));
  return div;
}

function buildSectionBottom(w, h, spineBottom, back, style, backH, assets) {
  var pad = Math.max(4, w * 0.02);
  var contentW = w - 2 * pad;
  var barH = Math.max(12, Math.floor(contentW / 3));
  var div = document.createElement("div");
  div.className = "bb-section bb-bottom";
  div.style.cssText = "box-sizing:border-box;width:" + w + "px;height:" + h + "px;border:8px solid " + (style.borderColor || "#222") + ";padding:2%;margin-top:-8px;display:flex;align-items:center;justify-content:center;overflow:hidden;";
  var bar = document.createElement("img");
  bar.alt = "Barcode";
  bar.crossOrigin = "anonymous";
  bar.style.cssText = "max-width:100%;width:" + contentW + "px;height:" + barH + "px;object-fit:contain;background:#eee;";
  bar.src = (assets && assets.barcode) ? String(assets.barcode) : "";
  if (bar.src) bar.onload = function () { sizeImgForExport(this, contentW, barH); };
  if (!bar.src) bar.style.background = "#ddd";
  div.appendChild(bar);
  return div;
}

function buildSectionBack(w, h, back, style, assets, stackAfter) {
  if (stackAfter === undefined) stackAfter = true;
  var subheadingBase = h / 14;
  var contentBase = h / 20;
  var tinyBase = h / 35;
  var fontTitle = getFontFamily(style.fontTitle);
  var fontBody = getFontFamily(style.fontBody);
  var fontSmall = getFontFamily(style.fontSmall);
  var borderColor = style.borderColor || "#222";
  var bandH = 12 + 8 + 12 + 8;
  var dividerStyle = "border:none;border-top:8px solid " + borderColor + ";margin:0.2em 0;opacity:0.5;";
  var div = document.createElement("div");
  div.className = "bb-section bb-back";
  div.style.cssText = "box-sizing:border-box;width:" + w + "px;height:" + h + "px;border:8px solid " + borderColor + ";padding:12px 0;" + (stackAfter ? "margin-top:-8px;" : "") + "display:flex;flex-direction:column;overflow:hidden;color:" + (style.textColor || "#111") + ";";
  div.appendChild(buildDecorDoubleLineBand(borderColor));
  var contentWrap = document.createElement("div");
  contentWrap.style.cssText = "flex:1;min-height:0;display:flex;flex-direction:column;padding:" + bandH + "px 4% " + bandH + "px 4%;box-sizing:border-box;overflow:hidden;";
  if (back.title || back.spineTitle) {
    var st = document.createElement("h2");
    st.className = "bb-scalable bb-balance";
    st.style.cssText = "text-align:center;font-family:" + fontTitle + ";font-size:calc(" + subheadingBase + "px * var(--bb-scale, 1));margin:0 0 0.5em 0;";
    st.textContent = back.title || back.spineTitle;
    contentWrap.appendChild(st);
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
    contentWrap.appendChild(ul);
    var hr1 = document.createElement("hr");
    hr1.style.cssText = dividerStyle;
    contentWrap.appendChild(hr1);
  }
  if (back.description) {
    var desc = document.createElement("div");
    desc.className = "bb-scalable";
    desc.style.cssText = "font-family:" + fontBody + ";font-size:calc(" + contentBase + "px * var(--bb-scale, 1));margin-bottom:0.5em;text-align:justify;white-space:pre-wrap;";
    desc.textContent = back.description;
    contentWrap.appendChild(desc);
    var hr2 = document.createElement("hr");
    hr2.style.cssText = dividerStyle;
    contentWrap.appendChild(hr2);
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
    contentWrap.appendChild(bul);
    var hr3 = document.createElement("hr");
    hr3.style.cssText = dividerStyle;
    contentWrap.appendChild(hr3);
  }
  var footer = document.createElement("div");
  footer.style.cssText = "margin-top:auto;display:flex;flex-direction:column;gap:0;padding-bottom:" + bandH + "px;box-sizing:border-box;";

  var contentWidthPx = w * (1 - 0.08);
  var halfBandPx = contentWidthPx / 2;
  var maxSizePx = Math.floor(40 * 300 / 25.4);
  var codeSizePx = Math.min(halfBandPx, maxSizePx);
  var logoMaxPx = Math.floor(100 * 300 / 25.4);

  var qrBlock = document.createElement("div");
  qrBlock.style.cssText = "display:flex;flex-direction:column;gap:0.25em;padding:0.3em 0;";

  var imagesRow = document.createElement("div");
  imagesRow.style.cssText = "display:flex;align-items:center;gap:0.5em;flex-shrink:0;";
  var qr = document.createElement("img");
  qr.alt = "QR";
  qr.crossOrigin = "anonymous";
  qr.style.cssText = "width:" + codeSizePx + "px;height:" + codeSizePx + "px;object-fit:contain;background:#eee;flex-shrink:0;";
  qr.src = (assets && assets.qrCode) || "";
  if (qr.src) qr.onload = function () { sizeImgForExport(this, codeSizePx, codeSizePx); };
  imagesRow.appendChild(qr);
  var smallImg = document.createElement("img");
  smallImg.alt = "Product";
  smallImg.crossOrigin = "anonymous";
  smallImg.style.cssText = "width:" + codeSizePx + "px;height:" + codeSizePx + "px;object-fit:contain;background:#eee;flex-shrink:0;";
  smallImg.src = (assets && assets.smallImage) ? String(assets.smallImage) : "";
  if (smallImg.src && !/\.svg(\?|#|$)/i.test(smallImg.src)) smallImg.crossOrigin = "anonymous";
  if (smallImg.src) smallImg.onload = function () { sizeImgForExport(this, codeSizePx, codeSizePx); };
  if (!smallImg.src) smallImg.style.background = "#ddd";
  imagesRow.appendChild(smallImg);
  qrBlock.appendChild(imagesRow);

  if (back.qrLabel) {
    var qrLab = document.createElement("div");
    qrLab.className = "bb-scalable bb-balance";
    qrLab.style.cssText = "font-family:" + fontSmall + ";font-size:calc(" + tinyBase + "px * var(--bb-scale, 1));";
    qrLab.innerHTML = (back.qrLabel || "").split("\n").join("<br>");
    qrBlock.appendChild(qrLab);
  }

  footer.appendChild(qrBlock);

  var hrFooter = document.createElement("hr");
  hrFooter.style.cssText = dividerStyle;
  footer.appendChild(hrFooter);

  var logoPad = 12;
  var logoWrap = document.createElement("div");
  logoWrap.className = "bb-logo-wrap";
  logoWrap.style.cssText = "flex-shrink:0;display:flex;align-items:center;justify-content:flex-start;padding:" + logoPad + "px 0;box-sizing:border-box;";
  var logo = document.createElement("img");
  logo.alt = "Logo";
  logo.className = "bb-spine-logo";
  logo.crossOrigin = "anonymous";
  logo.style.cssText = "height:auto;width:auto;max-width:" + Math.min(contentWidthPx, logoMaxPx) + "px;object-fit:contain;display:block;background:transparent;";
  logo.src = (assets && assets.spineLogo) ? String(assets.spineLogo) : "";
  if (logo.src && !/\.svg(\?|#|$)/i.test(logo.src)) logo.crossOrigin = "anonymous";
  if (logo.src) logo.onload = function () {
    var page = document.getElementById("belly-band-page");
    if (page && page._bellyBand && page._bellyBand.sizeBackSectionLogos) page._bellyBand.sizeBackSectionLogos(page);
  };
  if (!logo.src) logo.style.background = "#eee";
  logoWrap.appendChild(logo);
  footer.appendChild(logoWrap);
  contentWrap.appendChild(footer);
  div.appendChild(contentWrap);
  div.appendChild(buildDecorDoubleLineBand(borderColor));
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

  var contentWidthPx = contentW;
  var halfBandPx = contentWidthPx / 2;
  var maxSizePx = Math.floor(40 * 300 / 25.4);
  var codeSizePx = Math.min(halfBandPx, maxSizePx);
  var qrSize = codeSizePx;
  var logoMaxPx = Math.floor(100 * 300 / 25.4);
  var back = data.content.back || {};
  var qrLabelLines = (back.qrLabel || "").split("\n").filter(Boolean).length;
  var qrLabelH = qrLabelLines ? 6 + qrLabelLines * (tinySize + 4) : 0;
  var footerMinH = qrSize + 6 + qrLabelH + 8;

  ctx.font = fontAtSize(data.style.fontBody, contentSize);
  var titleH = 0;
  var specsH = 0;
  var descriptionH = 0;
  var bulletsH = 0;
  if (back.title) titleH = subheadingSize * 1.3;
  if (back.specs && back.specs.length) specsH = (lineH + 2) * back.specs.length + lineH * 1.5;
  if (back.description) descriptionH = measureWrapHeight(ctx, back.description, contentW, lineH) + lineH;
  if (back.bullets && back.bullets.length) bulletsH = (lineH + 2) * back.bullets.length + lineH * 1.5;

  var totalContentH = titleH + specsH + descriptionH + bulletsH + lineH;
  var availableLogoH = Math.max(0, availableH - totalContentH - footerMinH);
  var logoH = Math.min(availableLogoH, logoMaxPx);
  var aspect = (assets && assets.spineLogo && assets.spineLogo.naturalWidth && assets.spineLogo.naturalHeight) ? assets.spineLogo.naturalHeight / assets.spineLogo.naturalWidth : 0.4;
  var logoW = aspect > 0 ? logoH / aspect : logoH * 2.5;
  if (logoW > logoMaxPx) {
    logoW = logoMaxPx;
    logoH = logoW * aspect;
  }
  var footerH = footerMinH + logoH;
  var contentAreaH = availableH - footerH;
  var scale = totalContentH > contentAreaH ? Math.max(0.5, contentAreaH / totalContentH) : 1;
  if (scale < 1) {
    subheadingSize *= scale;
    contentSize *= scale;
    tinySize *= scale;
    lineH = contentSize * 1.3;
    qrLabelH = qrLabelLines ? 6 + qrLabelLines * (tinySize + 4) : 0;
    footerMinH = qrSize + 6 + qrLabelH + 8;
    availableLogoH = Math.max(0, availableH - totalContentH - footerMinH);
    logoH = Math.min(availableLogoH, logoMaxPx);
    logoW = aspect > 0 ? logoH / aspect : logoH * 2.5;
    if (logoW > logoMaxPx) {
      logoW = logoMaxPx;
      logoH = logoW * aspect;
    }
    footerH = footerMinH + logoH;
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
  drawImageOrPlaceholder(ctx, assets.smallImage, x + pad + qrSize + 8, footerTop, qrSize, qrSize, "Product");
  var labelLeft = x + pad;
  var labelTop = footerTop + qrSize + 6;
  ctx.font = fontAtSize(data.style.fontSmall, tinySize);
  (back.qrLabel || "").split("\n").forEach(function (line, i) {
    ctx.fillText(line, labelLeft, labelTop + tinySize + i * (tinySize + 4));
  });

  var logoY = footerTop + qrSize + 6 + qrLabelH + 8;
  drawImageOrPlaceholder(ctx, assets.spineLogo, x + pad, logoY, logoW, logoH, "Logo");
}

function drawBottom(ctx, data, assets, x, y, w, h) {
  drawBorder(ctx, x, y, w, h, data.style.borderColor);
  var pad = Math.max(4, Math.min(w, h) * 0.04);
  var barW = w - 2 * pad;
  var barH = Math.max(12, Math.floor(barW / 3));
  drawImageOrPlaceholder(ctx, assets && assets.barcode, x + pad, y + pad, barW, barH, "Barcode");
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
