import QtQuick
import QtQuick.Shapes
import "JellyMotion.js" as Motion

// Standalone scene-graph shape: no Canvas texture uploads, idle timers, or
// workspace dispatch. The host supplies its theme, geometry and motion policy.
Item {
    id: root

    property real targetPosition: -1
    property real baseWidth: 14
    property bool horizontal: true
    property bool motionEnabled: true
    property int durationMs: 320
    property color color: "white"

    property bool initialized: false
    property real origin: -1
    property real destination: -1
    property real progress: 1
    property var points: []
    readonly property bool running: animation.running
    readonly property var pose: animation.running && points.length > 0
        ? Motion.sample(points, progress) : Motion.rest(destination)
    readonly property real center: pose.cx
    readonly property var outline: Motion.geometry(pose, baseWidth)

    function snap(position) {
        animation.stop()
        origin = position
        destination = position
        progress = 1
        initialized = isFinite(position) && position >= 0
    }

    function moveTo(position) {
        if (!isFinite(position) || position < 0) {
            snap(-1)
            return
        }
        if (!initialized || !motionEnabled || durationMs <= 0 || !visible) {
            snap(position)
            return
        }
        if (Math.abs(position - destination) < 0.01) return
        // Snapshot BEFORE stopping: reversal keeps the current physical shape
        // and position, even when the preceding animation is only half done.
        var currentPose = pose
        var currentCenter = center
        animation.stop()
        origin = currentCenter
        destination = position
        points = Motion.track(origin, destination, baseWidth / 47, currentPose)
        progress = 0
        animation.start()
    }

    onTargetPositionChanged: moveTo(targetPosition)
    onMotionEnabledChanged: if (!motionEnabled) snap(targetPosition)
    onDurationMsChanged: if (durationMs <= 0) snap(targetPosition)
    onHorizontalChanged: snap(targetPosition)
    onBaseWidthChanged: snap(targetPosition)
    onVisibleChanged: if (!visible) snap(targetPosition)
    Component.onCompleted: snap(targetPosition)

    NumberAnimation {
        id: animation
        target: root
        property: "progress"
        from: 0
        to: 1
        duration: Math.max(0, root.durationMs)
        // The progress clock is linear; easing is in the C1-continuous,
        // shape-preserving Hermite track, not an additional bounce curve.
        easing.type: Easing.Linear
    }

    Shape {
        visible: root.initialized
        width: root.outline.width
        height: root.outline.height
        x: (root.horizontal ? root.center : root.width / 2) - width / 2
        y: (root.horizontal ? root.height / 2 : root.center) - height / 2
        rotation: root.horizontal ? 0 : 90
        preferredRendererType: Shape.CurveRenderer

        ShapePath {
            strokeWidth: 0
            strokeColor: "transparent"
            fillColor: root.color
            PathSvg { path: root.outline.path }
        }
    }
}
