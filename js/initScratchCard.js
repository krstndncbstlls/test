function initScratchCard() {
    (function(e) {
        function t(e, t) {
            this.sp = null;
            this.settings = e;
            this.$elem = t;
            this.enabled = true;
            this.scratch = false;
            this.canvas = null;
            this.ctx = null;
            return this;
        }

        e.fn.wScratchPad = function(n, r) {
            if (typeof n === "object") {
                r = n;
            } else if (typeof n == "string") {
                var i = [];
                var s = this.each(function() {
                    var t = e(this).data("_wScratchPad");
                    if (t) {
                        if (n === "reset") {
                            t.reset();
                        } else if (n === "clear") {
                            t.clear();
                        } else if (n === "enabled") {
                            t.enabled = r === true;
                        } else if (e.fn.wScratchPad.defaultSettings[n] !== undefined) {
                            if (r !== undefined) {
                                t.settings[n] = r;
                            } else {
                                i.push(t.settings[n]);
                            }
                        }
                    }
                });
                if (i.length === 1) {
                    return i[0];
                }
                if (i.length > 0) {
                    return i;
                } else {
                    return s;
                }
            }
            r = e.extend({}, e.fn.wScratchPad.defaultSettings, r || {});
            return this.each(function() {
                var n = e(this);
                var i = jQuery.extend(true, {}, r);
                var s = document.createElement("canvas");
                if (!s.getContext) {
                    n.html("Browser does not support HTML5 canvas, please upgrade to a more modern browser.");
                    return false;
                }
                var o = new t(i, n);
                n.append(o.generate());
                o.pixels = o.canvas.width * o.canvas.height;
                n.data("_wScratchPad", o);
                o.init();
            });
        };
        e.fn.wScratchPad.defaultSettings = {
            width: 210,
            height: 100,
            image: "../images/transparentBG.png",
            image2: null,
            color: "#336699",
            overlay: "none",
            size: 10,
            realtimePercent: false,
            scratchDown: null,
            scratchUp: null,
            scratchMove: null,
            cursor: null
        };
        t.prototype = {
            generate: function() {
                var t = this;
                this.canvas = document.createElement("canvas");
                this.canvas.id = 'canvasScratch';
                this.ctx = this.canvas.getContext("2d");
                this.sp = e("<div></div>").css({
                    position: "relative"
                }).append(e(this.canvas).attr("width", this.settings.width + "px").attr("height", this.settings.height + "px"));
                e(this.canvas).on('mousedown', function(n) {
                    if (!t.enabled) return true;
                    n.preventDefault();
                    n.stopPropagation();
                    t.canvas_offset = e(t.canvas).offset();
                    t.scratch = true;
                    t.scratchFunc(n, t, "Down");
                }).on('mousemove', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    if( isMobile != '1' ) {
                        if (t.scratch && e.buttons === 1) t.scratchFunc(e, t, "Move");
                    } else {
                        if (t.scratch) t.scratchFunc(e, t, "Move");
                    }
                }).on('mouseup', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (t.scratch) {
                        t.scratch = false;
                        t.scratchFunc(e, t, "Up");
                    }
                });
                this.bindMobile();
                return this.sp;
            },
            bindMobile: function() {
                var self = this;
                window.addEventListener('touchstart', function(e) {
                    self.touchHandler(e, "mousedown");
                }, { passive: true });
                window.addEventListener('touchmove', function(e) {
                    self.touchHandler(e, "mousemove");
                }, { passive: true });
                window.addEventListener('touchend', function(e) {
                    self.touchHandler(e, "mouseup");
                }, { passive: true });
            },
            touchHandler: function(event, eventType) {
                var touches = event.changedTouches,
                    first = touches[0],
                    type = "";
                switch (event.type) {
                    case "touchstart":
                        type = "mousedown";
                        break;
                    case "touchmove":
                        type = "mousemove";
                        break;
                    case "touchend":
                        type = "mouseup";
                        break;
                    default:
                        return;
                }
                var simulatedEvent = document.createEvent("MouseEvent");
                simulatedEvent.initMouseEvent(type, true, true, window, 1,
                    first.screenX, first.screenY,
                    first.clientX, first.clientY,
                    false, false, false, false, 0 /*left*/ , null);
            
                first.target.dispatchEvent(simulatedEvent);
            },
            init: function() {
                this.sp.css("width", this.settings.width);
                this.sp.css("height", this.settings.height);
                this.sp.css("cursor", this.settings.cursor ? 'url("' + this.settings.cursor + '"), default' : "default");
                e(this.canvas).css({
                    cursor: this.settings.cursor ? 'url("' + this.settings.cursor + '"), default' : "default"
                });
                this.canvas.width = this.settings.width;
                this.canvas.height = this.settings.height;
                this.pixels = this.canvas.width * this.canvas.height;
                if (this.settings.image2) {
                    this.drawImage(this.settings.image2);
                } else {
                    if (this.settings.overlay != "none") {
                        if (this.settings.image) {
                            this.drawImage(this.settings.image);
                        }
                        this.ctx.globalCompositeOperation = this.settings.overlay;
                    } else {
                        this.setBgImage();
                    }
                    this.ctx.fillStyle = this.settings.color;
                    this.ctx.beginPath();
                    this.ctx.rect(0, 0, this.settings.width, this.settings.height);
                    this.ctx.fill();
                }
            },
            reset: function() {
                this.ctx.globalCompositeOperation = "source-over";
                this.init();
            },
            clear: function() {
                this.ctx.clearRect(0, 0, this.settings.width, this.settings.height);
            },
            setBgImage: function() {
                if (this.settings.image) {
                    this.sp.css({
                        backgroundImage: "url(" + this.settings.image + ")"
                    });
                }
            },
            drawImage: function(t) {
                var n = this;
                var r = new Image();
                r.src = t;
                e(r).on('load', function() {
                    n.ctx.drawImage(r, 0, 0);
                    n.setBgImage();
                });
            },
            scratchFunc: function(e, t, n) {
                e.pageX = Math.floor(e.pageX - t.canvas_offset.left);
                e.pageY = Math.floor(e.pageY - t.canvas_offset.top);
                t["scratch" + n](e, t);
                if (this.settings.realtimePercent || n == "Up") {
                    if
                    (t.settings["scratch" + n]) t.settings["scratch" + n].apply(t, [e, t.scratchPercentage(t)]);
                }
            },
            scratchPercentage: function(e) {
                var t = 0;
                e.ctx.canvas.getContext('2d', { willReadFrequently: true });
                var n = e.ctx.getImageData(0, 0, e.canvas.width, e.canvas.height);
                for (var r = 0, i = n.data.length; r < i; r = r + 4) {
                    if (n.data[r] == 0 && n.data[r + 1] == 0 && n.data[r + 2] == 0 && n.data[r + 3] == 0) t++;
                }
                return t / e.pixels * 100;
            },
            scratchDown: function(e, t) {
                t.ctx.globalCompositeOperation = "destination-out";
                t.ctx.lineJoin = "round";
                t.ctx.lineCap = "round";
                t.ctx.strokeStyle = t.settings.color;
                t.ctx.lineWidth = t.settings.size;
                t.ctx.beginPath();
                t.ctx.arc(e.pageX, e.pageY, t.settings.size / 2, 0, Math.PI * 2, true);
                t.ctx.closePath();
                t.ctx.fill();
                t.ctx.beginPath();
                t.ctx.moveTo(e.pageX, e.pageY);
            },
            scratchMove: function(e, t) {
                t.ctx.lineTo(e.pageX, e.pageY);
                t.ctx.stroke();
            },
            scratchUp: function(e, t) {
                t.ctx.closePath();
            }
        };
    })(jQuery);
};
