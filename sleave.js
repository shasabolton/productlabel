class Sleave {
    constructor(data) {
      this.labelData = data;
      this.boxSize = { width: 310, height: 222, depth: 18 };
      this.sleaveWidth = 105;//mm
    }

    pageSetup(){
        var pageKey = document.getElementById("pageSizeSelect").value;
        var canvas = document.createElement("canvas");
        canvas.id = "canvas";
        this.ctx = canvas.getContext("2d");
        var dpi = 300;
        var page = pages[pageKey];
        var pageWidthPx = page.width/25.4*dpi;
        var pageHeightPx = page.height/25.4*dpi;
        canvas.width = pageWidthPx;
        canvas.height = pageHeightPx;
        this.marginPx = page.margin/25.4*dpi;
        this.borderWidth = 0; // set in tile()
        var container = document.querySelector('.canvas-container');
        if (container) container.appendChild(canvas);
        else document.body.append(canvas);
    
        this.layout;
      }

      layout(){
         //draw topspine rectangle
         //front rectangle
         //bottom spine rectangle
         //back rectangle
      }
}