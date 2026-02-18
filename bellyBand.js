class bellyBand {
  constructor(data) {
    this.labelData = data;
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
    canvas.width = pageWidthPx;
    canvas.height = pageHeightPx;
    var container = document.querySelector(".canvas-container");
    if (container) container.appendChild(canvas);
    else document.body.append(canvas);
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);
    var th = selectedTheme || { headings: "Harrington", headingsWeight: "400", body: "Arial" };
    var margin = 40;
    var y = margin;
    this.ctx.fillStyle = "black";
    this.ctx.textAlign = "center";
    this.ctx.font = th.headingsWeight + " 48px " + th.headings;
    this.ctx.fillText(this.labelData.title, pageWidthPx / 2, y + 48);
    y += 80;
    var descFontSize = 24;
    this.ctx.font = descFontSize + "px " + th.body;
    var descLines = this.labelData.description.split(",");
    for (var i = 0; i < descLines.length; i++) {
      this.ctx.fillText(descLines[i].trim(), pageWidthPx / 2, y + descFontSize);
      y += descFontSize + 8;
    }
  }
  tile(n) {
    try { document.getElementById("canvas").remove(); } catch (e) {}
    this.render();
  }
}
