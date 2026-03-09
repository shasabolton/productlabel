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
  var pending = [];
  var imgs = el.querySelectorAll("img[src]");
  for (var i = 0; i < imgs.length; i++) {
    var img = imgs[i];
    if (!img.complete) {
      pending.push(new Promise(function (resolve) {
        img.onload = resolve;
        img.onerror = resolve;
      }));
    }
  }
  if (el.querySelectorAll && el.namespaceURI === "http://www.w3.org/2000/svg") {
    var svgImages = el.querySelectorAll("image");
    for (var j = 0; j < svgImages.length; j++) {
      var node = svgImages[j];
      var href = node.getAttributeNS("http://www.w3.org/1999/xlink", "href") || node.getAttribute("href");
      if (href && href.indexOf("data:") !== 0) {
        pending.push(new Promise(function (resolve) {
          var img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = resolve;
          img.onerror = resolve;
          try { img.src = href; } catch (e) { resolve(); }
        }));
      }
    }
  }
  return pending.length ? Promise.all(pending) : Promise.resolve();
}

function waitForFonts() {
  return document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
}

// Google Fonts URL used in index.html - must match so exported SVG can embed the same @font-face rules.
var GOOGLE_FONTS_CSS_URL = "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@600&family=IBM+Plex+Serif&family=Montserrat:wght@600&family=Source+Sans+Pro&family=EB+Garamond&display=swap";

// Inline external font URLs in CSS as data URLs so SVG renders when drawn to canvas (PNG/JPEG).
function inlineFontUrlsInCss(cssText) {
  var urlRegex = /url\(\s*([\("]?)(https?:\/\/[^"')\s]+)\1\s*\)/g;
  var matches = [];
  var m;
  while ((m = urlRegex.exec(cssText)) !== null) matches.push(m);
  if (matches.length === 0) return Promise.resolve(cssText);
  var done = cssText;
  var promises = matches.map(function (match) {
    var url = match[2];
    return fetch(url, { mode: "cors" }).then(function (r) { return r.blob(); }).then(function (blob) {
      return new Promise(function (resolve, reject) {
        var reader = new FileReader();
        reader.onload = function () { resolve({ from: match[0], to: "url(" + reader.result + ")" }); };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }).catch(function () { return { from: match[0], to: match[0] }; });
  });
  return Promise.all(promises).then(function (replacements) {
    for (var i = 0; i < replacements.length; i++) done = done.split(replacements[i].from).join(replacements[i].to);
    return done;
  });
}

// Build CSS string containing @font-face for all theme fonts so SVG export renders correctly when opened elsewhere.
function getEmbeddedFontCss() {
  var googleCssPromise = fetch(GOOGLE_FONTS_CSS_URL).then(function (r) { return r.text(); }).then(inlineFontUrlsInCss).catch(function () { return ""; });
  var harringtonUrl = new URL("HARRINGT.TTF", window.location.href).href;
  var harringtonCssPromise = fetch(harringtonUrl).then(function (r) { return r.blob(); }).then(function (blob) {
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onload = function () {
        resolve("@font-face{font-family:'Harrington';src:url(" + r.result + ") format('truetype');}");
      };
      r.onerror = reject;
      r.readAsDataURL(blob);
    });
  }).catch(function () { return ""; });
  return Promise.all([googleCssPromise, harringtonCssPromise]).then(function (parts) {
    var google = parts[0];
    var harrington = parts[1];
    return (harrington ? harrington + "\n" : "") + (google ? google : "");
  });
}

// Inline all SVG <image> hrefs to data URLs so export includes them (avoids CORS/relative URL issues).
function inlineSvgImages(svgClone) {
  var images = svgClone.querySelectorAll("image");
  var promises = [];
  for (var i = 0; i < images.length; i++) {
    (function (imgEl) {
      var href = imgEl.getAttributeNS("http://www.w3.org/1999/xlink", "href") || imgEl.getAttribute("href");
      if (!href || href.indexOf("data:") === 0) return;
      var url;
      try {
        url = href.indexOf("http") === 0 || href.indexOf("data:") === 0 ? href : new URL(href, window.location.href).href;
      } catch (e) {
        url = href;
      }
      promises.push(
        fetch(url, { mode: "cors" }).then(function (res) { return res.blob(); }).then(function (blob) {
          return new Promise(function (resolve, reject) {
            var r = new FileReader();
            r.onload = function () {
              var dataUrl = r.result;
              imgEl.setAttributeNS("http://www.w3.org/1999/xlink", "href", dataUrl);
              imgEl.setAttribute("href", dataUrl);
              resolve();
            };
            r.onerror = reject;
            r.readAsDataURL(blob);
          });
        }).catch(function () {})
      );
    })(images[i]);
  }
  return promises.length ? Promise.all(promises) : Promise.resolve();
}

// Render SVG element to a canvas (for PDF/PNG when content is SVG, e.g. Sleave). Inlines images and fonts so they appear.
function svgToCanvas(svg) {
  var w = parseInt(svg.getAttribute("width"), 10) || 300;
  var h = parseInt(svg.getAttribute("height"), 10) || 300;
  var clone = svg.cloneNode(true);
  if (!clone.getAttribute("xmlns")) clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  return inlineSvgImages(clone).then(function () {
    return getEmbeddedFontCss();
  }).then(function (fontCss) {
    if (fontCss) {
      var defs = clone.querySelector("defs");
      if (!defs) {
        defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        clone.insertBefore(defs, clone.firstChild);
      }
      var style = document.createElementNS("http://www.w3.org/2000/svg", "style");
      style.setAttribute("type", "text/css");
      style.textContent = fontCss;
      defs.insertBefore(style, defs.firstChild);
    }
    var str = new XMLSerializer().serializeToString(clone);
    var dataUrl = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(str)));
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () {
        var canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas);
      };
      img.onerror = reject;
      img.src = dataUrl;
    });
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

var SVG2PDF_SCRIPT_URL = "https://cdn.jsdelivr.net/npm/svg2pdf.js@2.7.0/dist/svg2pdf.umd.min.js";

function hasSvgMethod(JsPDF) {
  if (!JsPDF) return false;
  return typeof JsPDF.prototype.svg === "function" ||
    (JsPDF.API && typeof JsPDF.API.svg === "function");
}

function getSvg2pdfDiagnostics() {
  var j = typeof window.jspdf !== "undefined" ? window.jspdf : (typeof jspdf !== "undefined" ? jspdf : null);
  var JsPDF = j && j.jsPDF ? j.jsPDF : null;
  return {
    "window.jspdf": typeof window.jspdf !== "undefined",
    "jspdf.jsPDF": j ? typeof j.jsPDF === "function" : false,
    "JsPDF.prototype.svg": JsPDF ? typeof JsPDF.prototype.svg === "function" : false,
    "JsPDF.API.svg": JsPDF && JsPDF.API ? typeof JsPDF.API.svg === "function" : false,
    "hasSvgMethod": hasSvgMethod(JsPDF),
    "window.svg2pdf": typeof window.svg2pdf !== "undefined",
    "window.svg2pdf (is fn)": typeof window.svg2pdf === "function",
    "window.svg2pdf.default": typeof window.svg2pdf !== "undefined" && typeof window.svg2pdf.default === "function"
  };
}

function attachSvg2pdfToJspdf() {
  var j = typeof window.jspdf !== "undefined" ? window.jspdf : (typeof jspdf !== "undefined" ? jspdf : null);
  if (!j) return false;
  if (!j.jsPDF && j.default) j.jsPDF = j.default;
  if (!j.jsPDF) return false;
  if (hasSvgMethod(j.jsPDF)) return true;
  var JsPDF = j.jsPDF;
  var attach = (window.svg2pdf && typeof window.svg2pdf.default === "function") ? window.svg2pdf.default
    : (window.svg2pdf && typeof window.svg2pdf === "function") ? window.svg2pdf : null;
  if (attach) {
    attach(JsPDF);
    return hasSvgMethod(JsPDF);
  }
  return false;
}

function loadSvg2pdfScript() {
  return new Promise(function (resolve, reject) {
    if (attachSvg2pdfToJspdf()) {
      resolve();
      return;
    }
    var existing = document.querySelector("script[src=\"" + SVG2PDF_SCRIPT_URL + "\"]");
    if (existing) {
      attachSvg2pdfToJspdf();
      resolve();
      return;
    }
    var script = document.createElement("script");
    script.src = SVG2PDF_SCRIPT_URL;
    script.onload = function () {
      if (!attachSvg2pdfToJspdf()) {
        console.warn("[Vector PDF] svg2pdf loaded but attach failed. Diagnostics:", getSvg2pdfDiagnostics());
      }
      resolve();
    };
    script.onerror = function () {
      reject(new Error("Failed to load svg2pdf.js (network or CDN blocked?)."));
    };
    document.head.appendChild(script);
  });
}

function getCanvasForExport(el) {
  if (el.tagName === "CANVAS") return Promise.resolve(el);
  if (el.namespaceURI === "http://www.w3.org/2000/svg" && (el.tagName === "svg" || el.tagName === "SVG")) {
    return svgToCanvas(el);
  }
  if (typeof html2canvas !== "undefined") return waitForImages(el).then(function () { return html2canvas(el, { scale: 1, useCORS: true, logging: false }); });
  return Promise.reject(new Error("No way to render element to canvas."));
}

function downloadSvg() {
  var prep = prepareElementForExport();
  if (!prep) return;
  var el = prep.el;
  if (!el.namespaceURI || el.namespaceURI !== "http://www.w3.org/2000/svg" || (el.tagName !== "svg" && el.tagName !== "SVG")) {
    prep.cleanup();
    alert("SVG export is only available for SVG templates (e.g. Sleave).");
    return;
  }
  var clone = el.cloneNode(true);
  waitForFonts().then(function () { return waitForImages(el);   }).then(function () {
    return inlineSvgImages(clone);
  }).then(function () {
    return getEmbeddedFontCss();
  }).then(function (fontCss) {
    if (fontCss) {
      var defs = clone.querySelector("defs");
      if (!defs) {
        defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        clone.insertBefore(defs, clone.firstChild);
      }
      var style = document.createElementNS("http://www.w3.org/2000/svg", "style");
      style.setAttribute("type", "text/css");
      style.textContent = fontCss;
      defs.insertBefore(style, defs.firstChild);
    }
    if (!clone.getAttribute("xmlns")) clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    var str = new XMLSerializer().serializeToString(clone);
    var blob = new Blob([str], { type: "image/svg+xml;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    triggerDownload(url, "label.svg");
    URL.revokeObjectURL(url);
  }).catch(function (err) {
    console.error(err);
    alert(err && err.message ? err.message : "SVG export failed.");
  }).finally(function () {
    prep.cleanup();
  });
}

function downloadImage(format) {
  var prep = prepareElementForExport();
  if (!prep) return;
  var el = prep.el;
  var mime = format === "png" ? "image/png" : "image/jpeg";
  var ext = format === "png" ? "png" : "jpg";
  var filename = "label." + ext;
  var quality = format === "jpeg" ? 0.92 : undefined;
  waitForFonts().then(function () { return waitForImages(el); }).then(function () {
    return getCanvasForExport(el);
  }).then(function (canvas) {
    var dataUrl = quality ? canvas.toDataURL(mime, quality) : canvas.toDataURL(mime);
    triggerDownload(dataUrl, filename);
  }).catch(function (err) {
    console.error(err);
    alert(err && err.message ? err.message : "Export failed.");
  }).finally(function () {
    prep.cleanup();
  });
}

function downloadPdf(forceRaster) {
  var prep = prepareElementForExport();
  if (!prep) return;
  var el = prep.el;
  if (!forceRaster && (typeof jspdf === "undefined" || !jspdf.jsPDF)) {
    if (!confirm("PDF library (jsPDF) is not loaded. Would you like to try PDF (raster) instead?")) {
      prep.cleanup();
      return;
    }
    prep.cleanup();
    return downloadPdf(true);
  }
  var pageKey = document.getElementById("pageSizeSelect").value;
  var page = pages[pageKey];
  var w = page ? page.width : 297;
  var h = page ? page.height : 210;
  var mmToPt = 2.834645669;

  function isSvg(el) {
    return el && el.namespaceURI === "http://www.w3.org/2000/svg" && (el.tagName === "svg" || el.tagName === "SVG");
  }

  function tryVectorSvgPdf() {
    if (forceRaster) return Promise.resolve(false);
    if (typeof jspdf === "undefined" || !jspdf.jsPDF) {
      console.warn("[Vector PDF] jsPDF not loaded.");
      return Promise.resolve(false);
    }
    var JsPDF = jspdf.jsPDF;
    if (!hasSvgMethod(JsPDF)) {
      if (window.__svg2pdfLoadAttempted) {
        console.warn("[Vector PDF] svg2pdf not loaded (JsPDF.prototype.svg is not a function). Diagnostics:", getSvg2pdfDiagnostics());
        return Promise.resolve(false);
      }
      window.__svg2pdfLoadAttempted = true;
      console.warn("[Vector PDF] Loading svg2pdf.js dynamically and retrying.");
      return loadSvg2pdfScript().then(function () {
        if (typeof jspdf !== "undefined" && jspdf.jsPDF && hasSvgMethod(jspdf.jsPDF)) {
          return tryVectorSvgPdf();
        }
        console.warn("[Vector PDF] svg2pdf still not attached after load. Diagnostics:", getSvg2pdfDiagnostics());
        return false;
      }).catch(function (err) {
        console.error("[Vector PDF] loadSvg2pdfScript failed:", err && err.message ? err.message : err);
        return false;
      });
    }
    var wPt = w * mmToPt;
    var hPt = h * mmToPt;
    var pdf = new JsPDF(wPt > hPt ? "l" : "p", "pt", [wPt, hPt]);
    var clone = el.cloneNode(true);
    clone.querySelectorAll("[style]").forEach(function (node) {
      var s = node.getAttribute("style");
      if (s) {
        s = s.replace(/(^|[;\s])600(\s)/g, "$1700$2");
        s = s.replace(/font-weight\s*:\s*600\b/g, "font-weight:700");
        node.setAttribute("style", s);
      }
    });
    var container = document.createElement("div");
    container.style.cssText = "position:fixed;left:-99999px;top:0;visibility:hidden;";
    container.appendChild(clone);
    document.body.appendChild(container);
    return pdf.svg(clone, { x: 0, y: 0, width: wPt, height: hPt }).then(function () {
      pdf.save("label.pdf");
      return true;
    }).catch(function (err) {
      console.error("[Vector PDF] svg2pdf failed:", err && err.message ? err.message : err);
      if (err && err.stack) console.error("[Vector PDF] stack:", err.stack);
      return false;
    }).finally(function () {
      if (container.parentNode) container.parentNode.removeChild(container);
    });
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

  function runExport() {
    if (isSvg(el) && !forceRaster) {
      tryVectorSvgPdf().then(function (done) {
        if (done) return;
        console.warn("[Vector PDF] export did not succeed (see above for reason).");
        prep.cleanup();
        if (confirm("Vector PDF export failed. Would you like to try PDF (raster) instead? (Raster PDF is not editable.)")) {
          downloadPdf(true);
        }
      }).catch(function (err) {
        console.error("[Vector PDF] export failed (exception):", err && err.message ? err.message : err);
        if (err && err.stack) console.error("[Vector PDF] stack:", err.stack);
        prep.cleanup();
        if (confirm("Vector PDF export failed. Would you like to try PDF (raster) instead? (Raster PDF is not editable.)")) {
          downloadPdf(true);
        }
      });
      return;
    }
    getCanvasForExport(el).then(saveRasterPdf).catch(function (err) {
      console.error(err);
      alert("Export failed: " + (err && err.message ? err.message : "could not render to canvas."));
    }).finally(function () {
      prep.cleanup();
    });
  }

  waitForFonts().then(function () { return waitForImages(el); }).then(runExport);
}

function runExport() {
  var format = document.getElementById("exportFormatSelect").value;
  if (format === "jpeg") downloadImage("jpeg");
  else if (format === "png") downloadImage("png");
  else if (format === "svg") downloadSvg();
  else if (format === "pdf") downloadPdf(false);
  else if (format === "pdfRaster") downloadPdf(true);
}

document.getElementById("exportBtn").addEventListener("click", function (e) {
  e.preventDefault();
  runExport();
}, false);
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

// Attach svg2pdf to jsPDF (libs load with defer; script.js runs last, so they're ready)
if (!attachSvg2pdfToJspdf()) {
  console.warn("[Vector PDF] Initial svg2pdf attach failed. Diagnostics:", getSvg2pdfDiagnostics());
}

initFromProductData();
