class Sleave {
    constructor(data) {
      this.labelData = data;
      this.labelData.logo = "photos/logo/Cart.jpg";
      this.labelData.logoText = "www.ContraptionCart.com";
      this.labelData.designedBy = "Designed By Shasa Bolton";
      this.boxSize = { width: 310, height: 222, depth: 18 };
      this.sleaveWidth = 95; // mm
      this.sectionMarginMm = 5;
      this.subsectionRowPaddingMm = 1;
      this.rowGapMm = 1;
      this.lineThicknessMm = 0.8;
      this.thinLineThicknessMm = 0.2;
      this.popSectionWidthMm = 2;
      this.decorativeLineSpacingMm = 1;
      // Section layout: center (xc,yc) and rotation (0 or 180 deg) per section.
      // Populated by layout(); keys vary by mode (single vs two-column (double) when stack too tall).
      this.sectionLayout = {
        back: { xc: 0, yc: 0, w:0, h:0,  rot: 180, 
            subsections: [
                ["decorativeFiller-centered-paddingTop0mm-paddingBottom0mm"],
                ["title-medium-headings-centered"],
                ["specs-small-body-left"],
                ["----------------"],
                ["longDescription-small-body-justify"],
                ["----------------"],
                ["bullets-small-body-left"],
                ["smallImages[1]-fit", "smallImages[2]-fit"],
                ["qrLabel-small-body-left-shrinkToFit"],
                ["qrCode-matchRowHeight","barCode-47mmWide"],//"barCode-37.29mmWide"],
                ["decorativeFiller-paddingTop0mm-paddingBottom0mm"]  
            ]
        },
        top: { xc: 0, yc: 0, w:0, h:0, rot: 0, 
            subsections:[
                ["title-medium-headings-centered-colorwhite"]
            ],
            backgroundColor:"black"
        },
        front: { xc: 0, yc: 0, w:0, h:0, rot: 0, 
            subsections:[
                ["decorativeFiller-paddingTop0mm-paddingBottom0mm"],
                ["eyebrow-medium-body-centered-doubleUnderline"],

                ["title-large-headings-centered-capitalize-paddingBottom0mm"],
                ["subtitle-small-body-italic-centered-paddingTop0mm-paddingBottom0mm"],
                ["tagline-small-body-centered-paddingTop0mm"],
                ["heroImage-cropAlpha-popSectionWidth-paddingBottom0mm"],
                ["-----------------paddingTop0mm-paddingBottom0mm"],
                ["smallImage-fit-paddingTop0mm-paddingBottom0mm"],
                ["features-small-body-centered-paddingBottom0mm"],
                ["decorativeFiller-paddingTop0mm-paddingBottom0mm"],
            ]
        },
        bottom: { xc: 0, yc: 0, w:0, h:0, rot: 0, 
            subsections:[
                ["logo-0.8ParentHeight-invertColors",["logoText-medium-headings-centered-shrinkToFit-colorwhite","designedBy-small-body-centered-colorwhite"]] 
            ],
            backgroundColor:"black"         
        },
        overlap: { xc: 0, yc: 0, w:0, h:0, rot: 0},
        overlapTop: { xc: 0, yc: 0, w:0, h:0, rot: 0},
        overlapBottom: { xc: 0, yc: 0, w:0, h:0, rot: 0}
      };
 
       this.fontSizes = {
        large: 140,
        medium: 80,
        small: 60,
        xsmall: 40,
      }

    /*   subsectionFomrating={
        content:data.title, size: this.fontSizes.large, type:"headings"}, 
                {content:data.specs, size: this.fontSizes.small, type:"body"}, 
                {content:data.longDescription, size: this.fontSizes.small, type:"body"}, 
                {content:data.bullets, size: this.fontSizes.small, type:"body"}, 
                {content:data.smallImages, size:"halfWidth"}, 
                {content:data.qrLabel, size: this.fontSizes.fitRemainingWidth, type:"text"}, 
                {content:data.qrAndBarCode, size: this.fontSizes.sideBySide, type:"image"}
      }*/

    

    }

    /**
     * Parse a subsection spec string e.g. "title-large-headings-centered" or "specs-small-body-left".
     * @returns {{ prop: string, index: number|null, sizeKey: string, styleKey: string|null, italic: boolean, isImage: boolean, align: string }}
     */
    parseSpec(specStr) {
        if (typeof specStr === "string" && /^-{3,}/.test(specStr)) {
            var paddingTopMm = null, paddingBottomMm = null;
            var parts = specStr.split("-");
            for (var i = 0; i < parts.length; i++) {
                var token = parts[i];
                var ptMatch = token && token.match(/^paddingTop(\d+(?:\.\d+)?)mm$/);
                var pbMatch = token && token.match(/^paddingBottom(\d+(?:\.\d+)?)mm$/);
                if (ptMatch) paddingTopMm = parseFloat(ptMatch[1], 10);
                else if (pbMatch) paddingBottomMm = parseFloat(pbMatch[1], 10);
            }
            return { prop: "__lineBreak__", index: null, sizeKey: "small", styleKey: "body", italic: false, isImage: false, align: "left", heightRatio: null, widthMm: null, widthRatio: null, paddingTopMm: paddingTopMm, paddingBottomMm: paddingBottomMm, popSectionWidth: false, shrinkToFit: false, matchRowHeight: false, fit: false, capitalize: false, doubleUnderline: false, invertColors: false, cropAlpha: false, color: null };
        }
        var parts = specStr.split("-");
        var first = parts[0] || "";
        var prop = first;
        var index = null;
        var match = first.match(/^(\w+)\[(\d+)\]$/);
        if (match) {
            prop = match[1];
            index = parseInt(match[2], 10);
        }
        var isImage = /Image|smallImages|barCode|qrCode/i.test(prop);
        var sizeKey = "small";
        var styleKey = "body";
        var italic = false;
        var align = "left";
        var heightRatio = null;
        var widthMm = null;
        var widthRatio = null;
        var paddingTopMm = null;
        var paddingBottomMm = null;
        var popSectionWidth = false;
        var shrinkToFit = false;
        if (parts.length > 1) {
            var rest = parts.slice(1);
            if (rest.indexOf("italic") >= 0) {
                italic = true;
                rest = rest.filter(function(t) { return t !== "italic"; });
            }
            if (rest.indexOf("shrinkToFit") >= 0) {
                shrinkToFit = true;
                rest = rest.filter(function(t) { return t !== "shrinkToFit"; });
            }
            var matchRowHeight = false;
            if (rest.indexOf("matchRowHeight") >= 0) {
                matchRowHeight = true;
                rest = rest.filter(function(t) { return t !== "matchRowHeight"; });
            }
            var fit = false;
            if (rest.indexOf("fit") >= 0) {
                fit = true;
                rest = rest.filter(function(t) { return t !== "fit"; });
            }
            var capitalize = false;
            if (rest.indexOf("capitalize") >= 0) {
                capitalize = true;
                rest = rest.filter(function(t) { return t !== "capitalize"; });
            }
            var doubleUnderline = false;
            if (rest.indexOf("doubleUnderline") >= 0) {
                doubleUnderline = true;
                rest = rest.filter(function(t) { return t !== "doubleUnderline"; });
            }
            var invertColors = false;
            if (rest.indexOf("invertColors") >= 0) {
                invertColors = true;
                rest = rest.filter(function(t) { return t !== "invertColors"; });
            }
            var cropAlpha = false;
            if (rest.indexOf("cropAlpha") >= 0) {
                cropAlpha = true;
                rest = rest.filter(function(t) { return t !== "cropAlpha"; });
            }
            var color = null;
            for (var ri = rest.length - 1; ri >= 0; ri--) {
                var token = rest[ri];
                var colorMatch = token && token.match(/^color(.+)$/);
                var hrMatch = token && token.match(/^(\d+(?:\.\d+)?)ParentHeight$/);
                var wMatch = token && token.match(/^(\d+(?:\.\d+)?)mmWide$/);
                var wrMatch = token && token.match(/^(\d+(?:\.\d+)?)ParentWidth$/);
                var popSectionMatch = token === "popSectionWidth";
                if (colorMatch) {
                    color = colorMatch[1];
                    rest = rest.slice(0, ri).concat(rest.slice(ri + 1));
                } else if (hrMatch) {
                    heightRatio = parseFloat(hrMatch[1], 10);
                    rest = rest.slice(0, ri).concat(rest.slice(ri + 1));
                } else if (wMatch) {
                    widthMm = parseFloat(wMatch[1], 10);
                    rest = rest.slice(0, ri).concat(rest.slice(ri + 1));
                } else if (wrMatch) {
                    widthRatio = parseFloat(wrMatch[1], 10);
                    rest = rest.slice(0, ri).concat(rest.slice(ri + 1));
                } else if (popSectionMatch) {
                    popSectionWidth = true;
                    rest = rest.slice(0, ri).concat(rest.slice(ri + 1));
                } else {
                    var ptMatch = token && token.match(/^paddingTop(\d+(?:\.\d+)?)mm$/);
                    var pbMatch = token && token.match(/^paddingBottom(\d+(?:\.\d+)?)mm$/);
                    if (ptMatch) {
                        paddingTopMm = parseFloat(ptMatch[1], 10);
                        rest = rest.slice(0, ri).concat(rest.slice(ri + 1));
                    } else if (pbMatch) {
                        paddingBottomMm = parseFloat(pbMatch[1], 10);
                        rest = rest.slice(0, ri).concat(rest.slice(ri + 1));
                    }
                }
            }
            if (rest.length >= 1 && /^(centered|left|right|justify)$/.test(rest[rest.length - 1])) {
                align = rest[rest.length - 1];
                rest = rest.slice(0, -1);
            }
            if (rest.length >= 1 && /^(large|medium|small|xsmall)$/.test(rest[0])) {
                sizeKey = rest[0];
            }
            if (rest.length >= 2 && /^(headings|body)$/.test(rest[1])) {
                styleKey = rest[1];
            }
        }
        return { prop: prop, index: index, sizeKey: sizeKey, styleKey: styleKey, italic: italic, isImage: isImage, align: align, heightRatio: heightRatio, widthMm: widthMm, widthRatio: widthRatio, paddingTopMm: paddingTopMm, paddingBottomMm: paddingBottomMm, popSectionWidth: popSectionWidth, shrinkToFit: shrinkToFit, matchRowHeight: matchRowHeight, fit: fit, capitalize: capitalize, doubleUnderline: doubleUnderline, invertColors: invertColors, cropAlpha: cropAlpha, color: color };
    }

    /**
     * Get content value from labelData for a parsed spec (handles prop, index, and common aliases).
     */
    getSpecValue(spec) {
        var data = this.labelData;
        if (!data) return "";
        var prop = spec.prop;
        if (prop === "heroImage" && data.mainImageUrl != null) prop = "mainImageUrl";
        if (prop === "smallImage" && Array.isArray(data.smallImages) && data.smallImages[0] != null) return data.smallImages[0];
        var propLower = prop.toLowerCase();
        if (propLower === "barcode") {
            var barVal = data.barCode != null ? data.barCode : data.barcode;
            if (barVal != null && barVal !== "") return typeof barVal === "string" ? barVal : (barVal.url ? barVal.url : "");
        }
        if (propLower === "qrcode") {
            var qrVal = data.qrCode != null ? data.qrCode : data.qrcode;
            if (qrVal != null && qrVal !== "") return typeof qrVal === "string" ? qrVal : (qrVal.url ? qrVal.url : "");
        }
        var val = data[prop];
        if ((prop === "tagline") && (val === undefined || val === null || val === "")) val = data.description;
        if (val === undefined || val === null) return "";
        if (spec.index !== null && Array.isArray(val)) return val[spec.index] != null ? val[spec.index] : "";
        if (typeof val === "object" && spec.index !== null) return "";
        if (Array.isArray(val)) return val;
        return typeof val === "string" || typeof val === "number" ? String(val) : (val && val.url ? val.url : "");
    }

    /**
     * Get theme font string for the given style and size. Uses global selectedTheme when available (set by script.js).
     */
    getThemeFont(styleKey, italic, sizeKey) {
        var size = this.getFontSize(sizeKey);
        return this.getThemeFontWithSize(styleKey, italic, size);
    }

    /**
     * Theme font string with an explicit pixel size (for shrink-to-fit).
     */
    getThemeFontWithSize(styleKey, italic, sizePx) {
        var th = (typeof selectedTheme !== "undefined" && selectedTheme) ? selectedTheme : { headings: "Harrington", headingsWeight: "400", body: "Arial" };
        if (styleKey === "headings") {
            var w = th.headingsWeight || "400";
            return (italic ? "italic " : "") + w + " " + sizePx + "px " + (th.headings || "sans-serif");
        }
        return (italic ? "italic " : "") + sizePx + "px " + (th.body || "sans-serif");
    }

    getFontSize(sizeKey) {
        return this.fontSizes[sizeKey] != null ? this.fontSizes[sizeKey] : this.fontSizes.small;
    }

    /**
     * Measure text for SVG layout (uses temporary text element and getBBox).
     */
    measureTextSvg(text, fontCss) {
        if (!this.svg) return { width: 0, height: 0 };
        var t = document.createElementNS("http://www.w3.org/2000/svg", "text");
        t.setAttribute("x", "0");
        t.setAttribute("y", "0");
        t.setAttribute("style", "font: " + fontCss);
        t.textContent = text;
        this.svg.appendChild(t);
        var b = t.getBBox();
        this.svg.removeChild(t);
        return { width: b.width, height: b.height };
    }

    /**
     * Wrap text to fit within maxWidth (px). Returns array of lines.
     */
    wrapText(text, fontCss, maxWidth) {
        if (!text || maxWidth <= 0) return [""];
        var words = String(text).split(/\s+/);
        if (words.length === 0) return [""];
        var lines = [];
        var current = "";
        for (var i = 0; i < words.length; i++) {
            var word = words[i];
            var trial = current ? current + " " + word : word;
            var w = this.measureTextSvg(trial, fontCss).width;
            if (w <= maxWidth) {
                current = trial;
            } else {
                if (current) lines.push(current);
                current = word;
                if (this.measureTextSvg(word, fontCss).width > maxWidth) {
                    var chunk = "";
                    for (var c = 0; c < word.length; c++) {
                        var next = chunk + word[c];
                        if (this.measureTextSvg(next, fontCss).width <= maxWidth) chunk = next;
                        else {
                            if (chunk) lines.push(chunk);
                            chunk = word[c];
                        }
                    }
                    current = chunk;
                }
            }
        }
        if (current) lines.push(current);
        return lines.length ? lines : [""];
    }

    /**
     * Load an image and return its natural dimensions. Used for fixed-width images (e.g. barcode) to get aspect ratio.
     */
    loadImageDimensions(url) {
        if (!url || typeof url !== "string") return Promise.resolve(null);
        return new Promise(function(resolve) {
            var img = new Image();
            img.onload = function() {
                resolve({ w: img.naturalWidth, h: img.naturalHeight });
            };
            img.onerror = function() { resolve(null); };
            img.crossOrigin = "anonymous";
            img.src = url;
        });
    }

    /**
     * Load an image, draw to canvas, and return alpha bounding box { minX, minY, w, h, natW, natH }. Returns null if no alpha or error.
     */
    loadImageAlphaBounds(url) {
        if (!url || typeof url !== "string") return Promise.resolve(null);
        var self = this;
        return new Promise(function(resolve) {
            var img = new Image();
            img.onload = function() {
                var nw = img.naturalWidth;
                var nh = img.naturalHeight;
                if (nw <= 0 || nh <= 0) { resolve(null); return; }
                try {
                    var canvas = document.createElement("canvas");
                    canvas.width = nw;
                    canvas.height = nh;
                    var ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0);
                    var data = ctx.getImageData(0, 0, nw, nh).data;
                    var minX = nw, minY = nh, maxX = -1, maxY = -1;
                    var alphaThreshold = 1;
                    for (var py = 0; py < nh; py++) {
                        for (var px = 0; px < nw; px++) {
                            var i = (py * nw + px) * 4;
                            if (data[i + 3] > alphaThreshold) {
                                if (px < minX) minX = px;
                                if (px > maxX) maxX = px;
                                if (py < minY) minY = py;
                                if (py > maxY) maxY = py;
                            }
                        }
                    }
                    if (maxX < minX || maxY < minY) {
                        resolve({ minX: 0, minY: 0, w: nw, h: nh, natW: nw, natH: nh });
                        return;
                    }
                    resolve({ minX: minX, minY: minY, w: maxX - minX + 1, h: maxY - minY + 1, natW: nw, natH: nh });
                } catch (e) {
                    resolve(null);
                }
            };
            img.onerror = function() { resolve(null); };
            img.crossOrigin = "anonymous";
            img.src = url;
        });
    }

    /**
     * Collect image URLs that have widthMm but no heightRatio (e.g. barcode) so we can load and cache their dimensions.
     */
    collectFixedWidthImageUrls() {
        var urls = [];
        var self = this;
        function add(specStr) {
            var spec = self.parseSpec(specStr);
            if (spec.isImage && (spec.widthMm != null || spec.widthRatio != null || spec.popSectionWidth) && spec.heightRatio == null && !spec.matchRowHeight) {
                var value = self.getSpecValue(spec);
                if (value && typeof value === "string") urls.push(value);
            }
        }
        function walk(items) {
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                if (typeof item === "string") add(item);
                else if (Array.isArray(item)) walk(item);
            }
        }
        var sl = this.sectionLayout;
        for (var key in sl) {
            if (!sl[key].subsections) continue;
            for (var r = 0; r < sl[key].subsections.length; r++) {
                var row = sl[key].subsections[r];
                walk(Array.isArray(row) ? row : [row]);
            }
        }
        return urls;
    }

    /**
     * Collect image URLs for specs that have "fit" (so we can preload their dimensions for section-fit scaling).
     */
    collectFitImageUrls() {
        var urls = [];
        var self = this;
        function add(specStr) {
            var spec = self.parseSpec(specStr);
            if (spec.isImage && spec.fit) {
                var value = self.getSpecValue(spec);
                if (value && typeof value === "string") urls.push(value);
            }
        }
        function walk(items) {
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                if (typeof item === "string") add(item);
                else if (Array.isArray(item)) walk(item);
            }
        }
        var sl = this.sectionLayout;
        for (var key in sl) {
            if (!sl[key].subsections) continue;
            for (var r = 0; r < sl[key].subsections.length; r++) {
                var row = sl[key].subsections[r];
                walk(Array.isArray(row) ? row : [row]);
            }
        }
        return urls;
    }

    /**
     * Collect image URLs for specs that have "cropAlpha" (so we can preload alpha bounds).
     */
    collectCropAlphaImageUrls() {
        var urls = [];
        var self = this;
        function add(specStr) {
            var spec = self.parseSpec(specStr);
            if (spec.isImage && spec.cropAlpha) {
                var value = self.getSpecValue(spec);
                if (value && typeof value === "string") urls.push(value);
            }
        }
        function walk(items) {
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                if (typeof item === "string") add(item);
                else if (Array.isArray(item)) walk(item);
            }
        }
        var sl = this.sectionLayout;
        for (var key in sl) {
            if (!sl[key].subsections) continue;
            for (var r = 0; r < sl[key].subsections.length; r++) {
                var row = sl[key].subsections[r];
                walk(Array.isArray(row) ? row : [row]);
            }
        }
        return urls;
    }

    /**
     * Count rows in a section that contain at least one fit image. Used for Stage 2 height reduction.
     */
    countFitImageRows(subsections) {
        var n = 0;
        for (var r = 0; r < subsections.length; r++) {
            var row = subsections[r];
            if (!Array.isArray(row)) row = [row];
            for (var i = 0; i < row.length; i++) {
                var item = row[i];
                if (typeof item === "string") {
                    var spec = this.parseSpec(item);
                    if (spec.isImage && spec.fit) { n++; break; }
                }
            }
        }
        return n;
    }

    /**
     * Get natural width and height (px) for a fit image spec. Uses _imageDimensions or _imageCropAlpha (when cropAlpha) or 100x100.
     */
    getNaturalSizeForFitSpec(spec) {
        if (!spec || !spec.isImage || !spec.fit) return { w: 100, h: 100 };
        var value = this.getSpecValue(spec);
        var url = value && typeof value === "string" ? value : "";
        if (spec.cropAlpha && this._imageCropAlpha && this._imageCropAlpha[url]) {
            var crop = this._imageCropAlpha[url];
            if (crop.w > 0 && crop.h > 0) return { w: crop.w, h: crop.h };
        }
        var dim = this._imageDimensions && url ? this._imageDimensions[url] : null;
        if (dim && dim.w > 0 && dim.h > 0) return { w: dim.w, h: dim.h };
        return { w: 100, h: 100 };
    }

    /**
     * Preload dimensions for images that use widthMm without heightRatio (e.g. barcode) and fit images. Fills this._imageDimensions[url].
     * Also preloads alpha bounds for cropAlpha images into this._imageCropAlpha[url].
     */
    preloadImageDimensions() {
        var urls = this.collectFixedWidthImageUrls().concat(this.collectFitImageUrls());
        var seen = {};
        var unique = [];
        for (var u = 0; u < urls.length; u++) {
            if (!seen[urls[u]]) { seen[urls[u]] = true; unique.push(urls[u]); }
        }
        this._imageDimensions = this._imageDimensions || {};
        var self = this;
        var dimPromises = unique.map(function(url) {
            return self.loadImageDimensions(url).then(function(dim) {
                if (dim) self._imageDimensions[url] = dim;
            });
        });
        var cropUrls = this.collectCropAlphaImageUrls();
        var cropSeen = {};
        var cropUnique = [];
        for (var c = 0; c < cropUrls.length; c++) {
            if (!cropSeen[cropUrls[c]]) { cropSeen[cropUrls[c]] = true; cropUnique.push(cropUrls[c]); }
        }
        this._imageCropAlpha = this._imageCropAlpha || {};
        var cropPromises = cropUnique.map(function(url) {
            return self.loadImageAlphaBounds(url).then(function(bounds) {
                if (bounds) self._imageCropAlpha[url] = bounds;
            });
        });
        return Promise.all(dimPromises.concat(cropPromises));
    }

    render() {
        var pageKey = document.getElementById("pageSizeSelect").value;
        var page = pages[pageKey];
        this.dpi = 300;
        var pageWidthPx = page.width / 25.4 * this.dpi;
        var pageHeightPx = page.height / 25.4 * this.dpi;
        this.marginPx = page.margin / 25.4 * this.dpi;
        this.pageWidthPx = pageWidthPx;
        this.pageHeightPx = pageHeightPx;

        var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.id = "canvas";
        svg.setAttribute("width", pageWidthPx);
        svg.setAttribute("height", pageHeightPx);
        svg.setAttribute("viewBox", "0 0 " + pageWidthPx + " " + pageHeightPx);
        svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        this.svg = svg;

        var container = document.querySelector(".canvas-container");
        if (container) container.appendChild(svg);
        else document.body.appendChild(svg);
        var self = this;
        return this.preloadImageDimensions().then(function() {
            self.layout(pageHeightPx);
        });
    }

    layout(pageHeightPx) {
        var scale = this.dpi / 25.4;
        var w = this.sleaveWidth * scale;
        var frontBackH = this.boxSize.height * scale;
        var spineH = this.boxSize.depth * scale;
        var overlapH = 10 * scale; // 10mm overlap section

        var pageH = pageHeightPx;
        var stackH = overlapH + spineH*2 + frontBackH*2; // overlap, top, front, bottom, overlap
        var tooTall = stackH > pageH;
        if (tooTall) {
            alert(stackH/scale+"mm sleave cannot fit on page which is "+ pageH/scale +"  tall so side by side layout will be used.");
            // Two-column (double) layout: left column contains overlap, top, front, bottom, overlap;
            // right column holds back beside the front section.  Each column should be centered
            // within its half of the page.
            this.layoutDouble(w, frontBackH, spineH, overlapH);
        } else {
            // Single column: back, top, front, bottom, overlap centered on page
            this.layoutSingle(w, frontBackH, spineH, overlapH);
        }
    }

    layoutSingle(w, frontBackH, spineH, overlapH) {
        // compute total height of the stacked sections
        var totalH = frontBackH * 2 + spineH * 2 + overlapH;
        // start y so stack is vertically centered on page; it's fine for y to be
        // negative when the stack is taller than the page – that causes the
        // drawing to overflow equally above and below the sheet.
        var y = (this.pageHeightPx - totalH) / 2;
        // center of the page horizontally
        var pageCenterX = this.pageWidthPx / 2;
        this.sectionLayout.back.xc = pageCenterX;
        this.sectionLayout.back.yc = y + frontBackH / 2;
        this.sectionLayout.back.w = w;
        this.sectionLayout.back.h = frontBackH;
        this.sectionLayout.back.rot = 180;
        y += frontBackH;

        this.sectionLayout.top.xc = pageCenterX;
        this.sectionLayout.top.yc = y + spineH / 2;
        this.sectionLayout.top.w = w;
        this.sectionLayout.top.h = spineH;
        this.sectionLayout.top.rot = 0;
        y += spineH;

        this.sectionLayout.front.xc = pageCenterX;
        this.sectionLayout.front.yc = y + frontBackH / 2;
        this.sectionLayout.front.w = w;
        this.sectionLayout.front.h = frontBackH;
        this.sectionLayout.front.rot = 0;
        y += frontBackH;

        this.sectionLayout.bottom.xc = pageCenterX;
        this.sectionLayout.bottom.yc = y + spineH / 2;
        this.sectionLayout.bottom.w = w;
        this.sectionLayout.bottom.h = spineH;
        this.sectionLayout.bottom.rot = 0;
        y += spineH;

        this.sectionLayout.overlap.xc = pageCenterX;
        this.sectionLayout.overlap.yc = y + overlapH / 2;
        this.sectionLayout.overlap.w = w;
        this.sectionLayout.overlap.h = overlapH;
        this.sectionLayout.overlap.rot = 0;

        this.drawSection("back", "Back");
        this.drawSection("top", "Top");
        this.drawSection("front", "Front");
        this.drawSection("bottom", "Bottom");
        this.drawSection("overlap", "Overlap");
    }

    layoutDouble(w, frontBackH, spineH, overlapH) {
        // Compute horizontal centers for left and right columns at quarter points of the page
        var leftXc = this.pageWidthPx / 4;
        var rightXc = this.pageWidthPx * 3 / 4;
        // left column contains overlapTop + top + front + bottom + overlapBottom
        // which is one front/back section, two spine sections and two overlaps
        var totalLeftH = frontBackH + spineH * 2 + overlapH * 2;
        var yLeft = (this.pageHeightPx - totalLeftH) / 2;
        // right column only holds the back section; center that separately
        var yRight = (this.pageHeightPx - frontBackH) / 2;
        var y = yLeft; // use y for placing left-column sections

        this.sectionLayout.overlapTop.xc = leftXc;
        this.sectionLayout.overlapTop.yc = y + overlapH / 2;
        this.sectionLayout.overlapTop.w = w;
        this.sectionLayout.overlapTop.h = overlapH;
        this.sectionLayout.overlapTop.rot = 0;
        y += overlapH;

        this.sectionLayout.top.xc = leftXc;
        this.sectionLayout.top.yc = y + spineH / 2;
        this.sectionLayout.top.w = w;
        this.sectionLayout.top.h = spineH;
        this.sectionLayout.top.rot = 0;
        y += spineH;

        this.sectionLayout.front.xc = leftXc;
        this.sectionLayout.front.yc = y + frontBackH / 2;
        this.sectionLayout.front.w = w;
        this.sectionLayout.front.h = frontBackH;
        this.sectionLayout.front.rot = 0;
        y += frontBackH;

        this.sectionLayout.bottom.xc = leftXc;
        this.sectionLayout.bottom.yc = y + spineH / 2;
        this.sectionLayout.bottom.w = w;
        this.sectionLayout.bottom.h = spineH;
        this.sectionLayout.bottom.rot = 0;
        y += spineH;

        this.sectionLayout.overlapBottom.xc = leftXc;
        this.sectionLayout.overlapBottom.yc = y + overlapH / 2;
        this.sectionLayout.overlapBottom.w = w;
        this.sectionLayout.overlapBottom.h = overlapH;
        this.sectionLayout.overlapBottom.rot = 0;

        // place back section centered in right half, aligned vertically with front
        this.sectionLayout.back.xc = rightXc;
        // position back vertically centred in its half of the page, not tied to left
        this.sectionLayout.back.yc = yRight + frontBackH / 2;
        this.sectionLayout.back.w = w;
        this.sectionLayout.back.h = frontBackH;
        this.sectionLayout.back.rot = 0; // same orientation as front

        this.drawSection("overlapTop", "Overlap");
        this.drawSection("top", "Top");
        this.drawSection("front", "Front");
        this.drawSection("bottom", "Bottom");
        this.drawSection("overlapBottom", "Overlap");
        this.drawSection("back", "Back");

        var scale = this.dpi / 25.4;
        var centerX = this.pageWidthPx / 2;
        var cutLenPx = 5 * scale;
        var cutThickPx = 0.2 * scale;
        var topCut = document.createElementNS("http://www.w3.org/2000/svg", "line");
        topCut.setAttribute("x1", centerX);
        topCut.setAttribute("y1", 0);
        topCut.setAttribute("x2", centerX);
        topCut.setAttribute("y2", cutLenPx);
        topCut.setAttribute("stroke", "#000");
        topCut.setAttribute("stroke-width", cutThickPx);
        topCut.setAttribute("stroke-opacity", "0.5");
        this.svg.appendChild(topCut);
        var bottomCut = document.createElementNS("http://www.w3.org/2000/svg", "line");
        bottomCut.setAttribute("x1", centerX);
        bottomCut.setAttribute("y1", this.pageHeightPx - cutLenPx);
        bottomCut.setAttribute("x2", centerX);
        bottomCut.setAttribute("y2", this.pageHeightPx);
        bottomCut.setAttribute("stroke", "#000");
        bottomCut.setAttribute("stroke-width", cutThickPx);
        bottomCut.setAttribute("stroke-opacity", "0.5");
        this.svg.appendChild(bottomCut);
    }

    /**
     * Get vertical padding (mm) above and below a subsection row. Uses paddingTopMm from the row's first spec
     * and paddingBottomMm from the row's last spec; default is subsectionRowPaddingMm.
     */
    getRowPaddingMm(row) {
        var defaultMm = this.subsectionRowPaddingMm != null ? this.subsectionRowPaddingMm : 1;
        function firstSpecStr(r) {
            if (!Array.isArray(r) || r.length === 0) return null;
            var first = r[0];
            return typeof first === "string" ? first : firstSpecStr(first);
        }
        function lastSpecStr(r) {
            if (!Array.isArray(r) || r.length === 0) return null;
            var last = r[r.length - 1];
            return typeof last === "string" ? last : lastSpecStr(last);
        }
        var firstStr = firstSpecStr(row);
        var lastStr = lastSpecStr(row);
        var firstSpec = firstStr ? this.parseSpec(firstStr) : null;
        var lastSpec = lastStr ? this.parseSpec(lastStr) : null;
        return {
            top: (firstSpec && firstSpec.paddingTopMm != null) ? firstSpec.paddingTopMm : defaultMm,
            bottom: (lastSpec && lastSpec.paddingBottomMm != null) ? lastSpec.paddingBottomMm : defaultMm
        };
    }

    /**
     * Draw one section as SVG: outline and subsections. Uses sectionLayout center, size (w,h) and rotation.
     * @param {string} key - Section key in sectionLayout (back, top, front, bottom, overlap)
     * @param {string} title - Unused (kept for call-site compatibility)
     */
    drawSection(key, title) {
        var sl = this.sectionLayout[key];
        if (!sl || !this.svg) return;
        var xc = sl.xc;
        var yc = sl.yc;
        var w = sl.w;
        var h = sl.h;
        var rotDeg = sl.rot || 0;

        var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttribute("transform", "translate(" + xc + "," + yc + ") rotate(" + rotDeg + ")");

        if (sl.backgroundColor) {
            var bgRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            bgRect.setAttribute("x", -w / 2);
            bgRect.setAttribute("y", -h / 2);
            bgRect.setAttribute("width", w);
            bgRect.setAttribute("height", h);
            bgRect.setAttribute("fill", sl.backgroundColor);
            g.appendChild(bgRect);
        }

        var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", -w / 2);
        rect.setAttribute("y", -h / 2);
        rect.setAttribute("width", w);
        rect.setAttribute("height", h);
        rect.setAttribute("fill", "none");
        rect.setAttribute("stroke", "#000");
        var scale = this.dpi / 25.4;
        var strokePx = (this.lineThicknessMm != null ? this.lineThicknessMm : 0.5) * scale;
        rect.setAttribute("stroke-width", strokePx);
        g.appendChild(rect);

        if (sl.subsections && sl.subsections.length > 0) {
            var sectionMarginPx = this.sectionMarginMm * scale;
            var contentLeft = -w / 2 + sectionMarginPx;
            var contentWidth = w - 2 * sectionMarginPx;
            var contentHeight = h;
            var subsectionPadding = 0;
            var measureGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
            var totalContentHeight = 0;
            for (var r = 0; r < sl.subsections.length; r++) {
                var row = sl.subsections[r];
                if (!Array.isArray(row)) row = [row];
                var pad = this.getRowPaddingMm(row);
                var paddingTopPx = pad.top * scale;
                var paddingBottomPx = pad.bottom * scale;
                var result = this.layoutItems(measureGroup, contentLeft, totalContentHeight + paddingTopPx, row, contentWidth, contentHeight, subsectionPadding, true, -w / 2, contentWidth, 0, w);
                if (result && (result.w > 0 || result.h > 0)) {
                    totalContentHeight += paddingTopPx + result.h + paddingBottomPx;
                }
            }
            var reductionPerRow = 0;
            if (totalContentHeight > h) {
                var numFitImageRows = this.countFitImageRows(sl.subsections);
                if (numFitImageRows > 0) reductionPerRow = (totalContentHeight - h) / numFitImageRows;
            }
            var contentTop = reductionPerRow > 0 ? -h / 2 : (-h / 2 + (h - totalContentHeight) / 2);
            var runningY = contentTop;
            for (var r = 0; r < sl.subsections.length; r++) {
                var row = sl.subsections[r];
                if (!Array.isArray(row)) row = [row];
                var pad = this.getRowPaddingMm(row);
                var paddingTopPx = pad.top * scale;
                var paddingBottomPx = pad.bottom * scale;
                var result = this.layoutItems(g, contentLeft, runningY + paddingTopPx, row, contentWidth, contentHeight, subsectionPadding, true, -w / 2, contentWidth, reductionPerRow, w);
                if (result && (result.w > 0 || result.h > 0)) {
                    runningY += paddingTopPx + result.h + paddingBottomPx;
                }
            }
        }

        this.svg.appendChild(g);
    }

    /**
     * Get the fixed width (px) for an item when in a horizontal row, or null if the item is flexible.
     * parentIsHorizontal true = item is a vertical stack: it counts as ONE cell; width is max of its rows' widths.
     * sectionHeight (optional) is used so height-dimensioned cells (e.g. 0.8ParentHeight) get implicit width = height for allocation.
     * sectionWidth (optional) is used for widthRatio (e.g. 0.5ParentWidth).
     */
    getFixedWidth(item, parentIsHorizontal, sectionHeight, sectionWidth, sectionFullWidth) {
        var scale = this.dpi / 25.4;
        if (typeof item === "string") {
            var spec = this.parseSpec(item);
            if (spec.widthMm != null) return spec.widthMm * scale;
            if (spec.widthRatio != null && sectionWidth != null) return sectionWidth * spec.widthRatio;
            if (spec.popSectionWidth) {
                var baseW = sectionFullWidth != null ? sectionFullWidth : sectionWidth;
                if (baseW != null) return baseW + 2 * ((this.popSectionWidthMm != null ? this.popSectionWidthMm : 0) * scale);
            }
            if (spec.heightRatio != null && sectionHeight != null) return sectionHeight * spec.heightRatio;
            return null;
        }
        if (Array.isArray(item)) {
            if (parentIsHorizontal) {
                var maxW = 0;
                var anyNull = false;
                for (var i = 0; i < item.length; i++) {
                    var c = this.getFixedWidth(item[i], false, sectionHeight, sectionWidth, sectionFullWidth);
                    if (c == null) anyNull = true;
                    else if (c > maxW) maxW = c;
                }
                return anyNull ? null : maxW;
            } else {
                var sum = 0;
                for (var j = 0; j < item.length; j++) {
                    var w = this.getFixedWidth(item[j], true, sectionHeight, sectionWidth, sectionFullWidth);
                    if (w == null) return null;
                    sum += w;
                }
                return sum;
            }
        }
        return null;
    }

    /**
     * Layout items (spec strings or nested arrays) in one direction; nested arrays use the opposite direction.
     * For horizontal rows: each item (string or vertical array) is ONE cell. Dimensioned cells (mmWide) get their
     * width first; remaining width is shared equally by flexible cells.
     */
    layoutItems(sectionGroup, x, y, items, sectionWidth, sectionHeight, padding, isHorizontal, fullSectionLeft, fullSectionWidth, reductionPerRow, sectionFullWidth) {
        padding = padding != null ? padding : 4;
        reductionPerRow = reductionPerRow != null ? reductionPerRow : 0;
        var scale = this.dpi / 25.4;
        var rowGapPx = isHorizontal ? (this.rowGapMm != null ? this.rowGapMm : 1) * scale : padding;
        var curX = x;
        var curY = y;
        var maxW = 0;
        var maxH = 0;
        var assignedWidths = [];
        if (isHorizontal && items.length > 0) {
            var fixedWidths = [];
            var sumFixed = 0;
            var flexCount = 0;
            for (var i = 0; i < items.length; i++) {
                var fw = this.getFixedWidth(items[i], true, sectionHeight, sectionWidth, sectionFullWidth);
                fixedWidths.push(fw);
                if (fw != null) sumFixed += fw;
                else flexCount++;
            }
            var gaps = Math.max(0, items.length - 1) * rowGapPx;
            var remaining = Math.max(0, sectionWidth - sumFixed - gaps);
            var flexWidth = flexCount > 0 ? remaining / flexCount : 0;
            for (var a = 0; a < items.length; a++) {
                assignedWidths.push(fixedWidths[a] != null ? fixedWidths[a] : flexWidth);
            }
        }
        var rowGroups = [];
        var rowSizes = [];
        var rowItems = [];
        var rowCellWidths = [];
        var rowMatchRowHeight = [];
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var cellWidth = isHorizontal && assignedWidths[i] != null ? assignedWidths[i] : sectionWidth;
            var cellHeight = sectionHeight;
            var size;
            if (isHorizontal) {
                var rowG = document.createElementNS("http://www.w3.org/2000/svg", "g");
                var matchRow = false;
                if (typeof item === "string") {
                    var spec = this.parseSpec(item);
                    matchRow = !!(spec && spec.matchRowHeight);
                    if (matchRow) cellHeight = 0;
                    var useFullWidth = !isHorizontal || items.length === 1;
                    size = this.drawSubsection(rowG, 0, 0, item, cellWidth, cellHeight, padding, useFullWidth, fullSectionLeft, fullSectionWidth, curX, reductionPerRow, sectionFullWidth);
                } else if (Array.isArray(item)) {
                    size = this.layoutItems(rowG, 0, 0, item, cellWidth, cellHeight, padding, !isHorizontal, fullSectionLeft, fullSectionWidth, reductionPerRow, sectionFullWidth);
                } else {
                    continue;
                }
                if (!size || (size.w === 0 && size.h === 0)) continue;
                sectionGroup.appendChild(rowG);
                rowGroups.push(rowG);
                rowSizes.push(size);
                rowItems.push(item);
                rowCellWidths.push(cellWidth);
                rowMatchRowHeight.push(matchRow);
                curX += size.w + (i < items.length - 1 ? rowGapPx : 0);
                if (size.h > maxH) maxH = size.h;
            } else {
                if (typeof item === "string") {
                    var useFullWidth = !isHorizontal || items.length === 1;
                    size = this.drawSubsection(sectionGroup, curX, curY, item, cellWidth, cellHeight, padding, useFullWidth, fullSectionLeft, fullSectionWidth, 0, reductionPerRow, sectionFullWidth);
                } else if (Array.isArray(item)) {
                    size = this.layoutItems(sectionGroup, curX, curY, item, cellWidth, cellHeight, padding, !isHorizontal, fullSectionLeft, fullSectionWidth, reductionPerRow, sectionFullWidth);
                } else {
                    continue;
                }
                if (!size || (size.w === 0 && size.h === 0)) continue;
                curY += size.h + padding;
                if (size.w > maxW) maxW = size.w;
            }
        }
        if (isHorizontal && rowGroups.length > 0) {
            var rowBox = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rowBox.setAttribute("x", x);
            rowBox.setAttribute("y", y);
            rowBox.setAttribute("width", sectionWidth);
            rowBox.setAttribute("height", maxH);
            rowBox.setAttribute("fill", "none");
            var subsectionBordersEl = document.getElementById("subsectionBordersCheckbox");
            rowBox.setAttribute("stroke", subsectionBordersEl && !subsectionBordersEl.checked ? "none" : "#000");
            sectionGroup.insertBefore(rowBox, rowGroups[0]);
            var offsetX = x;
            for (var ri = 0; ri < rowGroups.length; ri++) {
                if (rowMatchRowHeight[ri] && maxH > 0) {
                    var rowG = rowGroups[ri];
                    var it = rowItems[ri];
                    var cw = rowCellWidths[ri];
                    rowG.innerHTML = "";
                    var newSize;
                    if (typeof it === "string") {
                        newSize = this.drawSubsection(rowG, 0, 0, it, cw, maxH, padding, items.length === 1, fullSectionLeft, fullSectionWidth, offsetX, reductionPerRow, sectionFullWidth);
                    } else {
                        newSize = this.layoutItems(rowG, 0, 0, it, cw, maxH, padding, false, fullSectionLeft, fullSectionWidth, reductionPerRow, sectionFullWidth);
                    }
                    if (newSize) rowSizes[ri] = newSize;
                }
                offsetX += rowSizes[ri].w + (ri < rowGroups.length - 1 ? rowGapPx : 0);
            }
            var totalContentW = 0;
            for (var ti = 0; ti < rowGroups.length; ti++) {
                totalContentW += rowSizes[ti].w;
                if (ti > 0) totalContentW += rowGapPx;
            }
            var startX = x + (sectionWidth - totalContentW) / 2;
            offsetX = startX;
            for (var ri = 0; ri < rowGroups.length; ri++) {
                rowGroups[ri].setAttribute("transform", "translate(" + offsetX + "," + (y + (maxH - rowSizes[ri].h) / 2) + ")");
                offsetX += rowSizes[ri].w + (ri < rowGroups.length - 1 ? rowGapPx : 0);
            }
        }
        var n = items.length;
        var totalW = isHorizontal ? (curX - x) : maxW;
        var totalH = isHorizontal ? maxH : (curY - y) - (n >= 1 ? padding : 0);
        return { w: Math.max(0, totalW), h: Math.max(0, totalH) };
    }

    /**
     * Draw one subsection as SVG at (x,y) inside sectionGroup. Returns { w, h } of the box drawn.
     */
    drawSubsection(sectionGroup, x, y, specStr, sectionWidth, sectionHeight, padding, useFullWidth, fullSectionLeft, fullSectionWidth, sectionOriginX, reductionPerRow, sectionFullWidth) {
        padding = padding != null ? padding : 4;
        useFullWidth = !!useFullWidth;
        reductionPerRow = reductionPerRow != null ? reductionPerRow : 0;
        if (typeof specStr === "string" && /^-{3,}/.test(specStr)) {
            var scale = this.dpi / 25.4;
            var lineThicknessPx = (this.lineThicknessMm != null ? this.lineThicknessMm : 0.5) * scale;
            var breakPaddingMm = 1;
            var breakPaddingPx = breakPaddingMm * scale;
            var lineY = y + breakPaddingPx + lineThicknessPx / 2;
            var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", x);
            line.setAttribute("y1", lineY);
            line.setAttribute("x2", x + sectionWidth);
            line.setAttribute("y2", lineY);
            line.setAttribute("stroke", "#000");
            line.setAttribute("stroke-opacity", "0.5");
            line.setAttribute("stroke-width", lineThicknessPx);
            sectionGroup.appendChild(line);
            var breakH = breakPaddingPx + lineThicknessPx + breakPaddingPx;
            return { w: sectionWidth, h: breakH };
        }
        var spec = this.parseSpec(specStr);
        if (spec.prop === "decorativeFiller") {
            var scale = this.dpi / 25.4;
            var thinPx = (this.lineThicknessMm != null ? this.lineThicknessMm : 0.5) * scale;
            var spaceMm = 2;
            var spacePx = spaceMm * scale;
            var gapBetweenMm = (this.decorativeLineSpacingMm != null ? this.decorativeLineSpacingMm : 2);
            var gapBetweenPx = gapBetweenMm * scale;
            var drawW = (this.sleaveWidth != null ? this.sleaveWidth : 95) * scale;
            var drawX = -drawW / 2 - (sectionOriginX != null ? sectionOriginX : 0);
            for (var di = 0; di < 2; di++) {
                var lineY = y + spacePx + thinPx / 2 + di * (thinPx + gapBetweenPx);
                var decoLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
                decoLine.setAttribute("x1", drawX);
                decoLine.setAttribute("y1", lineY);
                decoLine.setAttribute("x2", drawX + drawW);
                decoLine.setAttribute("y2", lineY);
                decoLine.setAttribute("stroke", "#000");
                decoLine.setAttribute("stroke-opacity", "0.5");
                decoLine.setAttribute("stroke-width", thinPx);
                sectionGroup.appendChild(decoLine);
            }
            var decoH = spacePx + thinPx + gapBetweenPx + thinPx + spacePx;
            return { w: sectionWidth, h: decoH };
        }
        var value = this.getSpecValue(spec);
        var boxW = 100;
        var boxH = 100;
        var text = "";
        var isImage = spec.isImage || (typeof value === "string" && /\.(jpg|jpeg|png|gif|webp|avif)|^(https?:\/\/|photos\/)/i.test(value));

        if (isImage) {
            var scale = this.dpi / 25.4;
            var parentWidthPx = fullSectionWidth != null ? fullSectionWidth : sectionWidth;
            if (spec.fit) {
                var nat = this.getNaturalSizeForFitSpec(spec);
                boxW = sectionWidth;
                boxH = nat.w > 0 ? sectionWidth * (nat.h / nat.w) : sectionWidth;
                if (reductionPerRow > 0 && boxH > 0) {
                    boxH = Math.max(0, boxH - reductionPerRow);
                    boxW = nat.w > 0 ? boxH * (nat.w / nat.h) : boxH;
                }
            } else if (spec.widthMm != null) {
                boxW = spec.widthMm * scale;
            } else if (spec.popSectionWidth) {
                var sectionWidthForPop = sectionFullWidth != null ? sectionFullWidth : parentWidthPx;
                boxW = sectionWidthForPop + 2 * ((this.popSectionWidthMm != null ? this.popSectionWidthMm : 0) * scale);
            } else if (spec.widthRatio != null) {
                boxW = parentWidthPx * spec.widthRatio;
            } else if (spec.heightRatio != null) {
                boxH = sectionHeight * spec.heightRatio;
            }
            if (!spec.fit) {
                if (spec.matchRowHeight && sectionHeight > 0) {
                    boxH = sectionHeight;
                    if (spec.widthMm == null && spec.widthRatio == null && !spec.popSectionWidth) boxW = boxH;
                } else if (spec.widthMm == null && spec.widthRatio == null && !spec.popSectionWidth && spec.heightRatio == null) {
                    boxW = 100;
                    boxH = 100;
                } else if (spec.widthMm == null && spec.widthRatio == null && !spec.popSectionWidth) boxW = boxH;
                else if (spec.heightRatio == null) {
                    var imgUrl = value && typeof value === "string" ? value : "";
                    var crop = spec.cropAlpha && this._imageCropAlpha && imgUrl ? this._imageCropAlpha[imgUrl] : null;
                    var dim = this._imageDimensions && imgUrl ? this._imageDimensions[imgUrl] : null;
                    if (crop && crop.w > 0) boxH = boxW * (crop.h / crop.w);
                    else if (dim && dim.w > 0) boxH = boxW * (dim.h / dim.w);
                    else boxH = boxW;
                }
            }
            var imgUrl = value && typeof value === "string" ? value : "";
            var crop = spec.cropAlpha && this._imageCropAlpha && imgUrl ? this._imageCropAlpha[imgUrl] : null;
            if (spec.cropAlpha && crop) {
                var cscale = Math.min(boxW / crop.w, boxH / crop.h);
                var imgW = crop.natW * cscale;
                var imgH = crop.natH * cscale;
                var imgX = -crop.minX * cscale;
                var imgY = -crop.minY * cscale;
                var defs = this.svg.querySelector("defs");
                if (!defs) {
                    defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
                    this.svg.insertBefore(defs, this.svg.firstChild);
                }
                this._clipAlphaId = (this._clipAlphaId || 0) + 1;
                var clipId = "clipAlpha-" + this._clipAlphaId;
                var clipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
                clipPath.setAttribute("id", clipId);
                var clipRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                clipRect.setAttribute("x", 0);
                clipRect.setAttribute("y", 0);
                clipRect.setAttribute("width", boxW);
                clipRect.setAttribute("height", boxH);
                clipPath.appendChild(clipRect);
                defs.appendChild(clipPath);
                var grp = document.createElementNS("http://www.w3.org/2000/svg", "g");
                grp.setAttribute("transform", "translate(" + x + "," + y + ")");
                grp.setAttribute("clip-path", "url(#" + clipId + ")");
                var imgEl = document.createElementNS("http://www.w3.org/2000/svg", "image");
                imgEl.setAttribute("x", imgX);
                imgEl.setAttribute("y", imgY);
                imgEl.setAttribute("width", imgW);
                imgEl.setAttribute("height", imgH);
                imgEl.setAttribute("preserveAspectRatio", "none");
                if (spec.invertColors) imgEl.setAttribute("style", "filter: invert(1)");
                imgEl.setAttributeNS("http://www.w3.org/1999/xlink", "href", imgUrl);
                imgEl.setAttribute("href", imgUrl);
                grp.appendChild(imgEl);
                sectionGroup.appendChild(grp);
            } else {
                var imgEl = document.createElementNS("http://www.w3.org/2000/svg", "image");
                imgEl.setAttribute("x", x);
                imgEl.setAttribute("y", y);
                imgEl.setAttribute("width", boxW);
                imgEl.setAttribute("height", boxH);
                imgEl.setAttribute("preserveAspectRatio", "xMidYMid meet");
                if (spec.invertColors) imgEl.setAttribute("style", "filter: invert(1)");
                imgEl.setAttributeNS("http://www.w3.org/1999/xlink", "href", imgUrl);
                imgEl.setAttribute("href", imgUrl);
                sectionGroup.appendChild(imgEl);
            }
            return { w: boxW, h: boxH };
        }

        var scale = this.dpi / 25.4;
        if (spec.widthMm != null) boxW = spec.widthMm * scale;
        if (spec.heightRatio != null) boxH = sectionHeight * spec.heightRatio;
        var contentWidth = Math.max(0, sectionWidth - padding * 2);
        if (spec.widthMm != null) contentWidth = Math.min(contentWidth, boxW - padding * 2);
        var logicalLines = [];
        if (Array.isArray(value)) {
            for (var i = 0; i < value.length; i++) {
                var bulletText = value[i] != null && value[i] !== "" ? String(value[i]) : "";
                logicalLines.push("• " + bulletText);
            }
        } else {
            text = value !== "" ? String(value) : specStr;
            logicalLines = [text];
        }
        var physicalLines = [];
        var fontCss;
        var lineHeight;
        if (spec.shrinkToFit && logicalLines.length === 1) {
            var singleLine = logicalLines[0];
            var startSizePx = this.getFontSize(spec.sizeKey);
            var minSizePx = 8;
            var sizePx = startSizePx;
            for (; sizePx >= minSizePx; sizePx--) {
                fontCss = this.getThemeFontWithSize(spec.styleKey, spec.italic, sizePx);
                var m = this.measureTextSvg(singleLine, fontCss);
                if (m.width <= contentWidth) break;
            }
            if (sizePx < minSizePx) sizePx = minSizePx;
            lineHeight = sizePx * 1.2;
            physicalLines = [singleLine];
        } else {
            fontCss = this.getThemeFont(spec.styleKey, spec.italic, spec.sizeKey);
            lineHeight = this.getFontSize(spec.sizeKey) * 1.2;
            for (var j = 0; j < logicalLines.length; j++) {
                var wrapped = this.wrapText(logicalLines[j], fontCss, contentWidth);
                for (var w = 0; w < wrapped.length; w++) {
                    physicalLines.push(wrapped[w]);
                }
            }
        }
        var maxTw = 0;
        for (var p = 0; p < physicalLines.length; p++) {
            var m = this.measureTextSvg(physicalLines[p], fontCss);
            if (m.width > maxTw) maxTw = m.width;
        }
        if (spec.heightRatio == null) boxH = physicalLines.length * lineHeight + padding * 2;
        if (useFullWidth && spec.widthMm == null) {
            boxW = sectionWidth;
        } else if (spec.widthMm == null) {
            boxW = Math.min(maxTw + padding * 2, sectionWidth);
        }
        if (spec.heightRatio != null && physicalLines.length * lineHeight + padding * 2 > boxH) {
            var maxLines = Math.max(0, Math.floor((boxH - padding * 2) / lineHeight));
            physicalLines = physicalLines.slice(0, maxLines);
        }

        var boxRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        boxRect.setAttribute("x", x);
        boxRect.setAttribute("y", y);
        boxRect.setAttribute("width", boxW);
        boxRect.setAttribute("height", boxH);
        boxRect.setAttribute("fill", "none");
        var subsectionBordersEl = document.getElementById("subsectionBordersCheckbox");
        var showSubsectionBorders = !subsectionBordersEl || subsectionBordersEl.checked;
        boxRect.setAttribute("stroke", showSubsectionBorders ? "#000" : "none");
        sectionGroup.appendChild(boxRect);

        var anchor = "start";
        var textX = x + padding;
        var contentWidthPx = Math.max(0, boxW - padding * 2);
        if (spec.align === "centered") {
            anchor = "middle";
            textX = x + boxW / 2;
        } else if (spec.align === "right") {
            anchor = "end";
            textX = x + boxW - padding;
        }
        var lineYBase = y + padding + lineHeight / 2;
        var fillColor = (spec.color != null && spec.color !== "") ? spec.color : "#000";
        var lineStyle = "font: " + fontCss + "; fill: " + fillColor + (spec.capitalize ? "; text-transform: uppercase" : "");
        for (var k = 0; k < physicalLines.length; k++) {
            var lineText = physicalLines[k];
            var isLastLine = (k === physicalLines.length - 1);
            if (spec.align === "justify" && !isLastLine) {
                var words = lineText.trim().split(/\s+/);
                if (words.length <= 1) {
                    var lineEl = document.createElementNS("http://www.w3.org/2000/svg", "text");
                    lineEl.setAttribute("x", textX);
                    lineEl.setAttribute("y", lineYBase + k * lineHeight);
                    lineEl.setAttribute("text-anchor", anchor);
                    lineEl.setAttribute("dominant-baseline", "middle");
                    lineEl.setAttribute("style", lineStyle);
                    lineEl.textContent = lineText;
                    sectionGroup.appendChild(lineEl);
                } else {
                    var wordWidths = [];
                    var totalWordW = 0;
                    for (var wi = 0; wi < words.length; wi++) {
                        var ww = this.measureTextSvg(words[wi], fontCss).width;
                        wordWidths.push(ww);
                        totalWordW += ww;
                    }
                    var numGaps = words.length - 1;
                    var spacePerGap = (contentWidthPx - totalWordW) / numGaps;
                    var lineEl = document.createElementNS("http://www.w3.org/2000/svg", "text");
                    lineEl.setAttribute("y", lineYBase + k * lineHeight);
                    lineEl.setAttribute("dominant-baseline", "middle");
                    lineEl.setAttribute("style", lineStyle);
                    var leftX = x + padding;
                    var runX = leftX;
                    for (var wi = 0; wi < words.length; wi++) {
                        var tspan = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
                        tspan.setAttribute("x", runX);
                        tspan.textContent = words[wi];
                        lineEl.appendChild(tspan);
                        runX += wordWidths[wi] + spacePerGap;
                    }
                    sectionGroup.appendChild(lineEl);
                }
            } else {
                var lineEl = document.createElementNS("http://www.w3.org/2000/svg", "text");
                lineEl.setAttribute("x", textX);
                lineEl.setAttribute("y", lineYBase + k * lineHeight);
                lineEl.setAttribute("text-anchor", anchor);
                lineEl.setAttribute("dominant-baseline", "middle");
                lineEl.setAttribute("style", lineStyle);
                lineEl.textContent = lineText;
                sectionGroup.appendChild(lineEl);
            }
        }
        if (spec.doubleUnderline) {
            var underScale = this.dpi / 25.4;
            var underThinPx = (this.thinLineThicknessMm != null ? this.thinLineThicknessMm : 0.5) * underScale;
            var underGapPx = 1 * underScale;
            var underY0 = y + padding + physicalLines.length * lineHeight + 2;
            var underY1 = underY0 + underThinPx + underGapPx;
            var ul0 = document.createElementNS("http://www.w3.org/2000/svg", "line");
            ul0.setAttribute("x1", x);
            ul0.setAttribute("y1", underY0);
            ul0.setAttribute("x2", x + boxW);
            ul0.setAttribute("y2", underY0);
            var underColor = (spec.color != null && spec.color !== "") ? spec.color : "#000";
            ul0.setAttribute("stroke", underColor);
            ul0.setAttribute("stroke-width", underThinPx);
            sectionGroup.appendChild(ul0);
            var ul1 = document.createElementNS("http://www.w3.org/2000/svg", "line");
            ul1.setAttribute("x1", x);
            ul1.setAttribute("y1", underY1);
            ul1.setAttribute("x2", x + boxW);
            ul1.setAttribute("y2", underY1);
            ul1.setAttribute("stroke", underColor);
            ul1.setAttribute("stroke-width", underThinPx);
            sectionGroup.appendChild(ul1);
        }
        return { w: boxW, h: boxH };
    }
}