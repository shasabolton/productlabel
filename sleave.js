class Sleave {
    constructor(data) {
      this.labelData = data;
      this.labelData.logo = "photos/logo/Cart.jpg";
      this.labelData.logoText = "www.ContraptionCart.com";
      this.labelData.designedBy = "Designed By Shasa Bolton";
      this.boxSize = { width: 310, height: 222, depth: 18 };
      this.sleaveWidth = 95; // mm
      this.sectionMarginMm = 2;
      this.lineThicknessMm = 1;
      this.thinLineThicknessMm = 0.5;
      // Section layout: center (xc,yc) and rotation (0 or 180 deg) per section.
      // Populated by layout(); keys vary by mode (single vs two-column (double) when stack too tall).
      this.sectionLayout = {
        back: { xc: 0, yc: 0, w:0, h:0,  rot: 180, 
            subsections: [
                ["decorativeFiller-centered"],
                ["title-medium-headings-centered"],
                ["specs-small-body-left"],
                ["----------------"],
                ["longDescription-small-body-justify"],
                ["----------------"],
                ["bullets-small-body-left"],
                ["smallImages[1]-fit", "smallImages[2]-fit"],
                ["qrLabel-small-body-left-shrinkToFit"],
                ["qrCode-matchRowHeight","barCode-37.29mmWide"],
                ["decorativeFiller"]  
            ]
        },
        top: { xc: 0, yc: 0, w:0, h:0, rot: 0, 
            subsections:[
                ["title-medium-headings-centered"]
            ]
        },
        front: { xc: 0, yc: 0, w:0, h:0, rot: 0, 
            subsections:[
                ["decorativeFiller"],
                ["eyebrow-medium-body-centered"],
                ["----------------"],
                ["title-large-headings-centered"],
                ["subtitle-small-body-italic-centered"],
                ["tagline-small-body-centered"],
                ["heroImage-fit"],
                ["----------------"],
                ["smallImage-fit"],
                ["features-small-body-centered"],
                ["decorativeFiller"],
            ]
        },
        bottom: { xc: 0, yc: 0, w:0, h:0, rot: 0, 
            subsections:[
                ["logo-0.8ParentHeight",["logoText-medium-headings-centered-shrinkToFit","designedBy-small-body-centered"]] 
            ]         
        },
        overlap: { xc: 0, yc: 0, w:0, h:0, rot: 0},
        overlapTop: { xc: 0, yc: 0, w:0, h:0, rot: 0},
        overlapBottom: { xc: 0, yc: 0, w:0, h:0, rot: 0}
      };
 
       this.fontSizes = {
        large: 120,
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
        var shrinkToFit = false;
        if (parts.length > 1) {
            var rest = parts.slice(1);
            if (rest[rest.length - 1] === "italic") {
                italic = true;
                rest = rest.slice(0, -1);
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
            if (rest.length >= 1 && /^(centered|left|right)$/.test(rest[rest.length - 1])) {
                align = rest[rest.length - 1];
                rest = rest.slice(0, -1);
            }
            for (var ri = rest.length - 1; ri >= 0; ri--) {
                var token = rest[ri];
                var hrMatch = token && token.match(/^(\d+(?:\.\d+)?)ParentHeight$/);
                var wMatch = token && token.match(/^(\d+(?:\.\d+)?)mmWide$/);
                if (hrMatch) {
                    heightRatio = parseFloat(hrMatch[1], 10);
                    rest = rest.slice(0, ri).concat(rest.slice(ri + 1));
                } else if (wMatch) {
                    widthMm = parseFloat(wMatch[1], 10);
                    rest = rest.slice(0, ri).concat(rest.slice(ri + 1));
                }
            }
            if (rest.length >= 1 && /^(large|medium|small|xsmall)$/.test(rest[0])) {
                sizeKey = rest[0];
            }
            if (rest.length >= 2 && /^(headings|body)$/.test(rest[1])) {
                styleKey = rest[1];
            }
        }
        return { prop: prop, index: index, sizeKey: sizeKey, styleKey: styleKey, italic: italic, isImage: isImage, align: align, heightRatio: heightRatio, widthMm: widthMm, shrinkToFit: shrinkToFit, matchRowHeight: matchRowHeight, fit: fit };
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
        var th = (typeof selectedTheme !== "undefined" && selectedTheme) ? selectedTheme : { headings: "Harrington", headingsWeight: "400", body: "Arial" };
        var size = this.getFontSize(sizeKey);
        if (styleKey === "headings") {
            var w = th.headingsWeight || "400";
            return (italic ? "italic " : "") + w + " " + size + "px " + (th.headings || "sans-serif");
        }
        return (italic ? "italic " : "") + size + "px " + (th.body || "sans-serif");
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
     * Collect image URLs that have widthMm but no heightRatio (e.g. barcode) so we can load and cache their dimensions.
     */
    collectFixedWidthImageUrls() {
        var urls = [];
        var self = this;
        function add(specStr) {
            var spec = self.parseSpec(specStr);
            if (spec.isImage && spec.widthMm != null && spec.heightRatio == null && !spec.matchRowHeight) {
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
     * Get natural width and height (px) for a fit image spec. Uses _imageDimensions or 100x100.
     */
    getNaturalSizeForFitSpec(spec) {
        if (!spec || !spec.isImage || !spec.fit) return { w: 100, h: 100 };
        var value = this.getSpecValue(spec);
        var url = value && typeof value === "string" ? value : "";
        var dim = this._imageDimensions && url ? this._imageDimensions[url] : null;
        if (dim && dim.w > 0 && dim.h > 0) return { w: dim.w, h: dim.h };
        return { w: 100, h: 100 };
    }

    /**
     * Preload dimensions for images that use widthMm without heightRatio (e.g. barcode) and fit images. Fills this._imageDimensions[url].
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
        return Promise.all(unique.map(function(url) {
            return self.loadImageDimensions(url).then(function(dim) {
                if (dim) self._imageDimensions[url] = dim;
            });
        }));
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
    }

    /**
     * Draw one section as SVG: outline and subsections. Uses sectionLayout center, size (w,h) and rotation.
     * @param {string} key - Section key in sectionLayout (back, top, front, bottom, overlap)
     * @param {string} title - Label text to draw in the section
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

        var titleText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        titleText.setAttribute("x", 0);
        titleText.setAttribute("y", 0);
        titleText.setAttribute("text-anchor", "middle");
        titleText.setAttribute("dominant-baseline", "middle");
        titleText.setAttribute("style", "font: 14px sans-serif; fill: #000");
        titleText.textContent = title;
        g.appendChild(titleText);

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
                var result = this.layoutItems(measureGroup, contentLeft, totalContentHeight, row, contentWidth, contentHeight, subsectionPadding, true, -w / 2, w, 0);
                if (result && (result.w > 0 || result.h > 0)) {
                    totalContentHeight += result.h + subsectionPadding;
                }
            }
            if (totalContentHeight > 0) totalContentHeight -= subsectionPadding;
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
                var result = this.layoutItems(g, contentLeft, runningY, row, contentWidth, contentHeight, subsectionPadding, true, -w / 2, w, reductionPerRow);
                if (result && (result.w > 0 || result.h > 0)) {
                    runningY += result.h + subsectionPadding;
                }
            }
        }

        this.svg.appendChild(g);
    }

    /**
     * Get the fixed width (px) for an item when in a horizontal row, or null if the item is flexible.
     * parentIsHorizontal true = item is a vertical stack: it counts as ONE cell; width is max of its rows' widths.
     * sectionHeight (optional) is used so height-dimensioned cells (e.g. 0.8ParentHeight) get implicit width = height for allocation.
     */
    getFixedWidth(item, parentIsHorizontal, sectionHeight) {
        var scale = this.dpi / 25.4;
        if (typeof item === "string") {
            var spec = this.parseSpec(item);
            if (spec.widthMm != null) return spec.widthMm * scale;
            if (spec.heightRatio != null && sectionHeight != null) return sectionHeight * spec.heightRatio;
            return null;
        }
        if (Array.isArray(item)) {
            if (parentIsHorizontal) {
                var maxW = 0;
                var anyNull = false;
                for (var i = 0; i < item.length; i++) {
                    var c = this.getFixedWidth(item[i], false, sectionHeight);
                    if (c == null) anyNull = true;
                    else if (c > maxW) maxW = c;
                }
                return anyNull ? null : maxW;
            } else {
                var sum = 0;
                for (var j = 0; j < item.length; j++) {
                    var w = this.getFixedWidth(item[j], true, sectionHeight);
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
    layoutItems(sectionGroup, x, y, items, sectionWidth, sectionHeight, padding, isHorizontal, fullSectionLeft, fullSectionWidth, reductionPerRow) {
        padding = padding != null ? padding : 4;
        reductionPerRow = reductionPerRow != null ? reductionPerRow : 0;
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
                var fw = this.getFixedWidth(items[i], true, sectionHeight);
                fixedWidths.push(fw);
                if (fw != null) sumFixed += fw;
                else flexCount++;
            }
            var gaps = Math.max(0, items.length - 1) * padding;
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
                    size = this.drawSubsection(rowG, 0, 0, item, cellWidth, cellHeight, padding, useFullWidth, fullSectionLeft, fullSectionWidth, curX, reductionPerRow);
                } else if (Array.isArray(item)) {
                    size = this.layoutItems(rowG, 0, 0, item, cellWidth, cellHeight, padding, !isHorizontal, fullSectionLeft, fullSectionWidth, reductionPerRow);
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
                curX += size.w + padding;
                if (size.h > maxH) maxH = size.h;
            } else {
                if (typeof item === "string") {
                    var useFullWidth = !isHorizontal || items.length === 1;
                    size = this.drawSubsection(sectionGroup, curX, curY, item, cellWidth, cellHeight, padding, useFullWidth, fullSectionLeft, fullSectionWidth, 0, reductionPerRow);
                } else if (Array.isArray(item)) {
                    size = this.layoutItems(sectionGroup, curX, curY, item, cellWidth, cellHeight, padding, !isHorizontal, fullSectionLeft, fullSectionWidth, reductionPerRow);
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
            rowBox.setAttribute("fill", "#fff");
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
                        newSize = this.drawSubsection(rowG, 0, 0, it, cw, maxH, padding, items.length === 1, fullSectionLeft, fullSectionWidth, offsetX, reductionPerRow);
                    } else {
                        newSize = this.layoutItems(rowG, 0, 0, it, cw, maxH, padding, false, fullSectionLeft, fullSectionWidth, reductionPerRow);
                    }
                    if (newSize) rowSizes[ri] = newSize;
                }
                offsetX += rowSizes[ri].w + padding;
            }
            var totalContentW = 0;
            for (var ti = 0; ti < rowGroups.length; ti++) {
                totalContentW += rowSizes[ti].w;
                if (ti > 0) totalContentW += padding;
            }
            var startX = x + Math.max(0, (sectionWidth - totalContentW) / 2);
            offsetX = startX;
            for (var ri = 0; ri < rowGroups.length; ri++) {
                rowGroups[ri].setAttribute("transform", "translate(" + offsetX + "," + (y + (maxH - rowSizes[ri].h) / 2) + ")");
                offsetX += rowSizes[ri].w + padding;
            }
        }
        var n = items.length;
        var totalW = isHorizontal ? (curX - x) - (n >= 1 ? padding : 0) : maxW;
        var totalH = isHorizontal ? maxH : (curY - y) - (n >= 1 ? padding : 0);
        return { w: Math.max(0, totalW), h: Math.max(0, totalH) };
    }

    /**
     * Draw one subsection as SVG at (x,y) inside sectionGroup. Returns { w, h } of the box drawn.
     */
    drawSubsection(sectionGroup, x, y, specStr, sectionWidth, sectionHeight, padding, useFullWidth, fullSectionLeft, fullSectionWidth, sectionOriginX, reductionPerRow) {
        padding = padding != null ? padding : 4;
        useFullWidth = !!useFullWidth;
        reductionPerRow = reductionPerRow != null ? reductionPerRow : 0;
        if (typeof specStr === "string" && /^-{3,}$/.test(specStr)) {
            var scale = this.dpi / 25.4;
            var lineThicknessPx = (this.lineThicknessMm != null ? this.lineThicknessMm : 0.5) * scale;
            var lineY = y + lineThicknessPx / 2;
            var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", x);
            line.setAttribute("y1", lineY);
            line.setAttribute("x2", x + sectionWidth);
            line.setAttribute("y2", lineY);
            line.setAttribute("stroke", "#000");
            line.setAttribute("stroke-width", lineThicknessPx);
            sectionGroup.appendChild(line);
            return { w: sectionWidth, h: lineThicknessPx };
        }
        var spec = this.parseSpec(specStr);
        if (spec.prop === "decorativeFiller") {
            var scale = this.dpi / 25.4;
            var thinPx = (this.thinLineThicknessMm != null ? this.thinLineThicknessMm : 2) * scale;
            var spaceMm = 3;
            var spacePx = spaceMm * scale;
            var drawW = (this.sleaveWidth != null ? this.sleaveWidth : 95) * scale;
            var drawX = -drawW / 2 - (sectionOriginX != null ? sectionOriginX : 0);
            for (var di = 0; di < 2; di++) {
                var lineY = y + spacePx + thinPx / 2 + di * (thinPx + spacePx);
                var decoLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
                decoLine.setAttribute("x1", drawX);
                decoLine.setAttribute("y1", lineY);
                decoLine.setAttribute("x2", drawX + drawW);
                decoLine.setAttribute("y2", lineY);
                decoLine.setAttribute("stroke", "#000");
                decoLine.setAttribute("stroke-width", thinPx);
                sectionGroup.appendChild(decoLine);
            }
            var decoH = spacePx + thinPx + spacePx + thinPx + spacePx;
            return { w: sectionWidth, h: decoH };
        }
        var value = this.getSpecValue(spec);
        var boxW = 100;
        var boxH = 100;
        var text = "";
        var isImage = spec.isImage || (typeof value === "string" && /\.(jpg|jpeg|png|gif|webp|avif)|^(https?:\/\/|photos\/)/i.test(value));

        if (isImage) {
            var scale = this.dpi / 25.4;
            if (spec.fit) {
                var nat = this.getNaturalSizeForFitSpec(spec);
                boxW = sectionWidth;
                boxH = nat.w > 0 ? sectionWidth * (nat.h / nat.w) : sectionWidth;
                if (reductionPerRow > 0 && boxH > 0) {
                    boxH = Math.max(0, boxH - reductionPerRow);
                    boxW = nat.w > 0 ? boxH * (nat.w / nat.h) : boxH;
                }
            } else if (spec.widthMm != null) boxW = spec.widthMm * scale;
            else if (spec.heightRatio != null) boxH = sectionHeight * spec.heightRatio;
            if (!spec.fit) {
                if (spec.matchRowHeight && sectionHeight > 0) {
                    boxH = sectionHeight;
                    if (spec.widthMm == null) boxW = boxH;
                } else if (spec.widthMm == null && spec.heightRatio == null) {
                    boxW = 100;
                    boxH = 100;
                } else if (spec.widthMm == null) boxW = boxH;
                else if (spec.heightRatio == null) {
                    var imgUrl = value && typeof value === "string" ? value : "";
                    var dim = this._imageDimensions && imgUrl ? this._imageDimensions[imgUrl] : null;
                    if (dim && dim.w > 0) boxH = boxW * (dim.h / dim.w);
                    else boxH = boxW;
                }
            }
            var imgEl = document.createElementNS("http://www.w3.org/2000/svg", "image");
            imgEl.setAttribute("x", x);
            imgEl.setAttribute("y", y);
            imgEl.setAttribute("width", boxW);
            imgEl.setAttribute("height", boxH);
            imgEl.setAttribute("preserveAspectRatio", "xMidYMid meet");
            var imgUrl = value && typeof value === "string" ? value : "";
            imgEl.setAttributeNS("http://www.w3.org/1999/xlink", "href", imgUrl);
            imgEl.setAttribute("href", imgUrl);
            sectionGroup.appendChild(imgEl);
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
            var sizeKeyOrder = ["large", "medium", "small", "xsmall"];
            var singleLine = logicalLines[0];
            var startIdx = sizeKeyOrder.indexOf(spec.sizeKey);
            if (startIdx < 0) startIdx = 0;
            var chosenKey = sizeKeyOrder[sizeKeyOrder.length - 1];
            for (var si = startIdx; si < sizeKeyOrder.length; si++) {
                chosenKey = sizeKeyOrder[si];
                fontCss = this.getThemeFont(spec.styleKey, spec.italic, chosenKey);
                var m = this.measureTextSvg(singleLine, fontCss);
                if (m.width <= contentWidth) break;
            }
            lineHeight = this.getFontSize(chosenKey) * 1.2;
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
        boxRect.setAttribute("fill", "#fff");
        var subsectionBordersEl = document.getElementById("subsectionBordersCheckbox");
        var showSubsectionBorders = !subsectionBordersEl || subsectionBordersEl.checked;
        boxRect.setAttribute("stroke", showSubsectionBorders ? "#000" : "none");
        sectionGroup.appendChild(boxRect);

        var anchor = "start";
        var textX = x + padding;
        if (spec.align === "centered") {
            anchor = "middle";
            textX = x + boxW / 2;
        } else if (spec.align === "right") {
            anchor = "end";
            textX = x + boxW - padding;
        }
        for (var k = 0; k < physicalLines.length; k++) {
            var lineEl = document.createElementNS("http://www.w3.org/2000/svg", "text");
            lineEl.setAttribute("x", textX);
            lineEl.setAttribute("y", y + padding + lineHeight / 2 + k * lineHeight);
            lineEl.setAttribute("text-anchor", anchor);
            lineEl.setAttribute("dominant-baseline", "middle");
            lineEl.setAttribute("style", "font: " + fontCss + "; fill: #000");
            lineEl.textContent = physicalLines[k];
            sectionGroup.appendChild(lineEl);
        }
        return { w: boxW, h: boxH };
    }
}