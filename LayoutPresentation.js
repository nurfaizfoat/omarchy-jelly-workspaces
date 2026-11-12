// Presentation policy only. Never changes the compositor's workspace layout.
function showSymbol(enabled, shown, moving, mode) {
    return enabled === true && shown === true && !moving
        && (mode === "scrolling" || mode === "floating");
}

function layoutKey(mode) {
    if (mode === "scrolling") return "layout.scrolling";
    if (mode === "floating") return "layout.floating";
    return "layout.tiling";
}

function luminance(color) {
    function linear(channel) {
        return channel <= 0.04045 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
    }
    return 0.2126 * linear(color.r) + 0.7152 * linear(color.g) + 0.0722 * linear(color.b);
}

function contrast(a, b) {
    var l1 = luminance(a), l2 = luminance(b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function symbolInk(marker, themeBackground) {
    // Transparent bars can adapt their foreground to black. A hard-coded
    // theme-background ink would then vanish into the black marker.
    if (contrast(marker, themeBackground) >= 4.5) return themeBackground;
    return luminance(marker) > 0.179 ? "#000000" : "#FFFFFF";
}
