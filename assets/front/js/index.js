// ----------------------------
// NSDI Homepage — index.js (v33)
// 3D Glass Möbius Triangle — tube geometry + glass shading + mouse interaction
// + text particle dissolution on scroll
// ----------------------------

(function() {
    'use strict';

    // Accessibility: respect reduced motion preference
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ========================================
    // 1. Hero entrance
    // ========================================
    function initHeroEntrance() {
        var triggered = false;
        function startEntrance() {
            if (triggered) return;
            triggered = true;
            var loader = document.querySelector('.loader-wrap');
            if (loader) {
                // Fade out loading logo
                loader.classList.add('fade-out');
                setTimeout(function() {
                    loader.style.display = 'none';
                    // Triangle + text enter together
                    document.body.classList.add('triangle-emerging');
                    document.body.classList.add('hero-revealed');
                    document.body.classList.add('loaded');
                    document.body.classList.remove('loading-in');
                }, 400);
            } else {
                document.body.classList.add('triangle-emerging');
                document.body.classList.add('hero-revealed');
                document.body.classList.add('loaded');
                document.body.classList.remove('loading-in');
            }
        }
        window.addEventListener('load', startEntrance);
        // Safety fallback: 8s
        setTimeout(startEntrance, 8000);
    }

    // ========================================
    // 2. 3D Glass Möbius Triangle (tube geometry)
    // ========================================
    function initMobiusTriangle() {
        var canvas = document.getElementById('heroCanvas');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        var heroEl = document.querySelector('.nomo-hero');

        // Entrance: triangle emerges from darkness
        var entranceAlpha = 0;
        var entranceDone = false;
        var colorProgress = 0; // 0 = grayscale, 1 = full gold

        // Move canvas OUT of hero to avoid overflow:hidden clipping
        document.body.appendChild(canvas);

        // Second canvas for triangle ABOVE content (z-index 25)
        var triCanvas = document.createElement('canvas');
        triCanvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:25;pointer-events:none;';
        document.body.appendChild(triCanvas);
        var triCtx = triCanvas.getContext('2d');

        var W, H, vScale;
        var running = true;
        var mouse = { x: 0.5, y: 0.5 };
        var smooth = { x: 0.5, y: 0.5 };
        var renderScale = 0;

        /* ---- Mesh config ---- */
        var NP = 300;       // segments along path (smoother)
        var NW = 36;        // tube cross-section segments (rounder)
        var TR = 1.0;       // triangle radius
        var TUBE_R = 0.18;  // tube radius (thicker)
        var FOV = 3.8;
        var HALF_NW = NW / 2 | 0;
        var ROUND = 0.5;    // path roundness (0=sharp triangle, 1=circle)

        /* ---- Equilateral triangle vertices ---- */
        var TV = [
            [0, -TR, 0],
            [-TR * 0.866, TR * 0.5, 0],
            [TR * 0.866, TR * 0.5, 0]
        ];

        /* ---- Vector math ---- */
        function norm3(v) {
            var l = Math.sqrt(v[0]*v[0]+v[1]*v[1]+v[2]*v[2]) || 1;
            return [v[0]/l, v[1]/l, v[2]/l];
        }
        function cross3(a, b) {
            return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
        }
        function dot3(a, b) { return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]; }
        function rotAx(v, ax, ang) {
            var c = Math.cos(ang), s = Math.sin(ang);
            var d = dot3(ax, v), cr = cross3(ax, v);
            return [
                v[0]*c + cr[0]*s + ax[0]*d*(1-c),
                v[1]*c + cr[1]*s + ax[1]*d*(1-c),
                v[2]*c + cr[2]*s + ax[2]*d*(1-c)
            ];
        }

        /* ---- Smooth triangular path ---- */
        function pathPt(t) {
            t = ((t % 1) + 1) % 1;
            var t3 = t * 3;
            var seg = Math.floor(t3); if (seg > 2) seg = 2;
            var f = t3 - seg, ns = (seg + 1) % 3;
            var sf = f * f * (3 - 2 * f);
            var tx = TV[seg][0] + (TV[ns][0] - TV[seg][0]) * sf;
            var ty = TV[seg][1] + (TV[ns][1] - TV[seg][1]) * sf;
            // Blend with circle for smoother flowing corners
            var a = 2 * Math.PI * t;
            return [
                tx * (1 - ROUND) + (-TR * Math.sin(a)) * ROUND,
                ty * (1 - ROUND) + (-TR * Math.cos(a)) * ROUND,
                0
            ];
        }
        function pathTan(t) {
            var d = 0.5 / NP;
            var a = pathPt(t - d), b = pathPt(t + d);
            return norm3([b[0]-a[0], b[1]-a[1], b[2]-a[2]]);
        }

        /* ---- Build tube mesh with Möbius twist ---- */
        var baseV, baseN; // [NP+1][NW] of [x,y,z]

        function buildMesh() {
            baseV = []; baseN = [];

            for (var i = 0; i <= NP; i++) {
                var param = i / NP;
                var pos = pathPt(param);
                var tang = pathTan(param);
                var frN = [0, 0, 1];
                var frB = [-tang[1], tang[0], 0];

                var tw = Math.PI * param;
                var ct = Math.cos(tw), st = Math.sin(tw);
                var twN = [frN[0]*ct+frB[0]*st, frN[1]*ct+frB[1]*st, frN[2]*ct+frB[2]*st];
                var twB = [-frN[0]*st+frB[0]*ct, -frN[1]*st+frB[1]*ct, -frN[2]*st+frB[2]*ct];

                var vRow = [], nRow = [];
                for (var j = 0; j < NW; j++) {
                    var th = j / NW * Math.PI * 2;
                    var cj = Math.cos(th), sj = Math.sin(th);
                    var nx = twN[0]*cj + twB[0]*sj;
                    var ny = twN[1]*cj + twB[1]*sj;
                    var nz = twN[2]*cj + twB[2]*sj;
                    vRow.push([pos[0]+nx*TUBE_R, pos[1]+ny*TUBE_R, pos[2]+nz*TUBE_R]);
                    nRow.push(norm3([nx, ny, nz]));
                }
                baseV.push(vRow); baseN.push(nRow);
            }
        }

        /* ---- 3D rotation + projection ---- */
        function rX(v, a) {
            var c=Math.cos(a), s=Math.sin(a);
            return [v[0], v[1]*c-v[2]*s, v[1]*s+v[2]*c];
        }
        function rY(v, a) {
            var c=Math.cos(a), s=Math.sin(a);
            return [v[0]*c+v[2]*s, v[1], -v[0]*s+v[2]*c];
        }
        function proj(v) {
            var d = v[2] + FOV; if (d < 0.2) d = 0.2;
            var f = FOV / d;
            return { x: W*0.5+v[0]*renderScale*f, y: H*0.5+v[1]*renderScale*f, z: v[2] };
        }

        /* ---- Resize ---- */
        function resize() {
            var dpr = Math.min(window.devicePixelRatio || 1, 2);
            W = window.innerWidth; H = window.innerHeight;
            canvas.width = W*dpr; canvas.height = H*dpr;
            canvas.style.width = W+'px'; canvas.style.height = H+'px';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            triCanvas.width = W*dpr; triCanvas.height = H*dpr;
            triCanvas.style.width = W+'px'; triCanvas.style.height = H+'px';
            triCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
            vScale = Math.min(W, H) * 0.34;
            buildMesh();
        }

        /* ---- Render ---- */
        function tick() {
            // Entrance: triangle emerges from darkness
            if (!entranceDone) {
                if (document.body.classList.contains('triangle-emerging')) {
                    entranceAlpha = Math.min(1, entranceAlpha + 0.03); // ~0.55s @ 60fps
                }
                if (entranceAlpha >= 1) entranceDone = true;
            }
            // Color: grayscale → gold (slower, ~2s)
            if (colorProgress < 1 && document.body.classList.contains('triangle-emerging')) {
                colorProgress = Math.min(1, colorProgress + 0.015); // ~1.1s @ 60fps
            }
            // ease-out cubic: starts visible quickly, settles gently
            var t = 1 - entranceAlpha;
            var easeAlpha = entranceDone ? 1 : 1 - t * t * t;

            smooth.x += (mouse.x - smooth.x) * 0.04;
            smooth.y += (mouse.y - smooth.y) * 0.04;

            // Scroll: zoom + rotate into triangle center
            var scrollP = Math.min(window.scrollY / H, 1.5);
            var sp = Math.pow(scrollP, 1.3);
            var scrollZoom = 1 + sp * 50;
            var scrollRot = sp * Math.PI * 3.5;
            // Entrance scale: triangle grows from 0.85 → 1.0
            var entranceScale = entranceDone ? 1 : 0.85 + 0.15 * easeAlpha;
            renderScale = vScale * scrollZoom * entranceScale;

            var ry = (smooth.x - 0.5) * 0.3 + scrollRot;
            var rx = (smooth.y - 0.5) * 0.2 + 0.3 + scrollP * 0.15;

            ctx.clearRect(0, 0, W, H);
            triCtx.clearRect(0, 0, W, H);

            // Canvas covers viewport: fade from scrollP 0.22→0.35
            var canvasAlpha = scrollP > 0.22 ? Math.max(0, 1 - (scrollP - 0.22) / 0.13) : 1.0;
            // Triangle fades 0.30→0.35 — must finish by the time background canvas is gone
            var triFade = scrollP < 0.3 ? 1.0 : Math.max(0, 1 - (scrollP - 0.3) / 0.05);
            // Hard cutoff
            if (canvasAlpha < 0.02) canvasAlpha = 0;
            if (triFade < 0.04) triFade = 0;

            // Hide canvas elements via CSS when fully faded — bulletproof ghost prevention
            canvas.style.visibility = canvasAlpha > 0 ? 'visible' : 'hidden';
            triCanvas.style.visibility = triFade > 0 ? 'visible' : 'hidden';

            if (canvasAlpha <= 0 && triFade <= 0) { ctx.globalAlpha = 1; triCtx.globalAlpha = 1; return; }

            var time = performance.now() * 0.001;

            // --- Opaque background covers everything (always solid, no flash) ---
            ctx.globalAlpha = canvasAlpha;
            var darkAmt = Math.min(1, scrollP * 2.5);
            // During entrance: blend from pure black → normal dark blue
            var baseR = 12, baseG = 18, baseB = 34;
            var bgR = Math.round(baseR * easeAlpha * (1 - darkAmt));
            var bgG = Math.round(baseG * easeAlpha * (1 - darkAmt));
            var bgB = Math.round(baseB * easeAlpha * (1 - darkAmt));
            ctx.fillStyle = 'rgb(' + bgR + ',' + bgG + ',' + bgB + ')';
            ctx.fillRect(0, 0, W, H);

            // --- 琉璃光 on top of darkening background ---
            var glowFade = Math.max(0, 1 - scrollP * 3) * canvasAlpha * easeAlpha;
            var glC = [[120,60,180],[40,100,200],[0,160,180],[60,180,100],[200,160,40],[180,60,120]];
            if (glowFade > 0.001) {
                for (var gl = 0; gl < 5; gl++) {
                    var gPh = gl * 1.2 + time * 0.04;
                    var gci = ((gPh % glC.length) + glC.length) % glC.length;
                    var gc0 = Math.floor(gci), gc1 = (gc0 + 1) % glC.length, gcf = gci - gc0;
                    var gcR = glC[gc0][0] + (glC[gc1][0] - glC[gc0][0]) * gcf;
                    var gcG = glC[gc0][1] + (glC[gc1][1] - glC[gc0][1]) * gcf;
                    var gcB = glC[gc0][2] + (glC[gc1][2] - glC[gc0][2]) * gcf;
                    var gx = W * (0.15 + gl * 0.17 + Math.sin(time * 0.03 + gl * 1.8) * 0.08);
                    var gy = H * (0.3 + Math.sin(time * 0.025 + gl * 2.1) * 0.2);
                    var gr = Math.min(W, H) * (0.32 + Math.sin(time * 0.02 + gl) * 0.1);
                    var ga = (0.06 + Math.sin(time * 0.05 + gl * 1.5) * 0.025) * glowFade;
                    ctx.globalAlpha = 1;
                    var gg = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
                    gg.addColorStop(0, 'rgba(' + (gcR|0) + ',' + (gcG|0) + ',' + (gcB|0) + ',' + ga.toFixed(3) + ')');
                    gg.addColorStop(0.5, 'rgba(' + (gcR|0) + ',' + (gcG|0) + ',' + (gcB|0) + ',' + (ga * 0.4).toFixed(4) + ')');
                    gg.addColorStop(1, 'rgba(0,0,0,0)');
                    ctx.fillStyle = gg;
                    ctx.fillRect(gx - gr, gy - gr, gr * 2, gr * 2);
                }
            }

            // --- Opaque Möbius triangle on OVERLAY canvas (independent fade) ---
            if (triFade > 0) {
                triCtx.globalAlpha = triFade * easeAlpha;
                var lightDir = norm3([0.5, -0.6, 0.8]);
                var light2 = norm3([-0.3, 0.4, 0.5]);

                // Transform all vertices + normals
                var tv = [], tn = [], pv = [];
                for (var i = 0; i <= NP; i++) {
                    var a = [], b = [], c = [];
                    for (var j = 0; j < NW; j++) {
                        var v = rX(baseV[i][j], rx); v = rY(v, ry);
                        a.push(v); c.push(proj(v));
                        var n = rX(baseN[i][j], rx); n = rY(n, ry);
                        b.push(n);
                    }
                    tv.push(a); tn.push(b); pv.push(c);
                }

                // Build face list
                var faces = [];
                for (var i = 0; i < NP; i++) {
                    var ni = i + 1;
                    for (var j = 0; j < NW; j++) {
                        var nj = (j + 1) % NW;
                        var ra = tv[i][j], rb = tv[i][nj], rc = tv[ni][nj], rd = tv[ni][j];
                        var pa = pv[i][j], pb = pv[i][nj], pc = pv[ni][nj], pd = pv[ni][j];

                        var avgN = norm3([
                            (tn[i][j][0]+tn[i][nj][0]+tn[ni][nj][0]+tn[ni][j][0]) * 0.25,
                            (tn[i][j][1]+tn[i][nj][1]+tn[ni][nj][1]+tn[ni][j][1]) * 0.25,
                            (tn[i][j][2]+tn[i][nj][2]+tn[ni][nj][2]+tn[ni][j][2]) * 0.25
                        ]);

                        var diff1 = Math.max(0, dot3(avgN, lightDir));
                        var diff2 = Math.max(0, dot3(avgN, light2));
                        var hv1 = norm3([lightDir[0], lightDir[1], lightDir[2]+1]);
                        var spec1 = Math.pow(Math.max(0, dot3(avgN, hv1)), 64);
                        var hv2 = norm3([light2[0], light2[1], light2[2]+1]);
                        var spec2 = Math.pow(Math.max(0, dot3(avgN, hv2)), 48);
                        var viewDot = Math.abs(avgN[2]);
                        var fresnel = Math.pow(1.0 - viewDot, 2.2);
                        var avgZ = (ra[2]+rb[2]+rc[2]+rd[2]) * 0.25;
                        var pathT = i / NP;

                        faces.push({
                            p: [pa, pb, pc, pd], z: avgZ,
                            d1: diff1, d2: diff2, s1: spec1, s2: spec2,
                            fr: fresnel, vd: viewDot, pt: pathT
                        });
                    }
                }

                // Sort back-to-front
                faces.sort(function(a, b) { return a.z - b.z; });

                // Draw opaque faces — teal-cyan + red Fresnel + flowing light
                for (var f = 0; f < faces.length; f++) {
                    var fc = faces[f], p = fc.p;
                    var flow1 = Math.sin((fc.pt * 4 - time * 0.5) * Math.PI * 2) * 0.5 + 0.5;
                    var flow2 = Math.sin((fc.pt * 7 + time * 0.3) * Math.PI * 2) * 0.5 + 0.5;
                    var hs = Math.sin(fc.pt * Math.PI * 2 + time * 0.15);
                    var hc = Math.cos(fc.pt * Math.PI * 2 + 0.8 + time * 0.1);

                    // Deep muted gold base
                    var bR = 180 + hs * 12 + flow2 * 8;
                    var bG = 120 + hc * 15 + flow1 * 10;
                    var bB = 55 + hs * 8 + flow2 * 5;

                    var lit = 0.14 + fc.d1 * 0.42 + fc.d2 * 0.18 + flow1 * 0.12 + flow2 * 0.05;
                    var r = bR * lit;
                    var g = bG * lit;
                    var b = bB * lit;

                    // Fresnel: subtle warm edge
                    r += fc.fr * 120;
                    g += fc.fr * 80;
                    b += fc.fr * 35;

                    // Specular: restrained warm highlights
                    r += fc.s1 * 160 + fc.s2 * 40;
                    g += fc.s1 * 120 + fc.s2 * 30;
                    b += fc.s1 * 70 + fc.s2 * 20;

                    r = Math.min(255, Math.max(0, r)) | 0;
                    g = Math.min(255, Math.max(0, g)) | 0;
                    b = Math.min(255, Math.max(0, b)) | 0;

                    // No light → lit: triangle emerges as dark silhouette, light gradually fills in
                    if (colorProgress < 1) {
                        var lightFactor = 0.06 + 0.94 * colorProgress;
                        r = (r * lightFactor) | 0;
                        g = (g * lightFactor) | 0;
                        b = (b * lightFactor) | 0;
                    }

                    triCtx.beginPath();
                    triCtx.moveTo(p[0].x, p[0].y);
                    triCtx.lineTo(p[1].x, p[1].y);
                    triCtx.lineTo(p[2].x, p[2].y);
                    triCtx.lineTo(p[3].x, p[3].y);
                    triCtx.closePath();
                    triCtx.fillStyle = 'rgb('+r+','+g+','+b+')';
                    triCtx.fill();
                }
            }

            ctx.globalAlpha = 1;
            triCtx.globalAlpha = 1;
        }

        function loop() {
            if (!running) {
                ctx.clearRect(0, 0, W, H);
                triCtx.clearRect(0, 0, W, H);
                canvas.style.visibility = 'hidden';
                triCanvas.style.visibility = 'hidden';
                return;
            }
            if (!document.body.classList.contains('main-menu-open')) {
                tick();
            }
            requestAnimationFrame(loop);
        }

        if (heroEl) {
            heroEl.addEventListener('pointermove', function(e) {
                var r = heroEl.getBoundingClientRect();
                mouse.x = (e.clientX - r.left) / r.width;
                mouse.y = (e.clientY - r.top) / r.height;
            });
        }

        var obs = new IntersectionObserver(function(entries) {
            running = entries[0].isIntersecting;
            if (running) {
                canvas.style.visibility = 'visible';
                triCanvas.style.visibility = 'visible';
                loop();
            } else {
                ctx.clearRect(0, 0, W, H);
                triCtx.clearRect(0, 0, W, H);
                canvas.style.visibility = 'hidden';
                triCanvas.style.visibility = 'hidden';
            }
        }, { threshold: 0.05 });
        if (heroEl) obs.observe(heroEl);

        window.addEventListener('resize', resize);
        resize();
        loop();
    }

    // ========================================
    // 2b. Service-block browser illustration (web design)
    // ========================================
    function initServiceTriangle() {
        var canvas = document.getElementById('webDesignTri');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');

        var W, H;
        var running = false;
        var mouse = { x: 0.5, y: 0.5, hover: false };
        var smooth = { x: 0.5, y: 0.5 };

        /* ---- Gold palette (deep) ---- */
        var G = '155,110,35';
        var GB = '190,150,60';
        var GD = '85,60,20';

        /* ---- UI block definitions (normalized 0-1 inside browser body) ---- */
        // Each block assembles by rising from below with fade-in, staggered
        var uiBlocks = [
            // Nav bar placeholder
            { x: 0.06, y: 0.02, w: 0.88, h: 0.045, alpha: 0.35, delay: 0 },
            // Hero image area
            { x: 0.06, y: 0.09, w: 0.88, h: 0.28, alpha: 0.18, delay: 0.12 },
            // Left sidebar card
            { x: 0.06, y: 0.41, w: 0.26, h: 0.22, alpha: 0.25, delay: 0.25 },
            // Center card
            { x: 0.37, y: 0.41, w: 0.26, h: 0.22, alpha: 0.25, delay: 0.35 },
            // Right card
            { x: 0.68, y: 0.41, w: 0.26, h: 0.22, alpha: 0.25, delay: 0.45 },
            // Text lines
            { x: 0.06, y: 0.68, w: 0.55, h: 0.025, alpha: 0.22, delay: 0.55 },
            { x: 0.06, y: 0.72, w: 0.42, h: 0.025, alpha: 0.18, delay: 0.60 },
            { x: 0.06, y: 0.76, w: 0.48, h: 0.025, alpha: 0.15, delay: 0.65 },
            // CTA button
            { x: 0.06, y: 0.82, w: 0.18, h: 0.05, alpha: 0.40, delay: 0.72 },
            // Footer
            { x: 0.06, y: 0.92, w: 0.88, h: 0.04, alpha: 0.15, delay: 0.80 }
        ];

        /* ---- Floating code particles ---- */
        var codeSymbols = ['<', '/>', '{', '}', '</', '>', '< >', '( )', '[ ]', '::',  '#', '.cls'];
        var particles = [];

        function initParticles() {
            particles = [];
            for (var i = 0; i < 18; i++) {
                particles.push({
                    x: 0.05 + Math.random() * 0.9,
                    y: 0.05 + Math.random() * 0.9,
                    vx: (Math.random() - 0.5) * 0.003,
                    vy: -0.001 - Math.random() * 0.004,
                    symbol: codeSymbols[Math.floor(Math.random() * codeSymbols.length)],
                    alpha: 0.08 + Math.random() * 0.18,
                    size: 0.022 + Math.random() * 0.016,
                    phase: Math.random() * Math.PI * 2
                });
            }
        }
        initParticles();

        /* ---- Cursor that traces across blocks ---- */
        var cursor = { x: 0.3, y: 0.4, tx: 0.3, ty: 0.4, wait: 0 };

        /* ---- Resize ---- */
        function resize() {
            var rect = canvas.getBoundingClientRect();
            var dpr = Math.min(window.devicePixelRatio || 1, 2);
            W = rect.width; H = rect.height;
            canvas.width = W * dpr; canvas.height = H * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        /* ---- Rounded rect helper ---- */
        function roundRect(x, y, w, h, r) {
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + w - r, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + r);
            ctx.lineTo(x + w, y + h - r);
            ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            ctx.lineTo(x + r, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - r);
            ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y);
            ctx.closePath();
        }

        /* ---- Draw browser chrome ---- */
        function drawChrome(bx, by, bw, bh, chromeH, tiltX, tiltY) {
            // Outer frame with perspective tilt
            ctx.save();
            ctx.translate(bx + bw / 2, by + bh / 2);
            // Subtle 3D perspective tilt
            ctx.translate(-bw / 2, -bh / 2);

            // Browser outer frame
            roundRect(0, 0, bw, bh, 8);
            ctx.strokeStyle = 'rgba(' + G + ',0.55)';
            ctx.lineWidth = 1.2;
            ctx.stroke();

            // Chrome bar background
            ctx.fillStyle = 'rgba(' + GD + ',0.20)';
            roundRect(0, 0, bw, chromeH, 8);
            // clip bottom corners of chrome
            ctx.fill();

            // Divider line below chrome
            ctx.beginPath();
            ctx.moveTo(0, chromeH);
            ctx.lineTo(bw, chromeH);
            ctx.strokeStyle = 'rgba(' + G + ',0.35)';
            ctx.lineWidth = 0.8;
            ctx.stroke();

            // Three dots
            var dotR = chromeH * 0.12;
            var dotY = chromeH * 0.5;
            for (var d = 0; d < 3; d++) {
                var dotX = 14 + d * (dotR * 3);
                ctx.beginPath();
                ctx.arc(dotX, dotY, dotR, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(' + G + ',' + (d === 0 ? '0.75' : '0.4') + ')';
                ctx.fill();
            }

            // Address bar
            var abX = 14 + 3 * (dotR * 3) + 12;
            var abW = bw - abX - 14;
            var abH = chromeH * 0.38;
            var abY = (chromeH - abH) / 2;
            roundRect(abX, abY, abW, abH, abH / 2);
            ctx.strokeStyle = 'rgba(' + G + ',0.2)';
            ctx.lineWidth = 0.7;
            ctx.stroke();

            // Tiny URL text in address bar
            ctx.font = (abH * 0.55) + 'px monospace';
            ctx.fillStyle = 'rgba(' + G + ',0.3)';
            ctx.fillText('https://', abX + 8, abY + abH * 0.72);

            ctx.restore();
            return chromeH;
        }

        /* ---- Draw UI blocks with assembly animation ---- */
        function drawBlocks(bx, by, bw, bh, chromeH, time, globalEntry) {
            var bodyX = bx;
            var bodyY = by + chromeH;
            var bodyW = bw;
            var bodyH = bh - chromeH;

            for (var i = 0; i < uiBlocks.length; i++) {
                var bl = uiBlocks[i];
                // Entry animation: staggered fade + slide up
                var entryT = Math.max(0, Math.min(1, (globalEntry - bl.delay) / 0.4));
                var ease = entryT * entryT * (3 - 2 * entryT); // smoothstep
                if (ease < 0.01) continue;

                var bxp = bodyX + bl.x * bodyW;
                var byp = bodyY + bl.y * bodyH + (1 - ease) * 12;
                var bwp = bl.w * bodyW;
                var bhp = bl.h * bodyH;
                var r = Math.min(bwp, bhp) * 0.12;

                // Gentle breathing
                var breathe = 1 + Math.sin(time * 0.8 + i * 0.7) * 0.03;
                var alpha = bl.alpha * ease * breathe;

                // Fill
                roundRect(bxp, byp, bwp, bhp, r);
                ctx.fillStyle = 'rgba(' + G + ',' + (alpha * 0.5).toFixed(3) + ')';
                ctx.fill();

                // Stroke
                roundRect(bxp, byp, bwp, bhp, r);
                ctx.strokeStyle = 'rgba(' + G + ',' + (alpha * 0.8).toFixed(3) + ')';
                ctx.lineWidth = 0.7;
                ctx.stroke();

                // Inner shimmer line (subtle light sweep)
                var shimmer = (Math.sin(time * 0.6 - i * 0.4) + 1) * 0.5;
                var shimX = bxp + shimmer * bwp * 0.6;
                var grd = ctx.createLinearGradient(shimX, byp, shimX + bwp * 0.4, byp);
                grd.addColorStop(0, 'rgba(' + GB + ',0)');
                grd.addColorStop(0.5, 'rgba(' + GB + ',' + (alpha * 0.3).toFixed(3) + ')');
                grd.addColorStop(1, 'rgba(' + GB + ',0)');
                ctx.save();
                roundRect(bxp, byp, bwp, bhp, r);
                ctx.clip();
                ctx.fillStyle = grd;
                ctx.fillRect(bxp, byp, bwp, bhp);
                ctx.restore();
            }
        }

        /* ---- Draw floating code particles ---- */
        function drawCodeParticles(bx, by, bw, bh, chromeH, time) {
            var bodyX = bx;
            var bodyY = by + chromeH;
            var bodyW = bw;
            var bodyH = bh - chromeH;

            ctx.save();
            // Clip to browser body
            roundRect(bx + 1, bodyY, bw - 2, bodyH - 8, 6);
            ctx.clip();

            for (var i = 0; i < particles.length; i++) {
                var p = particles[i];

                // Drift
                p.x += p.vx;
                p.y += p.vy;

                // Horizontal wobble
                p.x += Math.sin(time * 0.5 + p.phase) * 0.0004;

                // Wrap around
                if (p.y < -0.05) { p.y = 1.05; p.x = 0.05 + Math.random() * 0.9; }
                if (p.x < -0.05) p.x = 1.05;
                if (p.x > 1.05) p.x = -0.05;

                var px = bodyX + p.x * bodyW;
                var py = bodyY + p.y * bodyH;
                var flicker = p.alpha * (0.5 + Math.sin(time * 0.7 + p.phase) * 0.5);
                var sz = p.size * Math.min(bodyW, bodyH);

                ctx.font = sz + 'px monospace';
                ctx.fillStyle = 'rgba(' + GB + ',' + flicker.toFixed(3) + ')';
                ctx.fillText(p.symbol, px, py);
            }

            ctx.restore();
        }

        /* ---- Animated cursor ---- */
        function drawCursor(bx, by, bw, bh, chromeH, time) {
            var bodyX = bx;
            var bodyY = by + chromeH;
            var bodyW = bw;
            var bodyH = bh - chromeH;

            // Move cursor between blocks
            cursor.wait -= 0.016;
            if (cursor.wait <= 0) {
                var target = uiBlocks[Math.floor(Math.random() * uiBlocks.length)];
                cursor.tx = target.x + target.w * 0.5;
                cursor.ty = target.y + target.h * 0.5;
                cursor.wait = 1.5 + Math.random() * 2.5;
            }
            cursor.x += (cursor.tx - cursor.x) * 0.03;
            cursor.y += (cursor.ty - cursor.y) * 0.03;

            var cx = bodyX + cursor.x * bodyW;
            var cy = bodyY + cursor.y * bodyH;
            var cSize = Math.min(bodyW, bodyH) * 0.04;
            var pulse = 0.6 + Math.sin(time * 2) * 0.15;

            // Glow
            var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, cSize * 3);
            g.addColorStop(0, 'rgba(' + GB + ',' + (0.15 * pulse).toFixed(3) + ')');
            g.addColorStop(1, 'rgba(' + GB + ',0)');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(cx, cy, cSize * 3, 0, Math.PI * 2);
            ctx.fill();

            // Arrow shape
            ctx.save();
            ctx.translate(cx, cy);
            ctx.scale(cSize / 12, cSize / 12);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, 14);
            ctx.lineTo(4, 10);
            ctx.lineTo(7, 16);
            ctx.lineTo(9, 15);
            ctx.lineTo(6, 9);
            ctx.lineTo(10, 9);
            ctx.closePath();
            ctx.fillStyle = 'rgba(' + GB + ',' + (0.55 * pulse).toFixed(3) + ')';
            ctx.fill();
            ctx.restore();
        }

        /* ---- Scan line effect ---- */
        function drawScanLine(bx, by, bw, bh, chromeH, time) {
            var bodyY = by + chromeH;
            var bodyH = bh - chromeH;
            var scanY = bodyY + ((time * 0.08) % 1) * bodyH;
            var grd = ctx.createLinearGradient(bx, scanY - 15, bx, scanY + 15);
            grd.addColorStop(0, 'rgba(' + GB + ',0)');
            grd.addColorStop(0.5, 'rgba(' + GB + ',0.04)');
            grd.addColorStop(1, 'rgba(' + GB + ',0)');
            ctx.fillStyle = grd;
            ctx.fillRect(bx, scanY - 15, bw, 30);
        }

        /* ---- Main render ---- */
        var entryStart = 0;

        function tick() {
            var tgt_x = mouse.hover ? mouse.x : 0.5;
            var tgt_y = mouse.hover ? mouse.y : 0.5;
            smooth.x += (tgt_x - smooth.x) * 0.04;
            smooth.y += (tgt_y - smooth.y) * 0.04;
            var tiltX = (smooth.x - 0.5) * 2;
            var tiltY = (smooth.y - 0.5) * 2;

            var time = performance.now() * 0.001;
            if (entryStart === 0) entryStart = time;
            var globalEntry = Math.min((time - entryStart) * 0.7, 2.0);

            ctx.clearRect(0, 0, W, H);

            // Browser dimensions — centered with padding
            var pad = Math.min(W, H) * 0.14;
            var bw = W - pad * 2;
            var bh = H - pad * 2;
            var bx = pad;
            var by = pad;
            var chromeH = Math.max(24, bh * 0.065);

            // Apply subtle perspective tilt from mouse
            ctx.save();
            ctx.translate(W / 2, H / 2);
            // Faux 3D tilt via skew
            ctx.transform(1, tiltY * 0.015, tiltX * 0.015, 1, 0, 0);
            ctx.translate(-W / 2, -H / 2);

            drawChrome(bx, by, bw, bh, chromeH, tiltX, tiltY);
            drawBlocks(bx, by, bw, bh, chromeH, time, globalEntry);
            drawCodeParticles(bx, by, bw, bh, chromeH, time);
            drawScanLine(bx, by, bw, bh, chromeH, time);
            drawCursor(bx, by, bw, bh, chromeH, time);

            ctx.restore();
        }

        function loop() {
            if (!running) return;
            if (!document.body.classList.contains('main-menu-open')) {
                tick();
            }
            requestAnimationFrame(loop);
        }

        /* ---- Mouse hover interaction ---- */
        canvas.addEventListener('pointerenter', function() { mouse.hover = true; });
        canvas.addEventListener('pointerleave', function() { mouse.hover = false; });
        canvas.addEventListener('pointermove', function(e) {
            var r = canvas.getBoundingClientRect();
            mouse.x = (e.clientX - r.left) / r.width;
            mouse.y = (e.clientY - r.top) / r.height;
        });

        /* ---- IntersectionObserver: only animate when visible ---- */
        var obs = new IntersectionObserver(function(entries) {
            var vis = entries[0].isIntersecting;
            if (vis && !running) {
                running = true;
                entryStart = 0; // reset entry animation
                loop();
            } else if (!vis) {
                running = false;
            }
        }, { threshold: 0.05 });
        obs.observe(canvas);

        /* ---- Resize handling ---- */
        window.addEventListener('resize', resize);
        resize();
    }

    // ========================================
    // 2c. Service-block phone illustration (app design)
    // ========================================
    function initAppDesignCanvas() {
        var canvas = document.getElementById('appDesignTri');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');

        var W, H, dpr;
        var running = false;
        var mouse = { x: 0.5, y: 0.5, hover: false };
        var smooth = { x: 0.5, y: 0.5 };

        // Offscreen canvas for tablet layer (isolates composite ops)
        var tabCanvas = document.createElement('canvas');
        var tabCtx = tabCanvas.getContext('2d');

        /* ---- Gold palette (deep) ---- */
        var G = '155,110,35';
        var GB = '190,150,60';
        var GD = '85,60,20';

        /* ---- Phone UI block definitions (normalized 0-1 inside phone screen) ---- */
        var uiBlocks = [
            // Status bar
            { x: 0.0, y: 0.0, w: 1.0, h: 0.04, alpha: 0.22, delay: 0, r: 0 },
            // App header / nav
            { x: 0.0, y: 0.04, w: 1.0, h: 0.07, alpha: 0.30, delay: 0.08, r: 0 },
            // Hero card / banner
            { x: 0.06, y: 0.14, w: 0.88, h: 0.20, alpha: 0.20, delay: 0.18, r: 0.04 },
            // Two small cards row
            { x: 0.06, y: 0.37, w: 0.42, h: 0.15, alpha: 0.22, delay: 0.30, r: 0.04 },
            { x: 0.52, y: 0.37, w: 0.42, h: 0.15, alpha: 0.22, delay: 0.36, r: 0.04 },
            // List item 1
            { x: 0.06, y: 0.56, w: 0.88, h: 0.065, alpha: 0.18, delay: 0.44, r: 0.03 },
            // List item 2
            { x: 0.06, y: 0.64, w: 0.88, h: 0.065, alpha: 0.18, delay: 0.50, r: 0.03 },
            // List item 3
            { x: 0.06, y: 0.72, w: 0.88, h: 0.065, alpha: 0.18, delay: 0.56, r: 0.03 },
            // FAB button (circle)
            { x: 0.74, y: 0.82, w: 0.12, h: 0, alpha: 0.45, delay: 0.65, r: 999, isFab: true },
            // Bottom tab bar
            { x: 0.0, y: 0.92, w: 1.0, h: 0.08, alpha: 0.28, delay: 0.70, r: 0 }
        ];

        /* ---- Floating app-related symbols ---- */
        var appSymbols = ['{ }', '< >', 'UI', 'UX', 'API', '[ ]', '::',  'fn', '=>', 'iOS', '...', '# '];
        var particles = [];

        function initParticles() {
            particles = [];
            for (var i = 0; i < 14; i++) {
                particles.push({
                    x: 0.05 + Math.random() * 0.9,
                    y: 0.05 + Math.random() * 0.9,
                    vx: (Math.random() - 0.5) * 0.002,
                    vy: -0.001 - Math.random() * 0.003,
                    symbol: appSymbols[Math.floor(Math.random() * appSymbols.length)],
                    alpha: 0.06 + Math.random() * 0.14,
                    size: 0.025 + Math.random() * 0.015,
                    phase: Math.random() * Math.PI * 2
                });
            }
        }
        initParticles();

        /* ---- Resize ---- */
        function resize() {
            var rect = canvas.getBoundingClientRect();
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            W = rect.width; H = rect.height;
            canvas.width = W * dpr; canvas.height = H * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            tabCanvas.width = W * dpr; tabCanvas.height = H * dpr;
            tabCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        /* ---- Rounded rect helper (draws on given context) ---- */
        function roundRect(x, y, w, h, r, c) {
            var t = c || ctx;
            if (r > w / 2) r = w / 2;
            if (r > h / 2) r = h / 2;
            t.beginPath();
            t.moveTo(x + r, y);
            t.lineTo(x + w - r, y);
            t.quadraticCurveTo(x + w, y, x + w, y + r);
            t.lineTo(x + w, y + h - r);
            t.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            t.lineTo(x + r, y + h);
            t.quadraticCurveTo(x, y + h, x, y + h - r);
            t.lineTo(x, y + r);
            t.quadraticCurveTo(x, y, x + r, y);
            t.closePath();
        }

        /* ---- Draw phone frame ---- */
        function drawPhoneFrame(px, py, pw, ph) {
            var frameR = pw * 0.08;

            // Outer shell
            roundRect(px, py, pw, ph, frameR);
            ctx.strokeStyle = 'rgba(' + G + ',0.6)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Side button (right side, volume)
            ctx.beginPath();
            ctx.moveTo(px + pw + 1.5, py + ph * 0.22);
            ctx.lineTo(px + pw + 1.5, py + ph * 0.30);
            ctx.strokeStyle = 'rgba(' + G + ',0.45)';
            ctx.lineWidth = 2.5;
            ctx.stroke();

            // Power button (right side)
            ctx.beginPath();
            ctx.moveTo(px + pw + 1.5, py + ph * 0.35);
            ctx.lineTo(px + pw + 1.5, py + ph * 0.42);
            ctx.stroke();

            // Dynamic island / notch
            var notchW = pw * 0.28;
            var notchH = ph * 0.025;
            var notchX = px + (pw - notchW) / 2;
            var notchY = py + ph * 0.015;
            roundRect(notchX, notchY, notchW, notchH, notchH / 2);
            ctx.fillStyle = 'rgba(' + GD + ',0.50)';
            ctx.fill();

            // Screen inset area
            var inset = pw * 0.03;
            var screenX = px + inset;
            var screenY = py + inset;
            var screenW = pw - inset * 2;
            var screenH = ph - inset * 2;
            var screenR = frameR - inset * 0.5;

            return { x: screenX, y: screenY, w: screenW, h: screenH, r: screenR };
        }

        /* ---- Draw tablet on offscreen canvas, erase phone area, blit to main ---- */
        function drawTablet(phoneX, phoneY, phoneW, phoneH, tiltX, tiltY) {
            var tc = tabCtx; // shorthand
            var tabW = phoneW * 2.4;
            var tabH = tabW * 0.72;
            var tabX = phoneX + phoneW * 0.35;
            var tabY = phoneY - tabH * 0.15;
            var frameR = tabW * 0.03;
            var inset = tabW * 0.025;

            // Clear offscreen + apply same perspective transform
            tc.clearRect(0, 0, W, H);
            tc.save();
            tc.translate(W / 2, H / 2);
            tc.transform(1, tiltY * 0.012, tiltX * 0.012, 1, 0, 0);
            tc.translate(-W / 2, -H / 2);

            // -- Draw tablet on offscreen --
            roundRect(tabX, tabY, tabW, tabH, frameR, tc);
            tc.strokeStyle = 'rgba(' + G + ',0.30)';
            tc.lineWidth = 1.2;
            tc.stroke();

            roundRect(tabX, tabY, tabW, tabH, frameR, tc);
            tc.fillStyle = 'rgba(' + GD + ',0.06)';
            tc.fill();

            var camX = tabX + tabW * 0.5;
            var camY = tabY + inset * 0.8;
            tc.beginPath();
            tc.arc(camX, camY, tabW * 0.006, 0, Math.PI * 2);
            tc.fillStyle = 'rgba(' + G + ',0.35)';
            tc.fill();

            var scrX = tabX + inset;
            var scrY = tabY + inset;
            var scrW = tabW - inset * 2;
            var scrH = tabH - inset * 2;
            var scrR = frameR - inset * 0.4;

            roundRect(scrX, scrY, scrW, scrH, scrR, tc);
            tc.strokeStyle = 'rgba(' + G + ',0.12)';
            tc.lineWidth = 0.6;
            tc.stroke();

            var uiAlpha = 0.10;
            roundRect(scrX + scrW * 0.03, scrY + scrH * 0.03, scrW * 0.94, scrH * 0.07, 3, tc);
            tc.fillStyle = 'rgba(' + G + ',' + uiAlpha + ')';
            tc.fill();

            roundRect(scrX + scrW * 0.03, scrY + scrH * 0.14, scrW * 0.45, scrH * 0.50, 4, tc);
            tc.fillStyle = 'rgba(' + G + ',' + (uiAlpha * 0.7) + ')';
            tc.fill();
            roundRect(scrX + scrW * 0.03, scrY + scrH * 0.14, scrW * 0.45, scrH * 0.50, 4, tc);
            tc.strokeStyle = 'rgba(' + G + ',' + (uiAlpha * 1.5) + ')';
            tc.lineWidth = 0.5;
            tc.stroke();

            roundRect(scrX + scrW * 0.52, scrY + scrH * 0.14, scrW * 0.45, scrH * 0.23, 4, tc);
            tc.fillStyle = 'rgba(' + G + ',' + (uiAlpha * 0.7) + ')';
            tc.fill();
            roundRect(scrX + scrW * 0.52, scrY + scrH * 0.14, scrW * 0.45, scrH * 0.23, 4, tc);
            tc.strokeStyle = 'rgba(' + G + ',' + (uiAlpha * 1.5) + ')';
            tc.lineWidth = 0.5;
            tc.stroke();

            roundRect(scrX + scrW * 0.52, scrY + scrH * 0.41, scrW * 0.45, scrH * 0.23, 4, tc);
            tc.fillStyle = 'rgba(' + G + ',' + (uiAlpha * 0.7) + ')';
            tc.fill();
            roundRect(scrX + scrW * 0.52, scrY + scrH * 0.41, scrW * 0.45, scrH * 0.23, 4, tc);
            tc.strokeStyle = 'rgba(' + G + ',' + (uiAlpha * 1.5) + ')';
            tc.lineWidth = 0.5;
            tc.stroke();

            for (var i = 0; i < 3; i++) {
                var lw = scrW * (0.35 + i * 0.08);
                if (lw > scrW * 0.6) lw = scrW * 0.5;
                roundRect(scrX + scrW * 0.03, scrY + scrH * (0.70 + i * 0.06), lw, scrH * 0.025, 2, tc);
                tc.fillStyle = 'rgba(' + G + ',' + (uiAlpha * 0.6) + ')';
                tc.fill();
            }

            // -- Erase phone area on offscreen (safe — doesn't touch main canvas) --
            tc.globalCompositeOperation = 'destination-out';
            var phoneR = phoneW * 0.08;
            roundRect(phoneX - 1, phoneY - 1, phoneW + 2, phoneH + 2, phoneR, tc);
            tc.fillStyle = '#000';
            tc.fill();

            tc.restore();

            // -- Blit offscreen tablet to main canvas (no transform — raw pixels) --
            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.drawImage(tabCanvas, 0, 0);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.restore();
        }

        /* ---- Draw UI blocks ---- */
        function drawBlocks(scr, time, globalEntry) {
            for (var i = 0; i < uiBlocks.length; i++) {
                var bl = uiBlocks[i];
                var entryT = Math.max(0, Math.min(1, (globalEntry - bl.delay) / 0.4));
                var ease = entryT * entryT * (3 - 2 * entryT);
                if (ease < 0.01) continue;

                // Stronger breathing + gentle vertical float
                var breathe = 1 + Math.sin(time * 1.2 + i * 0.8) * 0.10;
                var floatY = Math.sin(time * 0.6 + i * 1.1) * 2.0;
                var alpha = bl.alpha * ease * breathe;

                if (bl.isFab) {
                    // Floating action button — draw as circle
                    var fabR = bl.w * scr.w * 0.5;
                    var fabX = scr.x + bl.x * scr.w + fabR;
                    var fabY = scr.y + bl.y * scr.h + fabR + (1 - ease) * 10 + floatY;

                    // Pulsing ring
                    var pulse = (Math.sin(time * 1.8) + 1) * 0.5;
                    var ringR = fabR * (1.3 + pulse * 1.2);
                    ctx.beginPath();
                    ctx.arc(fabX, fabY, ringR, 0, Math.PI * 2);
                    ctx.strokeStyle = 'rgba(' + GB + ',' + (0.12 * (1 - pulse)).toFixed(3) + ')';
                    ctx.lineWidth = 1;
                    ctx.stroke();

                    // Glow
                    var gg = ctx.createRadialGradient(fabX, fabY, 0, fabX, fabY, fabR * 2.5);
                    gg.addColorStop(0, 'rgba(' + GB + ',' + (alpha * 0.4).toFixed(3) + ')');
                    gg.addColorStop(1, 'rgba(' + GB + ',0)');
                    ctx.fillStyle = gg;
                    ctx.beginPath();
                    ctx.arc(fabX, fabY, fabR * 2.5, 0, Math.PI * 2);
                    ctx.fill();

                    // Circle
                    ctx.beginPath();
                    ctx.arc(fabX, fabY, fabR, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(' + G + ',' + (alpha * 0.6).toFixed(3) + ')';
                    ctx.fill();
                    ctx.strokeStyle = 'rgba(' + G + ',' + (alpha * 0.9).toFixed(3) + ')';
                    ctx.lineWidth = 0.8;
                    ctx.stroke();

                    // Plus icon with rotation
                    var pSize = fabR * 0.45;
                    var rot = Math.sin(time * 0.4) * 0.3;
                    ctx.save();
                    ctx.translate(fabX, fabY);
                    ctx.rotate(rot);
                    ctx.beginPath();
                    ctx.moveTo(-pSize, 0);
                    ctx.lineTo(pSize, 0);
                    ctx.moveTo(0, -pSize);
                    ctx.lineTo(0, pSize);
                    ctx.strokeStyle = 'rgba(' + GB + ',' + (alpha * 1.2).toFixed(3) + ')';
                    ctx.lineWidth = 1.2;
                    ctx.stroke();
                    ctx.restore();
                    continue;
                }

                var bx = scr.x + bl.x * scr.w;
                var by = scr.y + bl.y * scr.h + (1 - ease) * 10 + floatY;
                var bw = bl.w * scr.w;
                var bh = bl.h * scr.h;
                var br = bl.r * scr.w;

                // Fill
                roundRect(bx, by, bw, bh, br);
                ctx.fillStyle = 'rgba(' + G + ',' + (alpha * 0.45).toFixed(3) + ')';
                ctx.fill();

                // Stroke
                roundRect(bx, by, bw, bh, br);
                ctx.strokeStyle = 'rgba(' + G + ',' + (alpha * 0.7).toFixed(3) + ')';
                ctx.lineWidth = 0.6;
                ctx.stroke();

                // Shimmer — faster and brighter sweep
                var shimmer = (Math.sin(time * 1.0 - i * 0.6) + 1) * 0.5;
                var shimX = bx + shimmer * bw * 0.6;
                var grd = ctx.createLinearGradient(shimX, by, shimX + bw * 0.4, by);
                grd.addColorStop(0, 'rgba(' + GB + ',0)');
                grd.addColorStop(0.5, 'rgba(' + GB + ',' + (alpha * 0.40).toFixed(3) + ')');
                grd.addColorStop(1, 'rgba(' + GB + ',0)');
                ctx.save();
                roundRect(bx, by, bw, bh, br);
                ctx.clip();
                ctx.fillStyle = grd;
                ctx.fillRect(bx, by, bw, bh);
                ctx.restore();

                // Tab bar icons (small circles) with active tab glow
                if (i === uiBlocks.length - 1) {
                    var tabCount = 4;
                    var tabIY = by + bh * 0.4;
                    var activeTab = Math.floor((time * 0.3) % tabCount);
                    for (var t = 0; t < tabCount; t++) {
                        var tabIX = bx + bw * (0.12 + t * 0.25);
                        var tabIR = bh * 0.16;
                        var isActive = (t === activeTab);
                        ctx.beginPath();
                        ctx.arc(tabIX, tabIY, tabIR, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(' + GB + ',' + ((isActive ? 0.55 : 0.2) * ease).toFixed(3) + ')';
                        ctx.fill();
                        if (isActive) {
                            ctx.beginPath();
                            ctx.arc(tabIX, tabIY, tabIR * 2, 0, Math.PI * 2);
                            ctx.fillStyle = 'rgba(' + GB + ',0.06)';
                            ctx.fill();
                        }
                    }
                }

                // Notification badge on header block
                if (i === 1) {
                    var badgePulse = (Math.sin(time * 2.5) + 1) * 0.5;
                    var badgeR = Math.max(2.5, bh * 0.25);
                    var badgeX = bx + bw * 0.88;
                    var badgeY = by + bh * 0.5;
                    ctx.beginPath();
                    ctx.arc(badgeX, badgeY, badgeR * (0.8 + badgePulse * 0.2), 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(' + GB + ',' + (0.5 + badgePulse * 0.3).toFixed(3) + ')';
                    ctx.fill();
                    // outer ring
                    ctx.beginPath();
                    ctx.arc(badgeX, badgeY, badgeR * (1.5 + badgePulse * 0.8), 0, Math.PI * 2);
                    ctx.strokeStyle = 'rgba(' + GB + ',' + (0.15 * (1 - badgePulse)).toFixed(3) + ')';
                    ctx.lineWidth = 0.6;
                    ctx.stroke();
                }
            }
        }

        /* ---- Floating code particles ---- */
        function drawParticles(scr, time) {
            ctx.save();
            roundRect(scr.x, scr.y, scr.w, scr.h, scr.r);
            ctx.clip();

            for (var i = 0; i < particles.length; i++) {
                var p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.x += Math.sin(time * 0.5 + p.phase) * 0.0005;
                if (p.y < -0.05) { p.y = 1.05; p.x = 0.05 + Math.random() * 0.9; }
                if (p.x < -0.05) p.x = 1.05;
                if (p.x > 1.05) p.x = -0.05;

                var px = scr.x + p.x * scr.w;
                var py = scr.y + p.y * scr.h;
                var flicker = p.alpha * (0.4 + Math.sin(time * 0.8 + p.phase) * 0.6);
                var sz = p.size * Math.min(scr.w, scr.h);

                ctx.font = 'bold ' + sz + 'px monospace';
                ctx.fillStyle = 'rgba(' + GB + ',' + flicker.toFixed(3) + ')';
                ctx.fillText(p.symbol, px, py);
            }
            ctx.restore();
        }

        /* ---- Scan line ---- */
        function drawScanLine(scr, time) {
            var scanY = scr.y + ((time * 0.09) % 1) * scr.h;
            var grd = ctx.createLinearGradient(scr.x, scanY - 16, scr.x, scanY + 16);
            grd.addColorStop(0, 'rgba(' + GB + ',0)');
            grd.addColorStop(0.5, 'rgba(' + GB + ',0.06)');
            grd.addColorStop(1, 'rgba(' + GB + ',0)');
            ctx.fillStyle = grd;
            ctx.fillRect(scr.x, scanY - 16, scr.w, 32);
        }

        /* ---- Touch finger indicator (moves between blocks) ---- */
        var finger = { x: 0.5, y: 0.4, tx: 0.5, ty: 0.4, wait: 0, pressing: false, pressT: 0 };

        function drawFinger(scr, time) {
            finger.wait -= 0.016;
            if (finger.wait <= 0) {
                var target = uiBlocks[2 + Math.floor(Math.random() * 7)];
                if (target) {
                    finger.tx = target.x + target.w * (0.3 + Math.random() * 0.4);
                    finger.ty = target.y + (target.isFab ? 0 : target.h * 0.5);
                }
                finger.wait = 2.0 + Math.random() * 2.5;
                finger.pressing = false;
                finger.pressT = 0;
            }

            finger.x += (finger.tx - finger.x) * 0.035;
            finger.y += (finger.ty - finger.y) * 0.035;

            // Start press when close to target
            var dist = Math.abs(finger.x - finger.tx) + Math.abs(finger.y - finger.ty);
            if (dist < 0.02 && !finger.pressing) {
                finger.pressing = true;
                finger.pressT = 0;
            }
            if (finger.pressing) finger.pressT = Math.min(finger.pressT + 0.04, 1);

            var fx = scr.x + finger.x * scr.w;
            var fy = scr.y + finger.y * scr.h;
            var fSize = Math.min(scr.w, scr.h) * 0.035;

            // Touch glow
            var gAlpha = finger.pressing ? 0.20 * finger.pressT : 0.08;
            var fg = ctx.createRadialGradient(fx, fy, 0, fx, fy, fSize * 4);
            fg.addColorStop(0, 'rgba(' + GB + ',' + gAlpha.toFixed(3) + ')');
            fg.addColorStop(1, 'rgba(' + GB + ',0)');
            ctx.fillStyle = fg;
            ctx.beginPath();
            ctx.arc(fx, fy, fSize * 4, 0, Math.PI * 2);
            ctx.fill();

            // Finger dot
            var dotR = fSize * (finger.pressing ? 0.7 + finger.pressT * 0.3 : 0.7);
            ctx.beginPath();
            ctx.arc(fx, fy, dotR, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(' + GB + ',' + (0.35 + (finger.pressing ? 0.2 : 0)).toFixed(3) + ')';
            ctx.fill();

            // Ripple ring when pressing
            if (finger.pressing && finger.pressT > 0.1) {
                var rr = fSize * (1 + finger.pressT * 5);
                ctx.beginPath();
                ctx.arc(fx, fy, rr, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(' + GB + ',' + (0.18 * (1 - finger.pressT)).toFixed(3) + ')';
                ctx.lineWidth = 0.8;
                ctx.stroke();
            }
        }

        /* ---- Touch ripple ---- */
        var ripple = { x: 0.5, y: 0.5, t: 0, active: false, wait: 0 };

        function drawRipple(scr, time) {
            ripple.wait -= 0.016;
            if (ripple.wait <= 0 && !ripple.active) {
                var target = uiBlocks[2 + Math.floor(Math.random() * 6)];
                if (target && !target.isFab) {
                    ripple.x = target.x + target.w * (0.3 + Math.random() * 0.4);
                    ripple.y = target.y + target.h * 0.5;
                }
                ripple.active = true;
                ripple.t = 0;
            }
            if (ripple.active) {
                ripple.t += 0.025;
                if (ripple.t > 1) {
                    ripple.active = false;
                    ripple.wait = 2 + Math.random() * 3;
                    return;
                }
                var rx = scr.x + ripple.x * scr.w;
                var ry = scr.y + ripple.y * scr.h;
                var rr = scr.w * 0.12 * ripple.t;
                var rAlpha = 0.15 * (1 - ripple.t);
                var g = ctx.createRadialGradient(rx, ry, 0, rx, ry, rr);
                g.addColorStop(0, 'rgba(' + GB + ',' + rAlpha.toFixed(3) + ')');
                g.addColorStop(1, 'rgba(' + GB + ',0)');
                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.arc(rx, ry, rr, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        /* ---- Main render ---- */
        var entryStart = 0;

        function tick() {
            var tgt_x = mouse.hover ? mouse.x : 0.5;
            var tgt_y = mouse.hover ? mouse.y : 0.5;
            smooth.x += (tgt_x - smooth.x) * 0.04;
            smooth.y += (tgt_y - smooth.y) * 0.04;
            var tiltX = (smooth.x - 0.5) * 2;
            var tiltY = (smooth.y - 0.5) * 2;

            var time = performance.now() * 0.001;
            if (entryStart === 0) entryStart = time;
            var globalEntry = Math.min((time - entryStart) * 0.7, 2.0);

            ctx.clearRect(0, 0, W, H);

            // Phone: lower-left; tablet peeks behind upper-right
            var phoneH = H * 0.75;
            var phoneW = phoneH * (9 / 19);
            if (phoneW > W * 0.35) {
                phoneW = W * 0.35;
                phoneH = phoneW * (19 / 9);
            }
            var phoneX = W * 0.12;
            var phoneY = H - phoneH - H * 0.06;

            // Apply subtle perspective tilt from mouse
            ctx.save();
            ctx.translate(W / 2, H / 2);
            ctx.transform(1, tiltY * 0.012, tiltX * 0.012, 1, 0, 0);
            ctx.translate(-W / 2, -H / 2);

            drawTablet(phoneX, phoneY, phoneW, phoneH, tiltX, tiltY);
            var scr = drawPhoneFrame(phoneX, phoneY, phoneW, phoneH);
            drawBlocks(scr, time, globalEntry);
            drawParticles(scr, time);
            drawScanLine(scr, time);
            drawFinger(scr, time);
            drawRipple(scr, time);

            ctx.restore();
        }

        function loop() {
            if (!running) return;
            if (!document.body.classList.contains('main-menu-open')) {
                tick();
            }
            requestAnimationFrame(loop);
        }

        /* ---- Mouse hover interaction ---- */
        canvas.addEventListener('pointerenter', function() { mouse.hover = true; });
        canvas.addEventListener('pointerleave', function() { mouse.hover = false; });
        canvas.addEventListener('pointermove', function(e) {
            var r = canvas.getBoundingClientRect();
            mouse.x = (e.clientX - r.left) / r.width;
            mouse.y = (e.clientY - r.top) / r.height;
        });

        /* ---- IntersectionObserver ---- */
        var obs = new IntersectionObserver(function(entries) {
            var vis = entries[0].isIntersecting;
            if (vis && !running) {
                running = true;
                entryStart = 0;
                loop();
            } else if (!vis) {
                running = false;
            }
        }, { threshold: 0.05 });
        obs.observe(canvas);

        window.addEventListener('resize', resize);
        resize();
    }

    // ========================================
    // 3. Scroll-driven blob drift (gentle)
    // ========================================
    function initBlobScroll() {
        var hero = document.querySelector('.nomo-hero');
        var blobs = document.querySelectorAll('.nomo-blob');
        if (!hero || !blobs.length) return;

        var content = hero.querySelector('.nomo-hero__content');
        var scrollHint = hero.querySelector('.nomo-hero__scroll');
        var coords = hero.querySelectorAll('.nomo-hero__coord');
        var heroH = hero.offsetHeight;

        var blobConfigs = [
            { scaleBase: 1,    scaleMul: 3,   rotBase: 0,   rotMul: 12,  opIn: 0, opOut: 0.01 },
            { scaleBase: 0.85, scaleMul: 2.8, rotBase: -5,  rotMul: -10, opIn: 0, opOut: 0.01 },
            { scaleBase: 0.70, scaleMul: 2.5, rotBase: 8,   rotMul: 9,   opIn: 0, opOut: 0.01 },
            { scaleBase: 0.55, scaleMul: 2.2, rotBase: -3,  rotMul: -7,  opIn: 0, opOut: 0.01 }
        ];

        var morphStates = [
            '62% 38% 46% 54% / 60% 44% 56% 40%',
            '45% 55% 62% 38% / 38% 58% 42% 62%',
            '55% 45% 35% 65% / 52% 40% 60% 48%',
            '40% 60% 55% 45% / 65% 35% 45% 55%',
            '58% 42% 48% 52% / 42% 55% 45% 58%'
        ];

        function lerp(a, b, t) { return a + (b - a) * t; }

        function lerpBorderRadius(r1, r2, t) {
            var p1 = r1.replace(' / ', '/').split('/');
            var p2 = r2.replace(' / ', '/').split('/');
            var h1 = p1[0].trim().split(' '), h2 = p2[0].trim().split(' ');
            var v1 = p1[1].trim().split(' '), v2 = p2[1].trim().split(' ');
            var h = [], v = [];
            for (var i = 0; i < 4; i++) {
                h.push(lerp(parseFloat(h1[i]), parseFloat(h2[i]), t).toFixed(1) + '%');
                v.push(lerp(parseFloat(v1[i]), parseFloat(v2[i]), t).toFixed(1) + '%');
            }
            return h.join(' ') + ' / ' + v.join(' ');
        }

        var ticking = false;
        function onScroll() {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(function() {
                var scrollY = window.scrollY;
                var p = Math.min(scrollY / heroH, 1.5);
                var t = Math.min(p, 1);

                var morphT = t * (morphStates.length - 1);
                var morphIdx = Math.floor(morphT);
                var morphFrac = morphT - morphIdx;
                var brFrom = morphStates[Math.min(morphIdx, morphStates.length - 1)];
                var brTo = morphStates[Math.min(morphIdx + 1, morphStates.length - 1)];
                var currentBR = lerpBorderRadius(brFrom, brTo, morphFrac);

                for (var i = 0; i < blobs.length; i++) {
                    var cfg = blobConfigs[i] || blobConfigs[blobConfigs.length - 1];
                    var scale = cfg.scaleBase + t * cfg.scaleMul;
                    var rot = cfg.rotBase + t * cfg.rotMul;

                    var blobAlpha;
                    if (t < cfg.opIn) {
                        blobAlpha = 0;
                    } else if (t < cfg.opOut) {
                        blobAlpha = (t - cfg.opIn) / (cfg.opOut - cfg.opIn);
                    } else if (t > 0.01) {
                        blobAlpha = Math.max(0, 1 - (t - 0.01) / 0.12);
                    } else {
                        blobAlpha = 1;
                    }

                    blobs[i].style.transform = 'translate(-50%, -50%) scale(' + scale.toFixed(3) + ') rotate(' + rot.toFixed(1) + 'deg)';
                    blobs[i].style.opacity = Math.max(0, Math.min(1, blobAlpha)).toFixed(3);
                    blobs[i].style.borderRadius = currentBR;
                }

                if (content) {
                    // Text starts in front of triangle (z:30); drops behind (z:20) when triangle fills viewport
                    content.style.zIndex = t > 0.10 ? '20' : '30';
                    content.style.transform = 'translate(-50%, calc(-50% + ' + (scrollY * 0.2) + 'px))';
                    content.style.opacity = Math.max(0, 1 - t * 5).toFixed(3);
                }
                if (scrollHint) {
                    scrollHint.style.opacity = Math.max(0, 1 - t * 5).toFixed(3);
                }
                for (var ci = 0; ci < coords.length; ci++) {
                    coords[ci].style.opacity = Math.max(0, 1 - t * 3).toFixed(3);
                }

                ticking = false;
            });
        }

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', function() { heroH = hero.offsetHeight; });
        onScroll();
    }

    // ========================================
    // 4. Idle blob breathing animation
    // ========================================
    function initBlobBreathing() {
        var blobs = document.querySelectorAll('.nomo-blob');
        if (!blobs.length) return;

        var startTime = performance.now();
        var speeds = [0.0003, 0.00025, 0.00035, 0.0004];
        var amplitudes = [2, 3, 2, 2.5];
        var phases = [0, 0.8, 1.6, 2.4];

        function animate(now) {
            if (window.scrollY > 10 || document.body.classList.contains('main-menu-open')) {
                requestAnimationFrame(animate);
                return;
            }

            var elapsed = now - startTime;

            for (var i = 0; i < blobs.length; i++) {
                var sp = speeds[i] || 0.0003;
                var amp = amplitudes[i] || 2;
                var ph = phases[i] || 0;

                var breathX = Math.sin(elapsed * sp + ph) * amp;
                var breathY = Math.cos(elapsed * sp * 0.7 + ph) * amp * 0.6;
                var breathRot = Math.sin(elapsed * sp * 0.5 + ph) * 1.5;

                var baseScales = [1, 0.85, 0.70, 0.55];
                var s = baseScales[i] || 0.5;

                blobs[i].style.transform = 'translate(calc(-50% + ' + breathX.toFixed(1) + 'px), calc(-50% + ' + breathY.toFixed(1) + 'px)) scale(' + s + ') rotate(' + breathRot.toFixed(1) + 'deg)';
            }

            requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);
    }

    // ========================================
    // 5. Section scroll transitions
    // ========================================
    function initSectionTransitions() {
        var sections = document.querySelectorAll('.nomo-section');
        if (!sections.length) return;

        // First section: reveal as soon as user scrolls
        var firstRevealed = false;
        var heroH = window.innerHeight;
        function checkFirstSection() {
            if (firstRevealed) return;
            if (window.scrollY > 10) {
                firstRevealed = true;
                sections[0].classList.add('nomo-section--visible');
                window.removeEventListener('scroll', checkFirstSection);
            }
        }
        window.addEventListener('scroll', checkFirstSection, { passive: true });
        window.addEventListener('resize', function() { heroH = window.innerHeight; });

        // Remaining sections: IntersectionObserver
        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('nomo-section--visible');
                }
            });
        }, { threshold: 0.06, rootMargin: '0px 0px -60px 0px' });

        for (var i = 1; i < sections.length; i++) {
            observer.observe(sections[i]);
        }
    }

    // ========================================
    // 5b. UNLIMITED letter-rise (mask reveal)
    // ========================================
    function splitTextToLetters() {
        var el = document.querySelector('.nomo-hero__title-accent');
        if (!el) return;
        var text = el.textContent;
        el.textContent = '';
        el.classList.remove('anim-reveal');
        el.classList.add('letter-rise-wrap');
        for (var i = 0; i < text.length; i++) {
            var letter = document.createElement('span');
            letter.className = 'letter-rise';
            letter.textContent = text[i];
            letter.style.transitionDelay = (0.4 + i * 0.06) + 's';
            el.appendChild(letter);
        }
    }

    // ========================================
    // 6. Scroll-based reveal (.anim-reveal)
    // ========================================
    function initScrollReveal() {
        var els = document.querySelectorAll('.anim-reveal');
        if (!els.length) return;

        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    var el = entry.target;
                    var delay = parseInt(el.getAttribute('data-delay')) || 0;
                    setTimeout(function() {
                        el.classList.add('is-visible');
                    }, delay);
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        els.forEach(function(el) { observer.observe(el); });
    }

    // ========================================
    // 7. Work card tilt
    // ========================================
    function initWorkTilt() {
        if (window.innerWidth < 1024) return;
        document.querySelectorAll('.nomo-work-card').forEach(function(card) {
            card.addEventListener('mousemove', function(e) {
                var r = card.getBoundingClientRect();
                var x = (e.clientX - r.left) / r.width - 0.5;
                var y = (e.clientY - r.top) / r.height - 0.5;
                card.style.transform = 'perspective(800px) rotateY(' + (x * 6) + 'deg) rotateX(' + (-y * 6) + 'deg) scale(1.03)';
            });
            card.addEventListener('mouseleave', function() {
                card.style.transform = '';
            });
        });
    }

    // ========================================
    // 8. Lenis inertial scroll
    // ========================================
    var lenis = null;

    function initLenisScroll() {
        if (typeof Lenis === 'undefined') return;

        lenis = new Lenis({
            duration: 1.1,
            easing: function(t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
            smoothWheel: true,
            smoothTouch: false,
            touchMultiplier: 1.5
        });

        // Dedicated RAF loop for Lenis
        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        // Anchor link scrolling via Lenis API
        document.querySelectorAll('a[href^="#"]').forEach(function(a) {
            a.addEventListener('click', function(e) {
                var id = this.getAttribute('href');
                if (id === '#' || id === '#!') return;
                var target = document.querySelector(id);
                if (target) {
                    e.preventDefault();
                    lenis.scrollTo(target, { offset: 0, duration: 1.4 });
                }
            });
        });
    }

    // ========================================
    // 9. Scroll state
    // ========================================
    function initScrollState() {
        function check() {
            document.body.classList.toggle('is-on-top', window.scrollY <= 10);
        }
        window.addEventListener('scroll', check, { passive: true });
        check();
    }

    // ========================================
    // Init
    // ========================================
    document.addEventListener('DOMContentLoaded', function() {
        initHeroEntrance();

        if (prefersReducedMotion) {
            // Show all sections and reveals immediately without animation
            document.querySelectorAll('.nomo-section').forEach(function(s) {
                s.classList.add('nomo-section--visible');
            });
            document.querySelectorAll('.anim-reveal').forEach(function(el) {
                el.classList.add('is-visible');
            });
        } else {
            initMobiusTriangle();
            initServiceTriangle();
            initAppDesignCanvas();
            initBlobScroll();
            initBlobBreathing();
            initWorkTilt();
        }

        initSectionTransitions();
        splitTextToLetters();
        initScrollReveal();
        if (!prefersReducedMotion) {
            initLenisScroll();
        }
        initScrollState();

        // Menu toggle (vanilla JS — independent of jQuery/main.js)
        function openMenu() {
            document.body.classList.add('main-menu-open');
            if (lenis) lenis.stop();
            var list = document.querySelector('.main-menu-list');
            if (list) list.scrollTop = 0;
        }
        function closeMenu() {
            document.body.classList.remove('main-menu-open');
            if (lenis) lenis.start();
        }

        var menuToggleEl = document.querySelector('.menu-toggle-btn .el');
        if (menuToggleEl) {
            menuToggleEl.addEventListener('click', openMenu);
        }
        var menuCloseBtn = document.querySelector('.menu-close-btn');
        if (menuCloseBtn) {
            menuCloseBtn.addEventListener('click', closeMenu);
        }

        // Close menu on menu-link click
        document.querySelectorAll('.main-menu-link').forEach(function(link) {
            link.addEventListener('click', closeMenu);
        });
    });

})();
