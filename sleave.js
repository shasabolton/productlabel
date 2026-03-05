class Sleave {
    constructor(data) {
      this.labelData = data;
      this.labelData.logo = "photos/logo/Cart.jpg";
      this.labelData.logoText = "www.ContraptionCart.com";
      this.labelData.designedBy = "Designed By Shasa Bolton";
      this.boxSize = { width: 310, height: 222, depth: 18 };
      this.sleaveWidth = 95; // mm
      this.sectionPaddingMm = 5;
      // Section layout: center (xc,yc) and rotation (0 or 180 deg) per section.
      // Populated by layout(); keys vary by mode (single vs two-column (double) when stack too tall).
      this.sectionLayout = {
        back: { xc: 0, yc: 0, w:0, h:0,  rot: 180, 
            subsections: [
                ["decorativeFiller-centered"],
                ["title-large-headings-centered-shrinkFit"],
                ["specs-small-body-left"],
                ["----------------"],
                ["longDescription-small-body-justify"],
                ["----------------"],
                ["bullets-small-body-left"],
                ["smallImages[2]-halfWidth", "smallImages[3]-halfWidth"],
                ["qrLabel-fitWidth","barCode-37.29mm"],
                ["decorativeFiller"]  
            ]
        },
        top: { xc: 0, yc: 0, w:0, h:0, rot: 0, 
            subsections:[
                ["title-large-headings-centered"]
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
                ["heroImage-fitWidth"],
                ["----------------"],
                ["smallImage-fitWidth"],
                ["features-small-body-centered"],
                ["decorativeFiller"],
            ]
        },
        bottom: { xc: 0, yc: 0, w:0, h:0, rot: 0, 
            subsections:[
                ["logo",["logoText-small-body-centered","designedBy-small-body-centered"]] 
            ]         
        },
        overlap: { xc: 0, yc: 0, w:0, h:0, rot: 0},
        overlapTop: { xc: 0, yc: 0, w:0, h:0, rot: 0},
        overlapBottom: { xc: 0, yc: 0, w:0, h:0, rot: 0}
      };
 
       this.fontSizes = {
        large: 120,
        medium: 90,
        small: 70,
        xsmall: 60,
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
        var isImage = /Image|smallImages|barCode|qrLabel/i.test(prop);
        var sizeKey = "small";
        var styleKey = "body";
        var italic = false;
        var align = "left";
        if (parts.length > 1) {
            var rest = parts.slice(1);
            if (rest[rest.length - 1] === "italic") {
                italic = true;
                rest = rest.slice(0, -1);
            }
            if (rest.length >= 1 && /^(centered|left|right)$/.test(rest[rest.length - 1])) {
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
        return { prop: prop, index: index, sizeKey: sizeKey, styleKey: styleKey, italic: italic, isImage: isImage, align: align };
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
        this.layout(pageHeightPx);
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
            var scale = this.dpi / 25.4;
            var sectionPaddingPx = this.sectionPaddingMm * scale;
            var contentLeft = -w / 2 + sectionPaddingPx;
            var contentTop = -h / 2 + sectionPaddingPx;
            var contentWidth = w - 2 * sectionPaddingPx;
            var contentHeight = h - 2 * sectionPaddingPx;
            var subsectionPadding = 0;
            var runningY = contentTop;
            for (var r = 0; r < sl.subsections.length; r++) {
                var row = sl.subsections[r];
                if (!Array.isArray(row)) row = [row];
                var result = this.layoutItems(g, contentLeft, runningY, row, contentWidth, contentHeight, subsectionPadding, true);
                if (result && (result.w > 0 || result.h > 0)) {
                    runningY += result.h + subsectionPadding;
                }
            }
        }

        this.svg.appendChild(g);
    }

    /**
     * Layout items (spec strings or nested arrays) in one direction; nested arrays use the opposite direction.
     * Alternates horizontal / vertical / horizontal ... for any depth. Returns { w, h } of the block.
     */
    layoutItems(sectionGroup, x, y, items, sectionWidth, sectionHeight, padding, isHorizontal) {
        padding = padding != null ? padding : 4;
        var curX = x;
        var curY = y;
        var maxW = 0;
        var maxH = 0;
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var size;
            if (typeof item === "string") {
                size = this.drawSubsection(sectionGroup, curX, curY, item, sectionWidth, sectionHeight, padding);
            } else if (Array.isArray(item)) {
                size = this.layoutItems(sectionGroup, curX, curY, item, sectionWidth, sectionHeight, padding, !isHorizontal);
            } else {
                continue;
            }
            if (!size || (size.w === 0 && size.h === 0)) continue;
            if (isHorizontal) {
                curX += size.w + padding;
                if (size.h > maxH) maxH = size.h;
            } else {
                curY += size.h + padding;
                if (size.w > maxW) maxW = size.w;
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
    drawSubsection(sectionGroup, x, y, specStr, sectionWidth, sectionHeight, padding) {
        padding = padding != null ? padding : 4;
        var spec = this.parseSpec(specStr);
        var value = this.getSpecValue(spec);
        var boxW = 100;
        var boxH = 100;
        var text = "";
        var isImage = spec.isImage || (typeof value === "string" && /\.(jpg|jpeg|png|gif|webp|avif)|^(https?:\/\/|photos\/)/i.test(value));

        if (isImage) {
            boxW = 100;
            boxH = 100;
            var imgRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            imgRect.setAttribute("x", x);
            imgRect.setAttribute("y", y);
            imgRect.setAttribute("width", boxW);
            imgRect.setAttribute("height", boxH);
            imgRect.setAttribute("fill", "#eee");
            imgRect.setAttribute("stroke", "#000");
            sectionGroup.appendChild(imgRect);
            var imgLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
            imgLabel.setAttribute("x", x + boxW / 2);
            imgLabel.setAttribute("y", y + boxH / 2);
            imgLabel.setAttribute("text-anchor", "middle");
            imgLabel.setAttribute("dominant-baseline", "middle");
            imgLabel.setAttribute("style", "font: 10px sans-serif; fill: #333");
            imgLabel.textContent = "Image";
            sectionGroup.appendChild(imgLabel);
            return { w: boxW, h: boxH };
        }

        var fontCss = this.getThemeFont(spec.styleKey, spec.italic, spec.sizeKey);
        var lineHeight = this.getFontSize(spec.sizeKey) * 1.2;
        var lines = [];
        if (Array.isArray(value)) {
            for (var i = 0; i < value.length; i++) {
                var bulletText = value[i] != null && value[i] !== "" ? String(value[i]) : "";
                lines.push("• " + bulletText);
            }
        } else {
            text = value !== "" ? String(value) : specStr;
            lines = [text];
        }
        var maxTw = 0;
        for (var j = 0; j < lines.length; j++) {
            var m = this.measureTextSvg(lines[j], fontCss);
            if (m.width > maxTw) maxTw = m.width;
        }
        boxW = Math.min(maxTw + padding * 2, sectionWidth - padding);
        boxH = lines.length * lineHeight + padding * 2;

        var boxRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        boxRect.setAttribute("x", x);
        boxRect.setAttribute("y", y);
        boxRect.setAttribute("width", boxW);
        boxRect.setAttribute("height", boxH);
        boxRect.setAttribute("fill", "#fff");
        boxRect.setAttribute("stroke", "#000");
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
        for (var k = 0; k < lines.length; k++) {
            var lineEl = document.createElementNS("http://www.w3.org/2000/svg", "text");
            lineEl.setAttribute("x", textX);
            lineEl.setAttribute("y", y + padding + lineHeight / 2 + k * lineHeight);
            lineEl.setAttribute("text-anchor", anchor);
            lineEl.setAttribute("dominant-baseline", "middle");
            lineEl.setAttribute("style", "font: " + fontCss + "; fill: #000");
            lineEl.textContent = lines[k];
            sectionGroup.appendChild(lineEl);
        }
        return { w: boxW, h: boxH };
    }
}