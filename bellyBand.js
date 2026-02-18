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
    this.ctx.fillStyle = "black";
    this.ctx.font = "48px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText(this.labelData.title + " belly band", pageWidthPx / 2, pageHeightPx / 2);
  }
  tile(n) {
    try { document.getElementById("canvas").remove(); } catch (e) {}
    this.render();
  }
}
