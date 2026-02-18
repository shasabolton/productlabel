class productLable{
  constructor(data){   
    this.labelData = data;
  }
  
  render(){
    var pageKey = document.getElementById("pageSizeSelect").value;
    var tileNumber = parseInt(document.getElementById("tileSelect").value, 10);
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

    this.tile(tileNumber);
  }
  
  drawLabelRotated(labelData, ctx, x, y, cellW, cellH){
    // Draw to offscreen canvas so async images get correct rotation when drawn
    var offscreen = document.createElement("canvas");
    offscreen.width = cellH;
    offscreen.height = cellW;
    var offCtx = offscreen.getContext("2d");
    var redrawToMain = function() {
      ctx.save();
      ctx.translate(x + cellW / 2, y + cellH / 2);
      ctx.rotate(Math.PI / 2);
      ctx.translate(-cellH / 2, -cellW / 2);
      ctx.drawImage(offscreen, 0, 0);
      ctx.restore();
    };
    this.drawLabel(labelData, offCtx, 0, 0, cellH, cellW, redrawToMain);
    redrawToMain();
  }

  drawLabel(labelData, ctx, x, y, width, height, onAfterImageDraw){
    
      //border
      ctx.beginPath();
      ctx.rect(x,y, width, height);
      ctx.fillStyle = "white";
      ctx.fill();
    
      var borderWidth = this.borderWidth;
      ctx.lineWidth= borderWidth;
      ctx.strokeStyle = "black";
      ctx.stroke();
      
    
      //title
      var titleFontHeight = height/9; 
      ctx.fillStyle="red";
      ctx.textAlign = "center";
      ctx.font = titleFontHeight + "px Harrington";
      ctx.fillText(labelData.title, x+width/2, y+ titleFontHeight);  
    
     //description background
      var descriptionFontHeight = height/15;
      ctx.fillStyle="black";
      var descriptionArray = labelData.description.split(",");
      ctx.fillRect(x,y+ titleFontHeight*1.3, width,descriptionArray.length*descriptionFontHeight+descriptionFontHeight*0.3);
      var descriptionBoxBottom = y+ titleFontHeight*1.3 + descriptionArray.length*descriptionFontHeight+descriptionFontHeight*0.3;
      
      //description
      ctx.fillStyle="white";
      ctx.textAlign = "center";
      ctx.font = descriptionFontHeight + "px Arial";
      
      var textY = y+ titleFontHeight*1.3 + descriptionFontHeight ;
      for(var row = 0; row<descriptionArray.length; row++){
        ctx.fillText(descriptionArray[row], x+width/2, textY);
        textY +=descriptionFontHeight;
      }
       
      //main image
     var mainImageHeight = y+height - descriptionBoxBottom - borderWidth/2;
     var mainImageWidth = mainImageHeight;
     var imageLeft = x + borderWidth/2;
     this.addImageToCanvas(ctx, labelData.mainImageUrl, imageLeft, descriptionBoxBottom, mainImageWidth, mainImageHeight, onAfterImageDraw);

    //small Images  
    var numSmallImages = labelData.smallImages.length;
    var smallImageWidth = (width - borderWidth - mainImageWidth)/numSmallImages - borderWidth;
    var mainImageRight = x + borderWidth/2 + mainImageWidth;
    for(var i = 0; i< labelData.smallImages.length; i++){
      this.addImageToCanvas(ctx, labelData.smallImages[i],mainImageRight + borderWidth +(smallImageWidth+borderWidth)*i , descriptionBoxBottom, smallImageWidth, smallImageWidth, onAfterImageDraw);
    }
    
    
    //logo
    var padding = 15;
    
    //var logoUrl = "https://cdn.glitch.global/7fd6a192-1c60-4d81-85d5-3cb9b8f21acc/contraption%20cart%20logo%20text%20outlined.svg?v=1686192313474";
    var logoUrl = "photos/logo/logosb.jpg";
    var logoTop = descriptionBoxBottom + smallImageWidth +padding;    
    var logoHeight = height- (logoTop-y)-borderWidth/2;
    this.addImageToCanvas(ctx, logoUrl, mainImageRight+padding,  logoTop , width - borderWidth - mainImageWidth -padding*2,  logoHeight, onAfterImageDraw);
    
  }
  
  
  
 addImageToCanvas(ctx, url, x, y, width, height, onAfterDraw){
    var image = document.createElement("img");
    
    const isExternalUrl = url.startsWith('http://') || url.startsWith('https://');
    
    if (isExternalUrl) {
        // Use images.weserv.nl - it's an image proxy/CDN that often bypasses blocks
        image.src = `https://images.weserv.nl/?url=${encodeURIComponent(url)}`;
    } else {
        image.src = url;
    }
    
    image.crossOrigin = "anonymous";
    
    image.addEventListener("error", function onError(e) {
        if (isExternalUrl) {
            console.log("Image proxy failed, trying direct URL (will fail CORS but shows attempt)...");
            image.removeEventListener("error", onError);
            // Last resort - direct URL (will fail CORS but at least we tried)
            image.src = url;
        } else {
            console.error("Failed to load image:", url);
        }
    });
    
    image.addEventListener("load", (e) => { 
      console.log("crossorigin",image.crossOrigin);
      //check fits in boudary
      if(width*image.height/image.width>height){//too high if keeping width
        var scale = height/image.height;//must keep height instead
        var newWidth = scale*image.width;
        x += (width - newWidth)/2;//center
        width = newWidth;
        
      }
      else if(height*image.width/image.height>width){//too wide if keeping height
        var scale = width/image.width;
        var newHeight = scale*image.height; 
        y += (height - newHeight)/2;
        height = newHeight;
      }
      
      ctx.drawImage(image, x , y, width , height );
      if (onAfterDraw) onAfterDraw();
    });
  }
  
  
  tile(n){
    var canvas = document.getElementById("canvas");
    var pageWidthPx = canvas.width;
    var pageHeightPx = canvas.height;
    var margin = this.marginPx;
    var gap = margin * 2;  // margin between tiles = 2x edge margin (cut gives even margin)

    // Find best layout: try each factor pair and both orientations (normal + rotated 90°)
    var best = { cols: 1, rows: 1, labelW: 0, labelH: 0, area: 0, rotated: false };
    for (var cols = 1; cols <= n; cols++) {
      if (n % cols !== 0) continue;
      var rows = n / cols;
      // Normal: cols along page width, rows along page height
      var labelW = (pageWidthPx - 2 * margin - (cols - 1) * gap) / cols;
      var labelH = (pageHeightPx - 2 * margin - (rows - 1) * gap) / rows;
      if (labelW > 0 && labelH > 0) {
        var area = labelW * labelH;
        if (area > best.area) {
          best = { cols: cols, rows: rows, labelW: labelW, labelH: labelH, area: area, rotated: false };
        }
      }
      // Rotated 90°: cols along page height, rows along page width
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

    // Fill canvas white
    this.ctx.beginPath();
    this.ctx.rect(0, 0, canvas.width, canvas.height);
    this.ctx.fillStyle = "white";
    this.ctx.fill();

    // Draw n labels in grid (gap between tiles = 2*margin)
    for (var i = 0; i < n; i++) {
      var col = i % best.cols;
      var row = Math.floor(i / best.cols);
      var x, y, w, h;
      if (best.rotated) {
        // Grid: cols along page height, rows along page width
        x = margin + row * (best.labelH + gap);
        y = margin + col * (best.labelW + gap);
        w = best.labelH;
        h = best.labelW;
        this.drawLabelRotated(this.labelData, this.ctx, x, y, w, h);
      } else {
        x = margin + col * (best.labelW + gap);
        y = margin + row * (best.labelH + gap);
        this.drawLabel(this.labelData, this.ctx, x, y, best.labelW, best.labelH);
      }
    }
  }
  
}
