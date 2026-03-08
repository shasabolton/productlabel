var activeLabel;
var themes = [];
var selectedTheme = null;

// Page sizes in mm (width x height)
var pages = {
  "A2 Portrait": { width: 420, height: 594, margin: 5, printSize: "A2 portrait" },
  "A2 Landscape": { width: 594, height: 420, margin: 5, printSize: "A2 landscape" },
  "A3 Portrait": { width: 297, height: 420, margin: 5, printSize: "A3 portrait" },
  "A3 Landscape": { width: 420, height: 297, margin: 5, printSize: "A3 landscape" },
  "A4 Portrait": { width: 210, height: 297, margin: 5, printSize: "A4 portrait" },
  "A4 Landscape": { width: 297, height: 210, margin: 5, printSize: "A4 landscape" },
  "A5 Portrait": { width: 148, height: 210, margin: 5, printSize: "A5 portrait" },
  "A5 Landscape": { width: 210, height: 148, margin: 5, printSize: "A5 landscape" },
  "105mm wide sleave": { width: 105, height: 500, margin: 5, printSize: "100 wide sleave" }
};

// Template classes - each has constructor(data) and render()
// bellyBand from bellyBand.js, productLable from productLabel.js
var templates = [
  { name: "Product Label", TemplateClass: productLable },
  { name: "Belly Band", TemplateClass: bellyBand },
  { name: "Sleave", TemplateClass: Sleave }
];



function printCanvas() {
    var canvas = document.getElementById('canvas');
    if (!canvas) return;
    var dataUrl = canvas.toDataURL('image/png');
    var printWin = window.open('', '_blank');
    if (!printWin) {
        alert('Please allow popups to print.');
        return;
    }
    var pageKey = document.getElementById("pageSizeSelect").value;
    var page = pages[pageKey];
    var printSize = page && page.printSize ? page.printSize : pageKey;
    var windowContent = '<!DOCTYPE html><html><head><title>Print Label</title><style>';
    windowContent += '@page { size: ' + printSize + '; margin: 0; }';
    windowContent += 'body { margin: 0; padding: 0; }';
    windowContent += 'img { width: 100%; height: auto; display: block; }';
    windowContent += '</style></head><body>';
    windowContent += '<img src="' + dataUrl + '" alt="Product Label" onload="window.print(); window.close();">';
    windowContent += '</body></html>';
    printWin.document.write(windowContent);
    printWin.document.close();
    printWin.focus();
}

function getExportElement() {
  var canvas = document.getElementById("canvas");
  var pageDiv = document.getElementById("belly-band-page");
  return canvas || pageDiv;
}

// For Belly Band: clone into hidden full-size container so html2canvas captures at print resolution.
// The on-screen div stays scaled for viewing; the clone is used only for export.
function prepareElementForExport() {
  var canvas = document.getElementById("canvas");
  var pageDiv = document.getElementById("belly-band-page");
  if (canvas) return { el: canvas, cleanup: function () {} };
  if (!pageDiv) return null;
  var container = document.getElementById("export-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "export-container";
    container.style.cssText = "position:fixed;left:-99999px;top:0;width:6000px;height:8000px;overflow:visible;pointer-events:none;";
    document.body.appendChild(container);
  }
  container.innerHTML = "";
  var clone = pageDiv.cloneNode(true);
  clone.id = "belly-band-export-clone";
  clone.style.maxWidth = "none";
  clone.style.height = pageDiv.style.height || "";
  container.appendChild(clone);
  return {
    el: clone,
    cleanup: function () { container.innerHTML = ""; }
  };
}

function waitForImages(el) {
  if (!el || !el.querySelectorAll) return Promise.resolve();
  var imgs = el.querySelectorAll("img[src]");
  var pending = [];
  for (var i = 0; i < imgs.length; i++) {
    var img = imgs[i];
    if (!img.complete) {
      pending.push(new Promise(function (resolve) {
        img.onload = resolve;
        img.onerror = resolve;
      }));
    }
  }
  return pending.length ? Promise.all(pending) : Promise.resolve();
}

// Render SVG element to a canvas (for PDF/PNG when content is SVG, e.g. Sleave).
function svgToCanvas(svg) {
  var w = parseInt(svg.getAttribute("width"), 10) || 300;
  var h = parseInt(svg.getAttribute("height"), 10) || 300;
  var clone = svg.cloneNode(true);
  if (!clone.getAttribute("xmlns")) clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  var str = new XMLSerializer().serializeToString(clone);
  var dataUrl = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(str)));
  return new Promise(function (resolve, reject) {
    var img = new Image();
    img.onload = function () {
      var canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      var ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas);
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

function triggerDownload(dataUrl, filename) {
  var a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function downloadImage(e, format) {
  e.preventDefault();
  var prep = prepareElementForExport();
  if (!prep) return;
  var el = prep.el;
  var mime = format === "png" ? "image/png" : "image/jpeg";
  var ext = format === "png" ? "png" : "jpg";
  var filename = "label." + ext;
  var quality = format === "jpeg" ? 0.92 : undefined;
  function getCanvas() {
    if (el.tagName === "CANVAS") return Promise.resolve(el);
    if (el.namespaceURI === "http://www.w3.org/2000/svg" && (el.tagName === "svg" || el.tagName === "SVG")) return svgToCanvas(el);
    if (typeof html2canvas === "undefined") return Promise.reject(new Error("html2canvas not loaded."));
    return waitForImages(el).then(function () { return html2canvas(el, { scale: 1, useCORS: true, logging: false }); });
  }
  getCanvas().then(function (canvas) {
    var dataUrl = quality ? canvas.toDataURL(mime, quality) : canvas.toDataURL(mime);
    triggerDownload(dataUrl, filename);
  }).catch(function (err) {
    console.error(err);
    alert(err && err.message ? err.message : "Export failed.");
  }).finally(function () {
    prep.cleanup();
  });
}

function downloadPng(e) { downloadImage(e, "png"); }
function downloadJpeg(e) { downloadImage(e, "jpeg"); }

function downloadPdf(e) {
  e.preventDefault();
  var prep = prepareElementForExport();
  if (!prep) return;
  var el = prep.el;
  var pageKey = document.getElementById("pageSizeSelect").value;
  var page = pages[pageKey];
  var w = page ? page.width : 297;
  var h = page ? page.height : 210;
  var mmToPt = 2.834645669;

  function isSvg(el) {
    return el && el.namespaceURI === "http://www.w3.org/2000/svg" && (el.tagName === "svg" || el.tagName === "SVG");
  }

  function tryVectorSvgPdf() {
    if (typeof jspdf === "undefined" || !jspdf.jsPDF) return Promise.resolve(false);
    var JsPDF = jspdf.jsPDF;
    if (typeof JsPDF.prototype.svg !== "function") return Promise.resolve(false);
    var wPt = w * mmToPt;
    var hPt = h * mmToPt;
    var pdf = new JsPDF(wPt > hPt ? "l" : "p", "pt", [wPt, hPt]);
    return pdf.svg(el, { x: 0, y: 0, width: wPt, height: hPt }).then(function () {
      pdf.save("label.pdf");
      return true;
    }).catch(function () {
      return false;
    });
  }

  function getCanvas() {
    if (el.tagName === "CANVAS") return Promise.resolve(el);
    if (isSvg(el)) return svgToCanvas(el);
    if (typeof html2canvas !== "undefined") return waitForImages(el).then(function () { return html2canvas(el, { scale: 1, useCORS: true, logging: false }); });
    return Promise.reject(new Error("No way to render element to canvas."));
  }

  function saveRasterPdf(canvas) {
    if (typeof jspdf === "undefined" || !jspdf.jsPDF) {
      triggerDownload(canvas.toDataURL("image/png"), "label.png");
      alert("PDF library (jsPDF) not loaded. Saved as PNG instead.");
      return;
    }
    var imgData = canvas.toDataURL("image/png");
    var pdf = new jspdf.jsPDF({ orientation: w > h ? "landscape" : "portrait", unit: "mm", format: [w, h] });
    pdf.addImage(imgData, "PNG", 0, 0, w, h);
    pdf.save("label.pdf");
  }

  if (isSvg(el)) {
    tryVectorSvgPdf().then(function (done) {
      if (done) return;
      return getCanvas().then(saveRasterPdf);
    }).catch(function (err) {
      console.error(err);
      return getCanvas().then(saveRasterPdf);
    }).catch(function (err) {
      console.error(err);
      alert("Export failed: " + (err && err.message ? err.message : "could not render to canvas."));
    }).finally(function () {
      prep.cleanup();
    });
    return;
  }

  getCanvas().then(saveRasterPdf).catch(function (err) {
    console.error(err);
    alert("Export failed: " + (err && err.message ? err.message : "could not render to canvas."));
  }).finally(function () {
    prep.cleanup();
  });
}

document.getElementById("downloadPng").addEventListener("click", downloadPng, false);
document.getElementById("downloadJpeg").addEventListener("click", downloadJpeg, false);
document.getElementById("downloadPdf").addEventListener("click", downloadPdf, false);
document.getElementById("printBtn").addEventListener('click', printCanvas, false);

var productSelect = document.getElementById("productSelect");
var templateSelect = document.getElementById("templateSelect");
var themeSelect = document.getElementById("themeSelect");
var products = [];

function getSelectedTheme() {
  var idx = themeSelect.selectedIndex;
  return themes[idx] || themes[0];
}

function getSelectedTemplateClass() {
  var idx = templateSelect.selectedIndex;
  return templates[idx].TemplateClass;
}

productSelect.onchange = function(){
  setActiveProduct(productSelect.selectedIndex);
}

templateSelect.onchange = function(){
  if (products.length > 0) rebuildProductsWithTemplate();
};

themeSelect.onchange = function(){
  selectedTheme = getSelectedTheme();
  if (activeLabel) setActiveProduct(productSelect.selectedIndex);
};

document.getElementById("pageSizeSelect").onchange = function(){
  if (activeLabel) setActiveProduct(productSelect.selectedIndex);
};

document.getElementById("tileSelect").onchange = function(){
  if (activeLabel) setActiveProduct(productSelect.selectedIndex);
};

document.getElementById("subsectionBordersCheckbox").onchange = function(){
  if (activeLabel) setActiveProduct(productSelect.selectedIndex);
};

function setActiveProduct(index){
  activeLabel = products[index];
  try { document.getElementById("canvas").remove(); } catch(e) {}
  try { document.getElementById("belly-band-page").remove(); } catch(e) {}
  activeLabel.render();
}

function rebuildProductsWithTemplate() {
  var TemplateClass = getSelectedTemplateClass();
  var dataItems = products.map(function(p){ return p.labelData; });
  products = dataItems.map(function(d){ return new TemplateClass(d); });
  if (products.length > 0) setActiveProduct(productSelect.selectedIndex);
}

function initFromProductData(){
  var srcEl = document.getElementById("productDataSrc");
  var themesEl = document.getElementById("themesSrc");
  var productUrl = srcEl ? (srcEl.href || srcEl.getAttribute("href") || "productData.json") : "productData.json";
  var themesUrl = themesEl ? (themesEl.href || themesEl.getAttribute("href") || "themes.json") : "themes.json";
  fetch(themesUrl)
    .then(function(res){ return res.json(); })
    .then(function(data){
      themes = data.themes || data;
      themeSelect.innerHTML = "";
      for (var t = 0; t < themes.length; t++) {
        var opt = document.createElement("option");
        opt.text = themes[t].name;
        opt.value = t;
        themeSelect.add(opt);
      }
      selectedTheme = getSelectedTheme();
      return fetch(productUrl);
    })
    .then(function(res){ return res.json(); })
    .then(function(data){
      var items = data.products || data;
      var TemplateClass = getSelectedTemplateClass();
      products = items.map(function(d){ return new TemplateClass(d); });
      productSelect.innerHTML = "";
      for (var i = 0; i < products.length; i++){
        var option = document.createElement("option");
        option.text = products[i].labelData.title;
        option.index = i;
        productSelect.add(option);
      }
      if (products.length > 0) setActiveProduct(0);
    })
    .catch(function(err){ console.error("Failed to load data:", err); });
}

// Populate template dropdown (before init so getSelectedTemplateClass works)
for (var t = 0; t < templates.length; t++) {
  var opt = document.createElement("option");
  opt.text = templates[t].name;
  opt.value = t;
  templateSelect.add(opt);
}

// Populate page dropdown from pages (any page added to pages appears here)
var pageSizeSelect = document.getElementById("pageSizeSelect");
pageSizeSelect.innerHTML = "";
var pageKeys = Object.keys(pages);
var defaultPage = "A4 Landscape";
for (var p = 0; p < pageKeys.length; p++) {
  var key = pageKeys[p];
  var opt = document.createElement("option");
  opt.text = key;
  opt.value = key;
  if (key === defaultPage) opt.selected = true;
  pageSizeSelect.add(opt);
}

initFromProductData();
