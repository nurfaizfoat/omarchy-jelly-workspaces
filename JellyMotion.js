// Pure geometry shared by the live QML indicator and its regression tests.
// Dimensions are in the Penpot study's 47px reference units, then scaled to
// the bar's own icon size. No clock, timers, filesystem or shell access here.
var duration = 320;
var poses = [
    { ms: 0, w: 47, left: 45, right: 45, neck: 45, r: 14 },
    { ms: 32, w: 43, left: 50, right: 50, neck: 50, r: 14 },
    { ms: 64, w: 62, left: 30, right: 40, neck: 31, r: 14 },
    { ms: 104, w: 86, left: 26, right: 34, neck: 25, r: 14 },
    { ms: 140, w: 66, left: 30, right: 43, neck: 34, r: 14 },
    { ms: 180, w: 38, left: 56, right: 56, neck: 56, r: 14 },
    { ms: 224, w: 53, left: 40, right: 40, neck: 40, r: 14 },
    { ms: 272, w: 45, left: 47, right: 47, neck: 47, r: 14 },
    { ms: 320, w: 47, left: 45, right: 45, neck: 45, r: 14 }
];

function rest(center) {
    return { cx: center, w: 47, left: 45, right: 45, neck: 45, r: 14 };
}

function track(from, to, unit, initial) {
    var direction = to < from ? -1 : 1;
    var distance = to - from;
    var centers = [from, from - 2 * unit * direction,
        from + distance * 11 / 81, from + distance * 38 / 81,
        from + distance * 63 / 81, to + 6 * unit * direction,
        to - 3 * unit * direction, to + unit * direction, to];
    return poses.map(function(pose, index) {
        var shape = index === 0 && initial ? initial : pose;
        // Store physical left/right heights so a direction reversal can start
        // with the exact current outline rather than suddenly mirroring it.
        var mirror = direction < 0 && !(index === 0 && initial);
        return { ms: pose.ms, cx: centers[index], w: shape.w,
            left: mirror ? shape.right : shape.left,
            right: mirror ? shape.left : shape.right,
            neck: shape.neck, r: shape.r };
    });
}

function tangent(points, index, key) {
    if (index === 0 || index === points.length - 1) return 0;
    var hp = points[index].ms - points[index - 1].ms;
    var hn = points[index + 1].ms - points[index].ms;
    var p = (points[index][key] - points[index - 1][key]) / hp;
    var n = (points[index + 1][key] - points[index][key]) / hn;
    if (p * n <= 0) return 0;
    var w1 = 2 * hn + hp;
    var w2 = hn + 2 * hp;
    return (w1 + w2) / (w1 / p + w2 / n);
}

function sample(points, progress) {
    var ms = Math.max(0, Math.min(1, progress)) * duration;
    var index = 0;
    while (index < points.length - 2 && points[index + 1].ms < ms) ++index;
    var a = points[index], b = points[index + 1];
    var h = b.ms - a.ms, t = (ms - a.ms) / h;
    var t2 = t * t, t3 = t2 * t;
    var result = {};
    var keys = ["cx", "w", "left", "right", "neck", "r"];
    for (var k = 0; k < keys.length; ++k) {
        var key = keys[k];
        result[key] = (2 * t3 - 3 * t2 + 1) * a[key]
            + (t3 - 2 * t2 + t) * h * tangent(points, index, key)
            + (-2 * t3 + 3 * t2) * b[key]
            + (t3 - t2) * h * tangent(points, index + 1, key);
    }
    return result;
}

function coefficients(p, a, b, e) {
    return [p, 3 * (a - p), 3 * (p - 2 * a + b), e - p + 3 * (a - b)];
}

function signedArea(segments) {
    // Exact polynomial line integral for cubic Beziers; unlike pixel sampling
    // this needs no large point array or per-frame raster work.
    var sum = 0;
    for (var n = 0; n < segments.length; ++n) {
        var q = segments[n];
        var x = coefficients(q.p[0], q.a[0], q.b[0], q.e[0]);
        var y = coefficients(q.p[1], q.a[1], q.b[1], q.e[1]);
        for (var i = 0; i < 4; ++i) {
            for (var j = 1; j < 4; ++j) {
                sum += (x[i] * j * y[j] - y[i] * j * x[j]) / (i + j);
            }
        }
    }
    return sum / 2;
}

function geometry(pose, baseWidth) {
    var w = pose.w, l = pose.left, r = pose.right, neck = pose.neck;
    var k = 0.55228475, rl = Math.min(pose.r, l / 2), rr = Math.min(pose.r, r / 2);
    var m = w * 0.48, tl = -l / 2, tr = -r / 2, tn = -neck / 2;
    var bl = l / 2, br = r / 2, bn = neck / 2;
    var segments = [], p = [rl, tl], start = [rl, tl];
    function cubic(x1, y1, x2, y2, x, y) {
        segments.push({ p: p, a: [x1, y1], b: [x2, y2], e: [x, y] });
        p = [x, y];
    }
    cubic(rl + (m - rl) * 0.5, tl, m - (m - rl) * 0.4, tn, m, tn);
    cubic(m + (w - rr - m) * 0.4, tn, w - rr - (w - rr - m) * 0.5, tr, w - rr, tr);
    cubic(w - rr + k * rr, tr, w, tr + rr - k * rr, w, tr + rr);
    cubic(w, tr + rr + (r - 2 * rr) / 3, w, br - rr - (r - 2 * rr) / 3, w, br - rr);
    cubic(w, br - rr + k * rr, w - rr + k * rr, br, w - rr, br);
    cubic(w - rr - (w - rr - m) * 0.5, br, m + (w - rr - m) * 0.4, bn, m, bn);
    cubic(m - (m - rl) * 0.4, bn, rl + (m - rl) * 0.5, bl, rl, bl);
    cubic(rl - k * rl, bl, 0, bl - rl + k * rl, 0, bl - rl);
    cubic(0, bl - rl - (l - 2 * rl) / 3, 0, tl + rl + (l - 2 * rl) / 3, 0, tl + rl);
    cubic(0, tl + rl - k * rl, rl - k * rl, tl, rl, tl);

    var unit = Math.max(0.01, baseWidth) / 47;
    var mass = 47 * 45 - (4 - Math.PI) * 14 * 14;
    var area = Math.abs(signedArea(segments));
    var sy = mass / area;
    var height = Math.max(l, r, neck) * sy * unit;
    function point(v) { return (v[0] * unit).toFixed(4) + " " + ((v[1] * sy * unit) + height / 2).toFixed(4); }
    var commands = ["M " + point(start)];
    for (var n = 0; n < segments.length; ++n) {
        var q = segments[n];
        commands.push("C " + point(q.a) + " " + point(q.b) + " " + point(q.e));
    }
    commands.push("Z");
    return { path: commands.join(" "), width: w * unit, height: height,
        area: area * sy * unit * unit };
}
