import QtQuick
import QtTest
import ".." as WorkspacePlugin

TestCase {
    name: "JellyIndicator"
    width: 260
    height: 60
    visible: true
    when: windowShown

    WorkspacePlugin.JellyIndicator {
        id: indicator
        width: 240
        height: 32
        targetPosition: 30
        baseWidth: 14
        color: "#FEDBA0"
    }

    function init() {
        indicator.visible = true
        indicator.motionEnabled = false
        indicator.horizontal = true
        indicator.targetPosition = 30
        indicator.durationMs = 320
        indicator.snap(30)
        indicator.motionEnabled = true
        verify(indicator.visible)
    }

    function test_initial_and_settled() {
        compare(indicator.running, false)
        compare(indicator.center, 30)
        indicator.targetPosition = 51
        tryCompare(indicator, "running", true)
        tryCompare(indicator, "running", false, 700)
        fuzzyCompare(indicator.center, 51, 0.01)
        fuzzyCompare(indicator.outline.width, 14, 0.01)
    }

    function test_rapid_reversal_keeps_position_and_shape() {
        indicator.targetPosition = 93
        wait(90)
        verify(indicator.running)
        var center = indicator.center
        var width = indicator.outline.width
        var height = indicator.outline.height
        indicator.targetPosition = 30
        fuzzyCompare(indicator.center, center, 0.01)
        fuzzyCompare(indicator.outline.width, width, 0.01)
        fuzzyCompare(indicator.outline.height, height, 0.01)
        tryCompare(indicator, "running", false, 700)
        fuzzyCompare(indicator.center, 30, 0.01)
    }

    function test_reduced_motion_snaps_and_stops() {
        indicator.targetPosition = 51
        wait(60)
        indicator.motionEnabled = false
        compare(indicator.running, false)
        compare(indicator.center, 51)
        indicator.targetPosition = 72
        compare(indicator.running, false)
        compare(indicator.center, 72)
    }

    function test_hidden_and_vertical() {
        indicator.targetPosition = 72
        wait(40)
        indicator.visible = false
        compare(indicator.running, false)
        compare(indicator.center, 72)
        indicator.targetPosition = 93
        compare(indicator.running, false)
        compare(indicator.center, 93)
        indicator.visible = true
        indicator.horizontal = false
        indicator.targetPosition = 30
        tryCompare(indicator, "running", false, 700)
        compare(indicator.center, 30)
    }

    function test_missing_workspace_is_hidden_without_animation() {
        indicator.targetPosition = -1
        compare(indicator.running, false)
        compare(indicator.initialized, false)
        indicator.targetPosition = 51
        compare(indicator.running, false)
        compare(indicator.center, 51)
    }
}
