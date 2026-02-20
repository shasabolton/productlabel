async function drawBellyBand(canvas, data) {
    const ctx = canvas.getContext("2d");
  
    // Convert mm to pixels (approx)
    const mmToPx = (mm) => (mm / 25.4) * data.meta.dpi;
  
    const bandHeight = mmToPx(data.meta.bandHeightMM);
    const frontWidth = mmToPx(data.meta.frontWidthMM);
    const sideWidth = mmToPx(data.meta.sideWidthMM);
  
    const totalWidth = frontWidth + sideWidth * 2 + frontWidth;
  
    canvas.width = totalWidth;
    canvas.height = bandHeight;
  
    ctx.fillStyle = data.style.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  
    // Load images
    const assets = await loadAssets(data.assets);
  
    let x = 0;
  
    drawFront(ctx, data, assets, x, 0, frontWidth, bandHeight);
    x += frontWidth;
  
    drawSpine(ctx, data, assets, x, 0, sideWidth, bandHeight);
    x += sideWidth;
  
    drawBack(ctx, data, assets, x, 0, frontWidth, bandHeight);
    x += frontWidth;
  
    drawBottom(ctx, data, assets, x, 0, sideWidth, bandHeight);
  
    drawFoldLines(ctx, frontWidth, sideWidth, bandHeight);
  }
  
  async function loadAssets(paths) {
    const result = {};
  
    for (let key in paths) {
      result[key] = await loadImage(paths[key]);
    }
  
    return result;
  }
  
  function loadImage(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }
  
  function drawBorder(ctx, x, y, w, h) {
    ctx.strokeStyle = "#222";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
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
    drawBorder(ctx, x, y, w, h);
  
    ctx.fillStyle = data.style.textColor;
  
    ctx.font = data.style.fontSmall;
    ctx.fillText(data.content.front.eyebrow, x + 20, y + 30);
  
    ctx.font = data.style.fontTitle;
    ctx.fillText(data.content.front.title, x + 20, y + 70);
  
    ctx.font = data.style.fontSubtitle;
    ctx.fillText(data.content.front.subtitle, x + 20, y + 100);
  
    ctx.font = data.style.fontBody;
    ctx.fillText(data.content.front.tagline, x + 20, y + 130);
  
    drawImageOrPlaceholder(
      ctx,
      assets.heroImage,
      x + 20,
      y + 150,
      w - 40,
      250,
      "Hero Image"
    );
  
    drawImageOrPlaceholder(
      ctx,
      assets.engineeringDrawing,
      x + 20,
      y + 420,
      w - 40,
      120,
      "Engineering Drawing"
    );
  
    ctx.font = data.style.fontBody;
    ctx.fillText(data.content.front.features, x + 20, y + h - 20);
  }
  
  function drawSpine(ctx, data, assets, x, y, w, h) {
    drawBorder(ctx, x, y, w, h);
  
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate(-Math.PI / 2);
  
    ctx.fillStyle = data.style.textColor;
    ctx.font = data.style.fontSmall;
    ctx.fillText(data.content.spine.title, -h / 2 + 10, 0);
  
    ctx.restore();
  }
  
  function drawBack(ctx, data, assets, x, y, w, h) {
    drawBorder(ctx, x, y, w, h);
  
    ctx.fillStyle = data.style.textColor;
    ctx.font = data.style.fontBody;
  
    let textY = y + 30;
  
    wrapText(ctx, data.content.back.description, x + 20, textY, w - 40, 22);
  
    textY += 160;
  
    data.content.back.bullets.forEach((b) => {
      ctx.fillText("• " + b, x + 20, textY);
      textY += 24;
    });
  
    drawImageOrPlaceholder(
      ctx,
      assets.qrCode,
      x + 20,
      y + h - 140,
      100,
      100,
      "QR"
    );
  
    ctx.font = data.style.fontSmall;
    ctx.fillText(data.content.back.qrLabel, x + 130, y + h - 90);
  
    drawImageOrPlaceholder(
      ctx,
      assets.barcode,
      x + w - 200,
      y + h - 80,
      180,
      60,
      "Barcode"
    );
  
    ctx.fillText(data.content.back.model, x + w - 200, y + h - 90);
  }
  
  function drawBottom(ctx, data, assets, x, y, w, h) {
    drawBorder(ctx, x, y, w, h);
  
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate(-Math.PI / 2);
  
    ctx.font = data.style.fontSmall;
    ctx.fillStyle = data.style.textColor;
    ctx.fillText("Mechanical Calculator", -h / 2 + 10, 0);
  
    ctx.restore();
  }
  
  function drawFoldLines(ctx, frontWidth, sideWidth, bandHeight) {
    ctx.strokeStyle = "#888";
    ctx.setLineDash([6, 4]);
  
    let x1 = frontWidth;
    let x2 = frontWidth + sideWidth;
    let x3 = frontWidth + sideWidth + frontWidth;
  
    [x1, x2, x3].forEach((x) => {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, bandHeight);
      ctx.stroke();
    });
  
    ctx.setLineDash([]);
  }
  
  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const paragraphs = text.split("\n");
  
    paragraphs.forEach((p) => {
      let words = p.split(" ");
      let line = "";
  
      for (let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + " ";
        let metrics = ctx.measureText(testLine);
        let testWidth = metrics.width;
  
        if (testWidth > maxWidth && n > 0) {
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
  }
  