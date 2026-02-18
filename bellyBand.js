class bellyBand {
  constructor(data) {
    this.labelData = data;
    this.boxSize = { width: 310, height: 220, depth: 20 };
  }
  render() {
    var pageKey = document.getElementById("pageSizeSelect").value;
    var canvas = document.createElement("canvas");
    canvas.id = "canvas";
    this.ctx = canvas.getContext("2d");
    var dpi = 300;
    var page = pages[pageKey];
    var pageWidthPx = page.width / 25.4 * dpi;
    var pageHeightPx = page.height / 25.4 * dpi;
    var marginPx = (page.margin || 10) / 25.4 * dpi;
    canvas.width = pageWidthPx;
    canvas.height = pageHeightPx;
    var container = document.querySelector(".canvas-container");
    if (container) container.appendChild(canvas);
    else document.body.append(canvas);

    var bs = this.boxSize;
    var mmToPx = dpi / 25.4;
    var topH = bs.depth * mmToPx;
    var frontH = bs.height * mmToPx;
    var bottomH = bs.depth * mmToPx;
    var backH = bs.height * mmToPx;
    var totalH = topH + frontH + bottomH + backH;
    var availW = pageWidthPx - 2 * marginPx;
    var availH = pageHeightPx - 2 * marginPx;

    var th = selectedTheme || { headings: "Harrington", headingsWeight: "400", body: "Arial" };
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (availH >= totalH) {
      var x = marginPx;
      var w = availW;
      var y = marginPx;
      this.drawSection("Top", x, y, w, topH, th);
      y += topH;
      this.drawSection("Front", x, y, w, frontH, th);
      y += frontH;
      this.drawSection("Bottom", x, y, w, bottomH, th);
      y += bottomH;
      this.drawSection("Back", x, y, w, backH, th);
    } else {
      var colW = (pageWidthPx - 4 * marginPx) / 2;
      var leftX = marginPx;
      var rightX = marginPx + colW + 2 * marginPx;
      var y = marginPx;
      this.drawSection("Top", leftX, y, colW, topH, th);
      y += topH;
      this.drawSection("Front", leftX, y, colW, frontH, th);
      this.drawSection("Back", rightX, y, colW, backH, th);
      y += frontH;
      this.drawSection("Bottom", leftX, y, colW, bottomH, th);
    }
  }
  drawSection(name, x, y, w, h, th) {
    this.ctx.strokeStyle = "black";
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x, y, w, h);
    var fontSize = Math.min(h / 4, w / 12, 36);
    this.ctx.fillStyle = "black";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.font = th.headingsWeight + " " + fontSize + "px " + th.headings;
    this.ctx.fillText(this.labelData.title, x + w / 2, y + h / 2 - fontSize * 0.4);
    this.ctx.font = (fontSize * 0.5) + "px " + th.body;
    this.ctx.fillText(name + " – belly band", x + w / 2, y + h / 2 + fontSize * 0.3);
  }
  tile(n) {
    try { document.getElementById("canvas").remove(); } catch (e) {}
    this.render();
  }
}
