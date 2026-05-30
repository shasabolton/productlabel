/**
 * Editable layout for A4 Portrait Sticker. Adjust colors, fractions, and type scale here.
 * All geometry fractions are 0–1 relative to each sticker cell (except hairlinePx).
 */
var A4PortraitStickerLayout = {
  dpi: 300,
  /** When true, font families come from the selected theme (themes.json). */
  useThemeFonts: true,
  palette: {
    pageBleed: "#ebe6dd",
    panelFill: "#fffdf8",
    outerRule: "#2a2622",
    innerRule: "#c4b8a8",
    accentBar: "#8f7b4a",
    text: "#1a1714",
    muted: "#5e5850",
    eyebrow: "#6f6860",
    heroPaper: "#f3efe8",
    thumbPaper: "#faf8f5"
  },
  fontsFallback: {
    displayFamily: "Georgia",
    bodyFamily: "Georgia"
  },
  typeScale: {
    eyebrow: 0.034,
    title: 0.072,
    subtitle: 0.032,
    tagline: 0.026,
    features: 0.024,
    body: 0.024,
    list: 0.022,
    caption: 0.02,
    shortDescription: 0.026
  },
  geometry: {
    marginX: 0.045,
    marginY: 0.04,
    imageColumn: 0.36,
    columnGutter: 0.028,
    heroMaxH: 0.52,
    thumbRowH: 0.14,
    thumbGap: 0.015,
    footerH: 0.13,
    headerRuleY: 0.11,
    frameInset: 0.012,
    hairlinePx: 1.5,
    accentBarW: 0.22,
    accentBarH: 0.004
  },
  showShortDescriptionWithLong: true
};

function A4PortraitSticker_normalizeProduct(raw) {
  var d = raw || {};
  return {
    title: d.title || "",
    description: d.description || "",
    eyebrow: d.eyebrow || "",
    subtitle: d.subtitle || "",
    tagline: d.tagline || "",
    features: d.features || "",
    specs: Array.isArray(d.specs) ? d.specs : [],
    longDescription: d.longDescription || "",
    bullets: Array.isArray(d.bullets) ? d.bullets : [],
    qrLabel: d.qrLabel || "",
    mainImageUrl: d.mainImageUrl || "",
    smallImages: Array.isArray(d.smallImages) ? d.smallImages : [],
    qrCode: d.qrCode || d.qrcode || "",
    barCode: d.barCode || d.barcode || ""
  };
}

function A4PortraitSticker_wrapLines(ctx, text, maxW) {
  if (!text) return [];
  var words = String(text).replace(/\s+/g, " ").trim().split(" ");
  var lines = [];
  var line = "";
  for (var i = 0; i < words.length; i++) {
    var w = words[i];
    var test = line ? line + " " + w : w;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function A4PortraitSticker_loadImage(url) {
  return new Promise(function (resolve) {
    if (!url) {
      resolve(null);
      return;
    }
    var img = new Image();
    img.crossOrigin = "anonymous";
    var isExternal = url.indexOf("http://") === 0 || url.indexOf("https://") === 0;
    img.src = isExternal ? "https://images.weserv.nl/?url=" + encodeURIComponent(url) : url;
    img.onload = function () {
      resolve(img);
    };
    img.onerror = function tryDirect() {
      if (!isExternal) {
        resolve(null);
        return;
      }
      img.removeEventListener("error", tryDirect);
      img.src = url;
      img.onload = function () {
        resolve(img);
      };
      img.onerror = function () {
        resolve(null);
      };
    };
  });
}

function A4PortraitSticker_drawImageCover(ctx, img, x, y, w, h) {
  if (!img || !w || !h) return;
  var iw = img.width;
  var ih = img.height;
  if (!iw || !ih) return;
  var scale = Math.max(w / iw, h / ih);
  var dw = iw * scale;
  var dh = ih * scale;
  var dx = x + (w - dw) / 2;
  var dy = y + (h - dh) / 2;
  ctx.drawImage(img, dx, dy, dw, dh);
}

var A4PortraitSticker = function A4PortraitSticker(data) {
  this.labelData = data;
};

A4PortraitSticker.prototype._themeFonts = function () {
  var th = selectedTheme || {};
  var L = A4PortraitStickerLayout;
  if (!L.useThemeFonts) {
    return {
      displayWeight: "600",
      displayFamily: L.fontsFallback.displayFamily,
      bodyFamily: L.fontsFallback.bodyFamily
    };
  }
  return {
    displayWeight: th.headingsWeight || "600",
    displayFamily: th.headings || "Georgia",
    bodyFamily: th.body || "Georgia"
  };
};

/**
 * Draws one sticker cell into ctx (origin x,y). Calls done() after images and text are painted.
 */
A4PortraitSticker.prototype.drawSticker = function (dataRaw, ctx, x, y, w, h, done) {
  var data = A4PortraitSticker_normalizeProduct(dataRaw);
  var L = A4PortraitStickerLayout;
  var P = L.palette;
  var G = L.geometry;
  var T = L.typeScale;
  var f = this._themeFonts();
  var hair = Math.max(1, G.hairlinePx || 1);

  var mx = w * G.marginX;
  var my = h * G.marginY;
  var cx = x + mx;
  var cy = y + my;
  var cw = w - 2 * mx;
  var ch = h - 2 * my;
  var inset = cw * G.frameInset;

  function fillPanel() {
    ctx.fillStyle = P.panelFill;
    ctx.fillRect(cx, cy, cw, ch);
    ctx.strokeStyle = P.outerRule;
    ctx.lineWidth = hair * 1.6;
    ctx.strokeRect(cx + hair, cy + hair, cw - hair * 2, ch - hair * 2);
    ctx.strokeStyle = P.innerRule;
    ctx.lineWidth = hair;
    ctx.strokeRect(cx + inset, cy + inset, cw - 2 * inset, ch - 2 * inset);
  }

  var imgColW = cw * G.imageColumn;
  var gutter = cw * G.columnGutter;
  var textX = cx + imgColW + gutter;
  var textW = Math.max(40, cx + cw - textX - mx * 0.2);

  var footerH = ch * G.footerH;
  var contentTop = cy + ch * G.headerRuleY;
  var contentBot = cy + ch - footerH - my * 0.3;
  var contentH = Math.max(60, contentBot - contentTop);

  var heroMaxH = contentH * G.heroMaxH;
  var thumbH = data.smallImages.length ? contentH * G.thumbRowH : 0;
  var heroH = Math.min(heroMaxH, contentH - thumbH - cw * G.thumbGap);

  var heroX = cx + mx * 0.3;
  var heroY = contentTop;
  var heroW = imgColW - mx * 0.5;
  var thumbsY = heroY + heroH + cw * G.thumbGap;
  var nThumb = Math.min(data.smallImages.length, 6);
  var thumbW = nThumb ? (heroW - (nThumb - 1) * cw * G.thumbGap) / nThumb : 0;

  var footY = cy + ch - footerH;
  var qrSize = Math.min(footerH * 0.75, imgColW * 0.85);
  var qrX = cx + mx * 0.3;
  var qrY = footY + (footerH - qrSize) / 2 - w * T.caption * 0.3;

  function drawTextColumn() {
    var ty = cy + my * 0.6;
    ctx.textBaseline = "top";
    ctx.textAlign = "left";

    if (data.eyebrow) {
      ctx.fillStyle = P.eyebrow;
      ctx.font = "600 " + w * T.eyebrow + "px " + f.bodyFamily;
      ctx.fillText(data.eyebrow.toUpperCase(), textX, ty);
      ty += w * T.eyebrow * 1.35;
    }
    if (data.title) {
      ctx.fillStyle = P.text;
      ctx.font = f.displayWeight + " " + w * T.title + "px " + f.displayFamily;
      var titleLines = A4PortraitSticker_wrapLines(ctx, data.title, textW);
      for (var ti = 0; ti < titleLines.length; ti++) {
        ctx.fillText(titleLines[ti], textX, ty);
        ty += w * T.title * 1.05;
      }
      ctx.fillStyle = P.accentBar;
      ctx.fillRect(textX, ty + cw * 0.008, textW * G.accentBarW, Math.max(2, ch * G.accentBarH));
      ty += w * T.title * 0.35;
    }
    if (data.subtitle) {
      ctx.fillStyle = P.muted;
      ctx.font = "italic " + w * T.subtitle + "px " + f.bodyFamily;
      var subLines = A4PortraitSticker_wrapLines(ctx, data.subtitle, textW);
      for (var si = 0; si < subLines.length; si++) {
        ctx.fillText(subLines[si], textX, ty);
        ty += w * T.subtitle * 1.15;
      }
    }
    if (data.tagline) {
      ctx.fillStyle = P.text;
      ctx.font = "500 " + w * T.tagline + "px " + f.bodyFamily;
      var tagLines = A4PortraitSticker_wrapLines(ctx, data.tagline, textW);
      for (var gi = 0; gi < tagLines.length; gi++) {
        ctx.fillText(tagLines[gi], textX, ty);
        ty += w * T.tagline * 1.2;
      }
    }
    if (data.features) {
      ty += w * T.body * 0.25;
      ctx.fillStyle = P.accentBar;
      ctx.font = "600 " + w * T.features + "px " + f.bodyFamily;
      ctx.fillText(data.features, textX, ty);
      ty += w * T.features * 1.45;
    }
    if (L.showShortDescriptionWithLong && data.description && data.longDescription) {
      ctx.fillStyle = P.text;
      ctx.font = w * T.shortDescription + "px " + f.bodyFamily;
      var dLines = A4PortraitSticker_wrapLines(ctx, data.description, textW);
      for (var di = 0; di < dLines.length; di++) {
        ctx.fillText(dLines[di], textX, ty);
        ty += w * T.shortDescription * 1.2;
      }
      ty += w * T.body * 0.2;
    } else if (data.description && !data.longDescription) {
      ctx.fillStyle = P.text;
      ctx.font = w * T.body + "px " + f.bodyFamily;
      var dLines2 = A4PortraitSticker_wrapLines(ctx, data.description, textW);
      for (var dj = 0; dj < dLines2.length; dj++) {
        ctx.fillText(dLines2[dj], textX, ty);
        ty += w * T.body * 1.2;
      }
      ty += w * T.body * 0.2;
    }
    if (data.longDescription) {
      ctx.fillStyle = P.muted;
      ctx.font = w * T.body + "px " + f.bodyFamily;
      var ldLines = A4PortraitSticker_wrapLines(ctx, data.longDescription, textW);
      for (var li = 0; li < ldLines.length; li++) {
        ctx.fillText(ldLines[li], textX, ty);
        ty += w * T.body * 1.18;
      }
      ty += w * T.list * 0.35;
    }
    if (data.specs.length) {
      ctx.fillStyle = P.text;
      ctx.font = "600 " + w * T.list + "px " + f.bodyFamily;
      ctx.fillText("Details", textX, ty);
      ty += w * T.list * 1.25;
      ctx.font = w * T.list + "px " + f.bodyFamily;
      for (var s = 0; s < data.specs.length; s++) {
        var specLines = A4PortraitSticker_wrapLines(ctx, "· " + data.specs[s], textW);
        for (var sl = 0; sl < specLines.length; sl++) {
          ctx.fillText(specLines[sl], textX, ty);
          ty += w * T.list * 1.12;
        }
      }
      ty += w * T.list * 0.25;
    }
    if (data.bullets.length) {
      ctx.fillStyle = P.text;
      ctx.font = "600 " + w * T.list + "px " + f.bodyFamily;
      ctx.fillText("Highlights", textX, ty);
      ty += w * T.list * 1.25;
      ctx.font = w * T.list + "px " + f.bodyFamily;
      for (var b = 0; b < data.bullets.length; b++) {
        var bullLines = A4PortraitSticker_wrapLines(ctx, "• " + data.bullets[b], textW);
        for (var bl = 0; bl < bullLines.length; bl++) {
          ctx.fillText(bullLines[bl], textX, ty);
          ty += w * T.list * 1.12;
        }
      }
    }
  }

  function drawFooter(heroImg, thumbs, qrImg, barImg) {
    footY = cy + ch - footerH;
    ctx.strokeStyle = P.innerRule;
    ctx.lineWidth = hair;
    ctx.beginPath();
    ctx.moveTo(cx + inset * 0.5, footY);
    ctx.lineTo(cx + cw - inset * 0.5, footY);
    ctx.stroke();

    ctx.fillStyle = P.heroPaper;
    ctx.fillRect(heroX, heroY, heroW, heroH);
    ctx.strokeStyle = P.innerRule;
    ctx.strokeRect(heroX, heroY, heroW, heroH);
    if (heroImg) A4PortraitSticker_drawImageCover(ctx, heroImg, heroX, heroY, heroW, heroH);

    for (var ti2 = 0; ti2 < nThumb; ti2++) {
      var tx = heroX + ti2 * (thumbW + cw * G.thumbGap);
      ctx.fillStyle = P.thumbPaper;
      ctx.fillRect(tx, thumbsY, thumbW, thumbH);
      ctx.strokeRect(tx, thumbsY, thumbW, thumbH);
      if (thumbs[ti2]) A4PortraitSticker_drawImageCover(ctx, thumbs[ti2], tx, thumbsY, thumbW, thumbH);
    }

    if (qrImg) {
      ctx.fillStyle = "#fff";
      ctx.fillRect(qrX - 2, qrY - 2, qrSize + 4, qrSize + 4);
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
    }
    if (data.qrLabel) {
      ctx.fillStyle = P.muted;
      ctx.font = w * T.caption + "px " + f.bodyFamily;
      var capLines = A4PortraitSticker_wrapLines(ctx, data.qrLabel, textW * 0.95);
      var capY = qrY + qrSize + w * T.caption * 0.35;
      for (var ci = 0; ci < Math.min(capLines.length, 2); ci++) {
        ctx.fillText(capLines[ci], qrX, capY);
        capY += w * T.caption * 1.15;
      }
    }

    var barHH = footerH * 0.45;
    var barWW = Math.min(textW * 0.55, cw * 0.42);
    var barX = cx + cw - mx - barWW;
    var barY = footY + (footerH - barHH) / 2;
    if (barImg) {
      ctx.fillStyle = "#fff";
      ctx.fillRect(barX - 2, barY - 2, barWW + 4, barHH + 4);
      A4PortraitSticker_drawImageCover(ctx, barImg, barX, barY, barWW, barHH);
    }
  }

  var tasks = [];
  if (data.mainImageUrl) {
    tasks.push(A4PortraitSticker_loadImage(data.mainImageUrl).then(function (img) {
      return { key: "hero", img: img };
    }));
  } else {
    tasks.push(Promise.resolve({ key: "hero", img: null }));
  }
  for (var tj = 0; tj < nThumb; tj++) {
    (function (idx) {
      tasks.push(A4PortraitSticker_loadImage(data.smallImages[idx]).then(function (img) {
        return { key: "thumb", idx: idx, img: img };
      }));
    })(tj);
  }
  tasks.push(A4PortraitSticker_loadImage(data.qrCode).then(function (img) {
    return { key: "qr", img: img };
  }));
  tasks.push(A4PortraitSticker_loadImage(data.barCode).then(function (img) {
    return { key: "bar", img: img };
  }));

  Promise.all(tasks).then(function (parts) {
    var heroImg = null;
    var qrImg = null;
    var barImg = null;
    var thumbs = [];
    for (var p = 0; p < parts.length; p++) {
      var part = parts[p];
      if (!part) continue;
      if (part.key === "hero") heroImg = part.img;
      else if (part.key === "thumb") thumbs[part.idx] = part.img;
      else if (part.key === "qr") qrImg = part.img;
      else if (part.key === "bar") barImg = part.img;
    }

    fillPanel();
    drawTextColumn();
    drawFooter(heroImg, thumbs, qrImg, barImg);

    if (done) done();
  });
};

A4PortraitSticker.prototype.drawLabelRotated = function (labelData, ctx, x, y, cellW, cellH) {
  var offscreen = document.createElement("canvas");
  offscreen.width = cellH;
  offscreen.height = cellW;
  var offCtx = offscreen.getContext("2d");
  var self = this;
  var redrawToMain = function () {
    ctx.save();
    ctx.translate(x + cellW / 2, y + cellH / 2);
    ctx.rotate(Math.PI / 2);
    ctx.translate(-cellH / 2, -cellW / 2);
    ctx.drawImage(offscreen, 0, 0);
    ctx.restore();
  };
  this.drawSticker(labelData, offCtx, 0, 0, cellH, cellW, redrawToMain);
};

A4PortraitSticker.prototype.drawLabel = function (labelData, ctx, x, y, width, height) {
  this.drawSticker(labelData, ctx, x, y, width, height, null);
};

A4PortraitSticker.prototype.render = function () {
  var pageKey = document.getElementById("pageSizeSelect").value;
  var tileNumber = parseInt(document.getElementById("tileSelect").value, 10);
  var canvas = document.createElement("canvas");
  canvas.id = "canvas";
  this.ctx = canvas.getContext("2d");
  var L = A4PortraitStickerLayout;
  var dpi = L.dpi || 300;
  var page = pages[pageKey];
  var pageWidthPx = (page.width / 25.4) * dpi;
  var pageHeightPx = (page.height / 25.4) * dpi;
  canvas.width = pageWidthPx;
  canvas.height = pageHeightPx;
  this.marginPx = (page.margin / 25.4) * dpi;
  this.borderWidth = 0;
  var container = document.querySelector(".canvas-container");
  if (container) container.appendChild(canvas);
  else document.body.appendChild(canvas);

  this.tile(tileNumber);
};

A4PortraitSticker.prototype.tile = function (n) {
  var canvas = document.getElementById("canvas");
  var pageWidthPx = canvas.width;
  var pageHeightPx = canvas.height;
  var margin = this.marginPx;
  var gap = margin * 2;
  var best = { cols: 1, rows: 1, labelW: 0, labelH: 0, area: 0, rotated: false };
  for (var cols = 1; cols <= n; cols++) {
    if (n % cols !== 0) continue;
    var rows = n / cols;
    var labelW = (pageWidthPx - 2 * margin - (cols - 1) * gap) / cols;
    var labelH = (pageHeightPx - 2 * margin - (rows - 1) * gap) / rows;
    if (labelW > 0 && labelH > 0) {
      var area = labelW * labelH;
      if (area > best.area) {
        best = { cols: cols, rows: rows, labelW: labelW, labelH: labelH, area: area, rotated: false };
      }
    }
    var labelWR = (pageHeightPx - 2 * margin - (cols - 1) * gap) / cols;
    var labelHR = (pageWidthPx - 2 * margin - (rows - 1) * gap) / rows;
    if (labelWR > 0 && labelHR > 0) {
      var areaR = labelWR * labelHR;
      if (areaR > best.area) {
        best = { cols: cols, rows: rows, labelW: labelWR, labelH: labelHR, area: areaR, rotated: true };
      }
    }
  }

  this.labelWidth = best.labelW;
  this.labelHeight = best.labelH;
  this.borderWidth = this.labelHeight / 50;

  var L = A4PortraitStickerLayout;
  this.ctx.beginPath();
  this.ctx.rect(0, 0, canvas.width, canvas.height);
  this.ctx.fillStyle = L.palette.pageBleed;
  this.ctx.fill();

  var self = this;
  for (var i = 0; i < n; i++) {
    var col = i % best.cols;
    var row = Math.floor(i / best.cols);
    if (best.rotated) {
      (function (colR, rowR) {
        var px = margin + rowR * (best.labelH + gap);
        var py = margin + colR * (best.labelW + gap);
        var pw = best.labelH;
        var ph = best.labelW;
        var off = document.createElement("canvas");
        off.width = pw;
        off.height = ph;
        var offCtx = off.getContext("2d");
        self.drawSticker(self.labelData, offCtx, 0, 0, pw, ph, function () {
          self.ctx.save();
          self.ctx.translate(px + pw / 2, py + ph / 2);
          self.ctx.rotate(Math.PI / 2);
          self.ctx.translate(-ph / 2, -pw / 2);
          self.ctx.drawImage(off, 0, 0);
          self.ctx.restore();
        });
      })(col, row);
    } else {
      (function (colN, rowN) {
        var px = margin + colN * (best.labelW + gap);
        var py = margin + rowN * (best.labelH + gap);
        var lw = best.labelW;
        var lh = best.labelH;
        var off = document.createElement("canvas");
        off.width = lw;
        off.height = lh;
        var offCtx = off.getContext("2d");
        self.drawSticker(self.labelData, offCtx, 0, 0, lw, lh, function () {
          self.ctx.drawImage(off, px, py);
        });
      })(col, row);
    }
  }
};
