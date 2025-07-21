//Add a label type drowdown
//render will take into account the label type. if small sticker use existing render
//if sleave or large sticker use those render functions in the label class (yet to add)

//right click, print, scale 48, print dialog to set photo paper A4
//cant print or get image data fromm canvas due to cross allow cross origin header nt being on images
//can print page but cant scale yet

/*async function loadFonts() {
  const font = new FontFace("Harrington", "url(https://cdn.glitch.global/7fd6a192-1c60-4d81-85d5-3cb9b8f21acc/HARRINGT.TTF?v=1716508102300)", {
    style: "normal",
    weight: "400",
    stretch: "condensed",
  });
  // wait for font to be loaded
  await font.load();
  // add font to document
  document.fonts.add(font);
  // enable font with CSS class
  document.body.classList.add("fonts-loaded");
}*/


var activeLabel;

class productLable{
  constructor(data){   
    this.labelData = data;
  }
  
  render(){
    var canvas = document.createElement("canvas");
    canvas.id = "canvas";
    this.ctx = canvas.getContext("2d");
    var dpi = 300;//
    var a4={width:297, height:210, margin:10};
    var page = a4;
    var pageWidthPx = page.width/25.4*dpi;
    var pageHeightPx =page.height/25.4*dpi;
    canvas.width = pageWidthPx;
    canvas.height = pageHeightPx;
    this.marginPx = page.margin/25.4*dpi;
    this.labelWidth = pageWidthPx/2 - this.marginPx*2;
    this.labelHeight = pageHeightPx/2 - this.marginPx*2;
    this.borderWidth = this.labelHeight/50;
    document.body.append(canvas);
    
   
   /* this.ctx.beginPath();
    this.ctx.rect(0,0, canvas.width, canvas.height);
    this.ctx.fillStyle = "green";
    this.ctx.fill();*/
    
    this.drawLabel(this.labelData, this.ctx,this.borderWidth/2,this.borderWidth/2,this.labelWidth,this.labelHeight);
    //this.drawLabel(this.labelData, this.ctx,this.borderWidth/2,this.borderWidth/2+this.marginPx +this.labelHeight,this.labelWidth,this.labelHeight);
    //this.drawLabel(this.labelData, this.ctx,this.borderWidth/2+this.marginPx + this.labelWidth,this.borderWidth/2,this.labelWidth,this.labelHeight);
    //this.drawLabel(this.labelData, this.ctx,this.borderWidth/2+this.marginPx + this.labelWidth,this.borderWidth/2+this.marginPx +this.labelHeight,this.labelWidth,this.labelHeight);
    //this.tileFour(this.ctx,this.marginPx,this.marginPx,this.labelWidth,this.labelHeight, this.marginPx);
    
    
    
    
  }
  
  drawLabel(labelData, ctx,x,y, width, height){
    
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
      var titleFontHeight = height/8; 
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
     this.addImageToCanvas(ctx, labelData.mainImageUrl, imageLeft, descriptionBoxBottom, mainImageWidth, mainImageHeight);

    //small Images  
    var smallImageWidth = (width - borderWidth - mainImageWidth)/3 - borderWidth;
    var mainImageRight = x + borderWidth/2 + mainImageWidth;
    for(var i = 0; i< labelData.smallImages.length; i++){
      this.addImageToCanvas(ctx, labelData.smallImages[i],mainImageRight + borderWidth +(smallImageWidth+borderWidth)*i , descriptionBoxBottom, smallImageWidth, smallImageWidth);
    }
    
    
    //logo
    
    var logoUrl = "https://cdn.glitch.global/7fd6a192-1c60-4d81-85d5-3cb9b8f21acc/contraption%20cart%20logo%20text%20outlined.svg?v=1686192313474";
    //var logoUrl = "https://lh3.googleusercontent.com/QIW9uPuJbP3e_x_0pCsTnzmeLgZkO8AoX_QCknr9f5hChiKFdsE3l_pfYjQxS2qtYe8yGmdglngDhjx9FyyoR4Fnj87yUrfvwoSXfw0rbCwB525t5qyQBujxSNQvhQEWzgnA-YBi7XjcOfhI2exWaZTfcKbMg3XMhl4FGoQS4T2nwN_cghTiLjr90iyoKNNYm6Whv7ZPEFazp6y2-rXBSuj3v1FcTBBf0Yz5J9f0nM3B8opH-leslKVz7QLNaSYCwXCRZ2Hsan-jB59NubPW8ebFJWAS0TyZKuEFVHvnsce0_XzWUARrLWCo6_Iw9g02kTqzW_XJCJxJx9P6YgnZktrI106qOUpJvmlRiYHA3E2XQJQdaEMPsHz7KVie-1krDiULBdlJ-5De3lyqvzRLxNExbzjW018aVeM7W6SCunw8UAaHw1FUh6-dNQmW6X5y6mfSpLg84oDtbxT4BfiAVhu2Ua-HJxLpYoHFjeKHRTKdIVqK_KU9ul3NpC0eDRpxF-GCYCg0QvCkmD8x2EjUUkd-OIn5wC5ABc_p31OA_eHvdGDKQnxfUzFAtVBucxailPBpM0bXL59xh2VTMmdalCwpCN3nStk95AbwGXq4ZekCYDo59JLVscAI67iAkYyNjJ8atuN7USYHk6cDTdH1vYBQn7ERVMOU2de_DDUbBs7xKMk905AUXMSMk9GNv-lM504zpcqCQofU4hTOTXPNmR1y5Vcej8Pz--rPuZ2e5T50Y7X6GDsnlafgXU6mRGZU3WMCX1XYZsG55UxVh8A4DryqbvDGObynJZBtAHFOE144mVMYoheM9KDnez62wFGogis-pkkUqpoN6Yi1-Zpn_EfbZ24wvsyP5Q55DMDT7XJQUHB9aKMKTrf3NXhoJLBneJ915y9R_Lx5XdXvx3s1jA2i0R3ntMjiH0XUj1Vjd7yE=w300-h131-s-no?authuser=0";
    var logoTop = descriptionBoxBottom + smallImageWidth;    
    var logoHeight = height- (logoTop-y)-borderWidth/2;
    this.addImageToCanvas(ctx, logoUrl, mainImageRight,  logoTop , width - borderWidth - mainImageWidth ,  logoHeight);
    
  }
  
  
  
 addImageToCanvas(ctx, url, x, y, width, height){
     var image = document.createElement("img");
     image.src = url;
     image.crossOrigin = "anonymous";
     image.addEventListener("load", (e) => { 
       //image.crossorigin='anonymous';
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
     });
  }
  
  
  tileFour(){
    var ctx = this.ctx;
    var x = 0;//this.marginPx;
    var y = 0;//this.marginPx;
    var w = this.labelWidth + this.borderWidth;
    var h = this.labelHeight + this.borderWidth;
    var margin = this.marginPx
    const imageData = ctx.getImageData(x,y,w,h);
    
    var canvas = document.getElementById("canvas");
    
    //crop canvas so blank edges are not included
    canvas.width = x+(w+margin)*2;
    canvas.height = y+(h+margin)*2;
    
    //fill blank area white
    this.ctx.beginPath();
    this.ctx.rect(0,0, x+(w+margin)*2,  y+(h+margin)*2);
    this.ctx.fillStyle = "white";
    this.ctx.fill();
    
  
    
    ctx.putImageData(imageData, x, y);
    ctx.putImageData(imageData, x+w+margin*2, y);
    ctx.putImageData(imageData, x, y+h+2*margin);
    ctx.putImageData(imageData, x+w+margin*2, y+h+2*margin);
    
  }
  
}









function print()  
{  
    var dataUrl = document.getElementById('canvas').toDataURL(); //attempt to save base64 string to server using this var  
    var windowContent = '<!DOCTYPE html>';
    windowContent += '<html>'
    windowContent += '<head><title>Print canvas</title></head>';
    windowContent += '<body>'
    windowContent += '<img src="' + dataUrl + '">';
    windowContent += '</body>';
    windowContent += '</html>';
    var printWin = window.open('','','width=340,height=260');
    printWin.document.open();
    printWin.document.write(windowContent);
    printWin.document.close();
    printWin.focus();
    printWin.print();
    printWin.close();
}

function tileFour(){
  activeLabel.tileFour();
}


function download() {
    var dt = document.getElementById("canvas").toDataURL('image/jpeg');
    this.href = dt;
};
document.getElementById("downloadLink").addEventListener('click', download, false);

var productSelect = document.getElementById("productSelect");


productSelect.onchange = function(){
  setActiveProduct(productSelect.selectedIndex);
}



function setActiveProduct(index){
  activeLabel = products[index];
  try{document.getElementById("canvas").remove();}
  catch{}
  activeLabel.render();
}




var humPullLabel = new productLable({
  title:"Hummingbird Pulley Pet", 
  description: "Assemble the parts, Pull the string to it watch rise up flapping",
  mainImageUrl: "https://cdn.glitch.global/7fd6a192-1c60-4d81-85d5-3cb9b8f21acc/main.jpg?v=1710713989006",
  smallImages: [
    "https://cdn.glitch.global/7fd6a192-1c60-4d81-85d5-3cb9b8f21acc/iso.jpg?v=1710713999729",
    "https://cdn.glitch.global/7fd6a192-1c60-4d81-85d5-3cb9b8f21acc/side.jpg?v=1710713968948",    
    "https://cdn.glitch.global/7fd6a192-1c60-4d81-85d5-3cb9b8f21acc/parts.jpg?v=1710713977292"
  ]
});

var fantailLabel = new productLable({
  title:"Fantail Whirligig", 
  description: "Build your own wind powered flapping bird",
  mainImageUrl: "https://lh3.googleusercontent.com/pw/AIL4fc9DotPuZg2BZcOTFfd2UvIDOZOPGyQmIWFdT-yFsYaaBDiLVK_0m0RWJQQp4FTLfBGZeX9C6q8Z12b6bpV6ugUfmi9D2JokG0-TjyjIY9eSTCoLeqLyCHVOsrsHCmtiKnxVY_O26HyyIRo4o3khPuJuDwzlHl71zO7NVMk7AEngj4FgwiLvBkQtaKhdymPvIy7fg3wMKylkUkRArgUkhg1zz3hK89uEF96X4ReZPHDs1h4CXtHLkV9HSMuuS6gin4W4uX77e_Cqb8WJ-hf3hwq84cH6e37j6kcbUl543pAtt0uhgM9jvRgdNzgXLNED_XgSTyeH_0OBJtptjUtVaZ2IKQMhPUAqePijh7Zm-033SB3jcG4JA82QG9XxUvQfklcJ6yJySn7H264ipOwao6Th4IDswYoPmHAlvDif9RsVueaO6NXgMw7EYWZ8uQu4s5_x9d4JmmPQ0L0GtER6eJjZSstjm2Zcgucx3Dv1yyv6OcQjAIKHO-3xIw9btmToEMQBJ4ej56YxSk95B5gUfDDrsc11v0E5HB3YsEfmAsqeBXyBRsCRCYIXRhvsBrDzqsGksYwcP0BgaZynED1UWrECus0I-PbjjGpgW2UHohX4NiyfizliLeyPB5cmWqtRuu9Jw4o7e9CR-nQ_OL6vnNM8uxrQCXCX5m0360o4_Ixt8FldivzxUSbT6pp26QpWgnlAXT_VNvljQZoZhZ8OMHiiSKrDKfulIO2cOn4O0ZxuWo4Xyti6pcD0Vn1JwlQZnL6jrNkFtcKyBFUqGZZcqb_sMBw8aIWeVFn5Boj52CNDOc6_zBFZ0PzqWmmQSP6cwnCrUOd1VdkLkz9ZriuLNUAzbp9jsnruVqzCIJ7YSQ1XrxzTieo1bXfRev_bzL9YKkl4dOAmS9_NM4TTc-W5XA=w625-h625-s-no?authuser=0",
  smallImages: [
    "https://lh3.googleusercontent.com/pw/AIL4fc9hmSaxGobyT36Q2hBkT2PPoyKDYU2zo8IUa-xYQq1nxVb6gWXa_jwys-OMcdLFAwC6cUhNgJZ3tCEJou5pKzTAswqsmNNO6h_VbY0HABQA71KhEKuBR271ddEE2pIM_SdnwS_sUYmApuMKqUF5xcUiYs7nOVNoUY2V4hjKcdU7eREBQ1d6NynUxCtdMw5X4DktyoBJXQfCXeXXlbME6qjDHuTphHbOQN-IyGIIpE3TvAf3lBijBF6SUBNnUh99AC0elAl6wQaXYkjFVenRlTq8_fcqUDEPISbL2VlI15ziyBYwficLW_dug4siKkcha7leODdOlJM3DBRRezMvJKZ05MLJzovttcomm3kVAh-IPOec3dGxrgZmEfKr_SnZadNHCWiXg6PeXmu-UfBk2VOft9MAy5N5X-iOJ_3MdFz_d9RvVLdHhqzKPG7cyBgD2TBbayT3xeHSr8Mi59wpi6jnokkivKCrBVfJXIWBycW2HC3EJSGcnOr0EqMnV2kp-M7Vv7TXooy0g34DLNHe2ycKd7Aq4aC1B-SHbJIMDFfIZtGdfrMFgIfOgOkaJl4ttlTMz3uWOXah2TD_bIJBaicZfLv_mxHlbwB7WTmnd7vCd579HwULW1_VbEWpngfBK6QbUKPShT8TmBL0OAsXeZwD_gjQqn5CpFK7RCrqfYpVlGJu8VE_8ln-zR52TP4_-AJ6EiWZ_MBK6S5TMr3e94EHofSjGEjC1AgdO4m24aloH3KrVA2RFDPWUVJR08WEFSAFsHEzKgWkTb35HOq1Xpp5vMssFn3LVnX9ISGl3u1xKDhV24UN6z5WYSieET3u1CMKi3-OWCvIDTcQwouMdfVsrCMqQnKcyVyxXRof8rh0oiRHoVADnuf7D_HDf70CEvNFx3LmnrHXCZvKi7Nwug=w625-h625-s-no?authuser=0",
    "https://lh3.googleusercontent.com/pw/AIL4fc_oZgv3l8xfR7QpzIzvQfa2bRkK7jDM0wZ6KWtVHtgtIH4f7DGClX0Ui9k7-UhL0RJRJmPlK2WeRvhDDIxMFT5ecCjXLh67Gha8mCEDRQRrUY0rOPE1sDOHiyobUw37eNpsYUDVV5urDQBPW-3xatRpYQNbu7TEiu4QmPOFr3dLGkmwOISlZGdeQlVmFX5RvjEAsD54Fz8lAi3IPE9h1_Q0hr1nTklA9Sz82JLqbXfWslvghr8nXW7Kux2bGNkxt4ViuF7t24tuzeRlf2Dx4ywD-qNMKjPTDLWudDbh9hGZulTjKjcX4caHyYu1r3u3b8fDm0t3jRf4NrF4DxP_fqANyG7z_ImOc2doWenB2JKh_UaftQucZzSp1awdjNVGDL_bKBf3Lu_iSHJKyqr6Q9rRfzp8Xn4A4TI6wVqqLyGFLi2iWX2liAT2qleldim0WI9Y1ifrz7Zm1euUaP9f3M8YBnQ7u8bj8dxYzeEw0wA24ZZ45TPO8xKm_JcdjJaUIlTnRBOySHFM9YgpFJ6YjxhkknsWBK0wsdMTI-oLNkebupqbluQArzTEiGbgZdPzdAjEMDyV6MeSmx44Z21jGO6Lkpt4gMauW-98sZXpZvXE2iE_GEtAL_hO3PwGImxbj0_ZDXDoyzU6EekLXC3clPXO8XQQMkvk4_Pghu4En7np4ZiBY2GUlzitnZHaAeEpA3EgbEy4LYj6JjOVM6yrIHFkM2yVIvBUEsul2AiiXMATvgj_pU04oZsEkIbz-x1ZwZoIp0J3hpeeCiselHPiZkkcIxiKwBSVa12OpZhp6U8JcjO7aogtt-R0nkBPwOH7kik_FpMA630VqxeBpJTKF32An3VVU3LHNCgHIp54aF76mImb7sYj6hnynZ5WdcxdW2qfWJMnvSeiXBSr5pKPlg=w625-h625-s-no?authuser=0",    
    "https://lh3.googleusercontent.com/pw/AIL4fc-7XEdGK-xhHqX9vIUvuR125PjRgqrdiStJH8sJa2jzFRtbqE-RpvqzWB5tVyIorxYftuCfRrCm5loD9aGukjWTjnksAB43wpk3tNzNMv6HSc-CytA_3YlBeCYSuDpSh_Y9W2PcTv-qWLIdgQ0dPwY1EbcuWW515ZEZRMctwAp9BN8bHG91EnJzExgK1236E3Ui4W4_H15Mfz2OORWvCAmgKTsXaH8rYqKBIIrjcXj1ux3loju7Ny1KBPenmPctbdQjbSwfcz13h4nMb-a--hkdBtyWWKIKxyWgEmTvB0PiCybZYzshHLcKPFMUA2OjW2sFlGjdjx8scvfc6T0L-2DTWyo2oZyqvvllbVGWG2dcVECEMyol3yeW6YWNEN2iy1JO-o1EhO26Ks47gpVCH7nc-4Kn37wCllT_pQpExXEW2h_6Ax0uWf9qZ2qOklxs9i0Xjn217pmjNBpwij2xR11vL2JCj6RvG09ox_uW1SHpV87EHqEShRjUv9IDeWauCXewpzZusQoKck3tFeuk6gGF4CMPZvmTSIuMshRZ3jPBnn20YaO73Ih5xDN3S_lLJJHOqokmtKI2KCIjeXfQ4Dvq7oaGEshHnsxB8QouCokRj2tbGBZn4b1pySU52nj48PUsdCpg6YGPHtB5InSuBCLGjNTHt6iXh1ZVEFgecSqaR0_7-jwc2OwWRDx7J4kZzS6oYQ9u-f_4LbPT5YvuZSTAzNwYvzXPBnMCH4_mrfOILqFji5PTxv5ZuvPD1UsOEGzbKy2EQitwDinLs9D6u3Nwm-97PYhxeYeg1CS92y1JAoKLdT1pVshPRzvR7rVEXgAbMp26KdaBnXVu4DRuwPPGAeNazGk-KClHpwRVQWn2jgP1oZwddPnILsaIJ4c52GtZlV2lEM9wCefp2qxEmQ=w625-h625-s-no?authuser=0"
  ]
});

var hummingbirdAndFlowerLabel = new productLable({
  title:"Hummingbird and FLower", 
  description: "Assemble the Mechanism,Hand Cranked - Elegant Lifelike Motion",
  mainImageUrl: "https://cdn.glitch.global/7fd6a192-1c60-4d81-85d5-3cb9b8f21acc/20240122_151959.jpg?v=1706244505719",
  smallImages: [
    "https://cdn.glitch.global/7fd6a192-1c60-4d81-85d5-3cb9b8f21acc/20240122_151926.jpg?v=1706244481651",
    "https://cdn.glitch.global/7fd6a192-1c60-4d81-85d5-3cb9b8f21acc/20240122_152020.jpg?v=1706244520229",    
    "https://cdn.glitch.global/7fd6a192-1c60-4d81-85d5-3cb9b8f21acc/20240122_152546.jpg?v=1706245264039"
  ]
});

var electricHummingbirdLabel = new productLable({
  title:"Electrigami Hummingbird", 
  description: "Assemble the Mechanism, powered with static electricity",
  mainImageUrl: "https://lh3.googleusercontent.com/pw/ABLVV84NkigsRJ1SlaKZeKCr4IH9Eqvcm6S0nKFc6dUkt9ycPScqVnYGyO5yLT4mMwH3U7nKaNX5_-obthEkK9cPxKkhiukKlkxHu1IFQ2a8I1CJhFzn00hPhJVxp-kysCkah3qui4VFwUjwTvlHHKUG8Ot4=w833-h625-s-no?authuser=0",
  smallImages: [

  ]
});


var IllusionistBoxLabel = new productLable({
  title:"Illusionist Box", 
  description: "Assemble the parts. Secret opening sequence",
  mainImageUrl: "https://cdn.glitch.global/7fd6a192-1c60-4d81-85d5-3cb9b8f21acc/84c90124-58d6-403d-9d26-3c94cb6a60fc.image.png?v=1708295048211",
  smallImages: [
      'https://cdn.glitch.global/7fd6a192-1c60-4d81-85d5-3cb9b8f21acc/20220114_103238.jpg?v=1713307570890',
      'https://cdn.glitch.global/7fd6a192-1c60-4d81-85d5-3cb9b8f21acc/31a97ee4-4c59-455c-b1d0-537a942f4417.image.png?v=1708295321637',
      'https://cdn.glitch.global/7fd6a192-1c60-4d81-85d5-3cb9b8f21acc/20220114_103105.jpg?v=1713307530528'
  ]
});

var DogCatRunningLabel = new productLable({
  title:"Running Dog and Cat", 
  description: "Assemble the Mechanism,Hand Cranked - Captivating Leaping Motion",
  mainImageUrl: "https://cdn.glitch.global/7fd6a192-1c60-4d81-85d5-3cb9b8f21acc/dog%20cat.jpg?v=1708658601834",
  smallImages: [
      'https://cdn.glitch.global/7fd6a192-1c60-4d81-85d5-3cb9b8f21acc/dog.jpg?v=1708658587553',
      'https://cdn.glitch.global/7fd6a192-1c60-4d81-85d5-3cb9b8f21acc/cat.jpg?v=1708658593665',
      'https://cdn.glitch.global/7fd6a192-1c60-4d81-85d5-3cb9b8f21acc/cat%20back.jpg?v=1708658609378'
  ]
});


var SwingingMonkeyLabel = new productLable({
  title:"Swinging Monkey Kit", 
  description: "Assemble - Hand Crank,watch your monkey swing through the trees",
  mainImageUrl: "https://cdn.glitch.global/7fd6a192-1c60-4d81-85d5-3cb9b8f21acc/20240228_170057.jpg?v=1709185025862",
  smallImages: [
      'https://cdn.glitch.global/7fd6a192-1c60-4d81-85d5-3cb9b8f21acc/20240228_170238.jpg?v=1709185057008',
      'https://cdn.glitch.global/7fd6a192-1c60-4d81-85d5-3cb9b8f21acc/20240228_170308.jpg?v=1709185072552',
      'https://cdn.glitch.global/7fd6a192-1c60-4d81-85d5-3cb9b8f21acc/20240228_170253.jpg?v=1709185088247'
  ]
});

var magicPencilLabel = new productLable({
  title:"Magic Pencil Box Kit", 
  description: "Assemble the box, then magically break and heal a pencil",
  mainImageUrl: "https://cdn.glitch.global/7fd6a192-1c60-4d81-85d5-3cb9b8f21acc/20240520_114714.jpg?v=1716336447508",
  smallImages: [
      'https://cdn.glitch.global/7fd6a192-1c60-4d81-85d5-3cb9b8f21acc/20240520_114602.jpg?v=1716336461999',
      'https://cdn.glitch.global/7fd6a192-1c60-4d81-85d5-3cb9b8f21acc/20240403_162038.jpg?v=1712531757793',
      'https://cdn.glitch.global/7fd6a192-1c60-4d81-85d5-3cb9b8f21acc/20240403_162155.jpg?v=1712531782527'
  ]
});


var flutteringHeartLabel = new productLable({
  title:"Fluttering Heart Kit", 
  description: "Mimics the elegant flapping motion,of dragonflies and hummingbirds",
  mainImageUrl: "https://cdn.glitch.global/7fd6a192-1c60-4d81-85d5-3cb9b8f21acc/20230102_082105.jpg?v=1718154078440",
  smallImages: [
      'https://cdn.glitch.global/7fd6a192-1c60-4d81-85d5-3cb9b8f21acc/20230102_082026.jpg?v=1718154030203',
      'https://cdn.glitch.global/7fd6a192-1c60-4d81-85d5-3cb9b8f21acc/20230102_083734.jpg?v=1718154139022',
      'https://cdn.glitch.global/7fd6a192-1c60-4d81-85d5-3cb9b8f21acc/20230102_083706.jpg?v=1718153975545'
  ]
});


var humPoleLabel = new productLable({
  title:"Hummingbird Pole Pet", 
  description: "Assemble the parts, Pull the string to it watch rise up flapping",
  mainImageUrl: "https://cdn.glitch.global/7fd6a192-1c60-4d81-85d5-3cb9b8f21acc/20220610_091251.jpg?v=1720998120577",
  smallImages: [
    "https://cdn.glitch.global/7fd6a192-1c60-4d81-85d5-3cb9b8f21acc/20220610_090727.jpg?v=1720998218108",
    "https://cdn.glitch.global/7fd6a192-1c60-4d81-85d5-3cb9b8f21acc/20220610_091237.jpg?v=1720998263549",    
    "https://cdn.glitch.global/7fd6a192-1c60-4d81-85d5-3cb9b8f21acc/20220610_091033.jpg?v=1720998182165"
  ]
});

var zoeBirdLabel = new productLable({
  title:"Zoetrope Bird", 
  description: "Assemble your own 3D Animation Machine",
  mainImageUrl: "https://cdn.glitch.global/7fd6a192-1c60-4d81-85d5-3cb9b8f21acc/20220210_151656.jpg?v=1722811596825",
  smallImages: [
    "https://cdn.glitch.global/7fd6a192-1c60-4d81-85d5-3cb9b8f21acc/20220210_151708.jpg?v=1722811617796",
    "https://cdn.glitch.global/7fd6a192-1c60-4d81-85d5-3cb9b8f21acc/20220210_151724.jpg?v=1722811633402",    
    "https://cdn.glitch.global/7fd6a192-1c60-4d81-85d5-3cb9b8f21acc/20220210_151820.jpg?v=1722811652412"
  ]
});


var fingerSwordLabel = new productLable({
  title:"Magic Sword Through Finger", 
  description: "Assemble the wooden kit, then perform your magic finger chopping illusion",
  mainImageUrl: "https://cdn.glitch.global/7fd6a192-1c60-4d81-85d5-3cb9b8f21acc/20240925_102153.jpg?v=1727237353532",
  smallImages: [
    "https://cdn.glitch.global/7fd6a192-1c60-4d81-85d5-3cb9b8f21acc/20240925_101837.jpg?v=1727237472991",
    "https://cdn.glitch.global/7fd6a192-1c60-4d81-85d5-3cb9b8f21acc/20240925_101522.jpg?v=1727237326499",    
    "https://cdn.glitch.global/7fd6a192-1c60-4d81-85d5-3cb9b8f21acc/20240925_101538.jpg?v=1727237446653"
  ]
});

var tinyDriveLabel = new productLable({
  title:"Tiny Drive Mini Arcade", 
  description: "Assemble the wooden kit, then steer your way through the little world ",
  mainImageUrl: "https://cdn.glitch.global/7fd6a192-1c60-4d81-85d5-3cb9b8f21acc/20250203_095647.jpg?v=1740010845269",
  smallImages: [
    "https://cdn.glitch.global/7fd6a192-1c60-4d81-85d5-3cb9b8f21acc/20241207_164842.jpg?v=1740010877904",
    "https://cdn.glitch.global/7fd6a192-1c60-4d81-85d5-3cb9b8f21acc/20241207_165124.jpg?v=1740010919136",    
    "https://cdn.glitch.global/7fd6a192-1c60-4d81-85d5-3cb9b8f21acc/20241203_105439.jpg?v=1740010959844"
  ]
});

var diceTunnelLabel = new productLable({
  title:"Dice Tunnel Magic Trick", 
  description: "The dice number changes magically as it, passes through the tunnel. DIY assembly",
  mainImageUrl: "https://cdn.glitch.global/7fd6a192-1c60-4d81-85d5-3cb9b8f21acc/20250418_114831.jpg?v=1745043718190",
  smallImages: [
    "https://cdn.glitch.global/7fd6a192-1c60-4d81-85d5-3cb9b8f21acc/20250418_115057.jpg?v=1745043737781",
    "https://cdn.glitch.global/7fd6a192-1c60-4d81-85d5-3cb9b8f21acc/20250418_115120.jpg?v=1745043754567",    
    "https://cdn.glitch.global/7fd6a192-1c60-4d81-85d5-3cb9b8f21acc/20250418_114619.jpg?v=1745043771990"
  ]
});

var magicEmptyBoxLabel = new productLable({
  title: "Empty Box Magic Trick",
  description: "Make objects appear and vanish,// from an empty box. DIY assembly",
  mainImageUrl: "photos/smarties.jpg",
  smallImages: [
    "photos/emptyOpenFront.jpg",
    "photos/emptyOpenIso.jpg",
    "photos/emptyBoxShutFront.jpg"
  ]
});

var magicFrameLabel = new productLable({
  title: "Magic Frame Trick",
  description: "Make words and pictures change instantly,DIY assembly",
  mainImageUrl: "photos/YES.jpg",
  smallImages: [
    "photos/NO.jpg",
    "photos/dove.jpg",
    "photos/rabbit.jpg"
  ]
});

var lankyDoodlerLabel = new productLable({
  title: "Lanky Doodler",
  description: "Mechanical Writing Automaton,DIY assembly - make custom sketches in the app",
  mainImageUrl: "photos/lankydoodler/lankyiso.jpg",
  smallImages: [
    "photos/lankydoodler/lankyleftiso.jpg",
    "photos/lankydoodler/lankyleft.jpg",
    "photos/lankydoodler/lankypaperless.jpg"
  ]
});

var products = [
  humPullLabel,
  hummingbirdAndFlowerLabel,
  fantailLabel,
  IllusionistBoxLabel,
  DogCatRunningLabel,
  SwingingMonkeyLabel,
  magicPencilLabel,
  flutteringHeartLabel,
  humPoleLabel,
  zoeBirdLabel,
  fingerSwordLabel,
  tinyDriveLabel,
  diceTunnelLabel,
  magicEmptyBoxLabel,
  magicFrameLabel,
  lankyDoodlerLabel
]


for (var i =0; i< products.length; i++){
  var option = document.createElement("option");
  option.text = products[i].labelData.title;
  option.index = i;
  productSelect.add(option);
} 