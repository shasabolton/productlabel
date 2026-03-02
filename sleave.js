class Sleave {
    constructor(data) {
      this.labelData = data;
      this.boxSize = { width: 310, height: 222, depth: 18 };
      this.sleaveWidth = 105; // mm
      // Section layout: center (xc,yc) and rotation (0 or 180 deg) per section.
      // Populated by layout(); keys vary by mode (single vs two-column when stack too tall).
      this.sectionLayout = {
        back: { xc: 0, yc: 0, rot: 180 },
        top: { xc: 0, yc: 0, rot: 0 },
        front: { xc: 0, yc: 0, rot: 0 },
        bottom: { xc: 0, yc: 0, rot: 0 },
        overlap: { xc: 0, yc: 0, rot: 0 },
        overlapTop: { xc: 0, yc: 0, rot: 0 },
        overlapBottom: { xc: 0, yc: 0, rot: 0 }
      };
    }

    render() {
        var pageKey = document.getElementById("pageSizeSelect").value;
        var canvas = document.createElement("canvas");
        canvas.id = "canvas";
        this.ctx = canvas.getContext("2d");
        this.dpi = 300;
        var page = pages[pageKey];
        var pageWidthPx = page.width / 25.4 * this.dpi;
        var pageHeightPx = page.height / 25.4 * this.dpi;
        canvas.width = pageWidthPx;
        canvas.height = pageHeightPx;
        this.marginPx = page.margin / 25.4 * this.dpi;
        var container = document.querySelector('.canvas-container');
        if (container) container.appendChild(canvas);
        else document.body.append(canvas);
        this.layout(pageHeightPx);
    }

    layout(pageHeightPx) {
        var scale = this.dpi / 25.4;
        var w = this.sleaveWidth * scale;
        var frontBackH = this.boxSize.height * scale;
        var spineH = this.boxSize.depth * scale;
        var overlapH = 10 * scale; // 10mm overlap section

        var pageH = pageHeightPx;
        var stackH = overlapH + spineH + frontBackH + spineH + overlapH; // overlap, top, front, bottom, overlap
        var tooTall = stackH > pageH;

        if (tooTall) {
            alert("Sleave layout exceeds page height. Content may run off canvas.");
            // Two-column: left = overlap, top, front, bottom, overlap; right = back next to front
            this.layoutTall(w, frontBackH, spineH, overlapH, pageH);
        } else {
            // Single column: back, top, front, bottom, overlap
            this.layoutSingle(w, frontBackH, spineH, overlapH);
        }
    }

    layoutSingle(w, frontBackH, spineH, overlapH) {
        var y = 0;
        this.sectionLayout.back.xc = w / 2;
        this.sectionLayout.back.yc = y + frontBackH / 2;
        this.sectionLayout.back.rot = 180;
        y += frontBackH;

        this.sectionLayout.top.xc = w / 2;
        this.sectionLayout.top.yc = y + spineH / 2;
        this.sectionLayout.top.rot = 0;
        y += spineH;

        this.sectionLayout.front.xc = w / 2;
        this.sectionLayout.front.yc = y + frontBackH / 2;
        this.sectionLayout.front.rot = 0;
        y += frontBackH;

        this.sectionLayout.bottom.xc = w / 2;
        this.sectionLayout.bottom.yc = y + spineH / 2;
        this.sectionLayout.bottom.rot = 0;
        y += spineH;

        this.sectionLayout.overlap.xc = w / 2;
        this.sectionLayout.overlap.yc = y + overlapH / 2;
        this.sectionLayout.overlap.rot = 0;

        this.drawSection("back", w, frontBackH, "Back");
        this.drawSection("top", w, spineH, "Top");
        this.drawSection("front", w, frontBackH, "Front");
        this.drawSection("bottom", w, spineH, "Bottom");
        this.drawSection("overlap", w, overlapH, "Overlap");
    }

    layoutTall(w, frontBackH, spineH, overlapH, pageH) {
        var leftXc = w / 2;
        var rightXc = w + w / 2; // back column next to front
        var y = 0;

        this.sectionLayout.overlapTop.xc = leftXc;
        this.sectionLayout.overlapTop.yc = y + overlapH / 2;
        this.sectionLayout.overlapTop.rot = 0;
        y += overlapH;

        this.sectionLayout.top.xc = leftXc;
        this.sectionLayout.top.yc = y + spineH / 2;
        this.sectionLayout.top.rot = 0;
        y += spineH;

        this.sectionLayout.front.xc = leftXc;
        this.sectionLayout.front.yc = y + frontBackH / 2;
        this.sectionLayout.front.rot = 0;
        var frontYc = this.sectionLayout.front.yc;
        y += frontBackH;

        this.sectionLayout.bottom.xc = leftXc;
        this.sectionLayout.bottom.yc = y + spineH / 2;
        this.sectionLayout.bottom.rot = 0;
        y += spineH;

        this.sectionLayout.overlapBottom.xc = leftXc;
        this.sectionLayout.overlapBottom.yc = y + overlapH / 2;
        this.sectionLayout.overlapBottom.rot = 0;

        this.sectionLayout.back.xc = rightXc;
        this.sectionLayout.back.yc = frontYc;
        this.sectionLayout.back.rot = 0; // up the same way as front

        this.drawSection("overlapTop", w, overlapH, "Overlap");
        this.drawSection("top", w, spineH, "Top");
        this.drawSection("front", w, frontBackH, "Front");
        this.drawSection("bottom", w, spineH, "Bottom");
        this.drawSection("overlapBottom", w, overlapH, "Overlap");
        this.drawSection("back", w, frontBackH, "Back");
    }

    /**
     * Draw one section: rectangle and title, using sectionLayout center and rotation.
     * @param {string} key - Section key in sectionLayout (back, top, front, bottom, overlap)
     * @param {number} w - Width of section in px
     * @param {number} h - Height of section in px
     * @param {string} title - Label text to draw in the section
     */
    drawSection(key, w, h, title) {
        var sl = this.sectionLayout[key];
        if (!sl) return;
        var xc = sl.xc;
        var yc = sl.yc;
        var rotDeg = sl.rot || 0;

        this.ctx.save();
        // Move origin to section center, then rotate (0 or 180 deg)
        this.ctx.translate(xc, yc);
        this.ctx.rotate((rotDeg * Math.PI) / 180);
        // Draw rect so its center is at (0,0): top-left at (-w/2, -h/2)
        this.ctx.strokeRect(-w / 2, -h / 2, w, h);
        // Section title centered in the section
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.font = "14px sans-serif";
        this.ctx.fillStyle = "#000";
        this.ctx.fillText(title, 0, 0);
        this.ctx.restore();
    }
}