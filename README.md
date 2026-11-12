# Jelly Workspaces for Omarchy

![Omarchy logo and workspace switcher with a soft jelly transition from workspace 1 to 2](docs/jelly-preview.gif)

A small, theme-aware workspace widget with a stretchy, volume-preserving jelly
indicator. Switch workspaces normally; the marker does the rest.

## Install in three steps

**Requires Omarchy's Quickshell bar, not Waybar.** Tested on Omarchy 4.5.0 with
the current Lua-based workspace controls. Older shells and other distributions
are not supported. No ThinkBook-specific hardware is required.

Plugins run as unsandboxed code inside your desktop shell. Review this small
repository before installing; `--yes` accepts Omarchy's trust confirmation.

### 1. Add the plugin

Run this from a terminal in your unlocked Omarchy desktop:

```bash
omarchy plugin add https://github.com/nurfaizfoat/omarchy-jelly-workspaces.git --yes
```

### 2. Enable it

```bash
omarchy plugin enable nurfaizfoat.workspaces
```

This replaces the stock workspace widget **in its existing bar position**. Your
Omarchy logo, other widgets, theme, bar background and window layouts stay as
they are. Keep the literal plugin ID above; do not replace it with your username.

### 3. Reload and try it

```bash
omarchy restart shell
```

This briefly restarts the bar/shell, **not your applications**. Press
**Super + 1**, then **Super + 2**, or click workspace numbers. Super is usually
the Windows key. Switch through 1–5 and back to see the motion in both directions.

## What you get

- Nine motion poses: anticipation, stretch, soft landing and recoil in 320 ms.
- Smooth direction changes, including a reversal before the previous move ends.
- Colors and size from your existing Omarchy theme and bar.
- Horizontal and vertical bars, per-monitor numbering and visiting workspaces.
- Normal click/wheel navigation and click-the-active-marker layout cycling.
- A solid marker on glassy, opaque and transparent bars. Hover for the layout name.
- Reduced-motion support through Omarchy's animations setting; no idle frame timer.

**About the preview:** the GIF includes the existing Omarchy logo and a blue bar
background. Those belong to the surrounding bar, not this plugin. Installing
Jelly Workspaces does not force that palette, replace your logo or resize the bar.

## Adjust the animation

```bash
# Duration in milliseconds (160–500; default 320).
omarchy bar set nurfaizfoat.workspaces jellyDuration 320 --json

# Stop only the jelly animation; keep the workspace widget.
omarchy bar set nurfaizfoat.workspaces jellyEnabled false --json

# Optional scrolling/floating symbol inside the settled marker (off by default).
omarchy bar set nurfaizfoat.workspaces showLayoutSymbol true --json
```

Set `jellyEnabled` back to `true` to restore motion. Disabling animations globally
in Omarchy also stops the jelly immediately. Layout symbols are optional so a
scrolling workspace does not look like it has an unexpected dark dot inside it.

## Update

```bash
omarchy plugin update nurfaizfoat.workspaces
omarchy restart shell
```

## Go back to stock

```bash
omarchy plugin enable omarchy.workspaces
omarchy restart shell
```

That is enough to undo the visible change. To also remove the installed files:

```bash
omarchy plugin remove nurfaizfoat.workspaces
```

No files under `/usr/share/omarchy/` are edited. Normal Omarchy updates should
leave the plugin in your user configuration; future shell API changes may still
require a plugin update. After a shell configuration reset, enable it again.

## Troubleshooting

**Nothing moves:** confirm Jelly animation and Omarchy animations are enabled,
then restart the shell. On the tested Quickshell build, rescans sometimes kept
an older QML component cached. A reload message alone did not guarantee fresh code.

**Already installed:** don't run `plugin add` twice. Enable the existing copy.
`plugin update` requires a git-managed installation; if yours was copied manually,
back it up **outside** `~/.config/omarchy/plugins/` before adding this repository.
Restore the stock widget first and do not discard local modifications.

**Another workspace clone is active:** restore `omarchy.workspaces` first, then
enable this plugin. That avoids keeping two workspace widgets on the bar.

Read-only live diagnostic:

```bash
omarchy-shell nurfaizfoat.workspaces.jelly state
```

## Development checks

Node.js is needed only for tests, not to run the widget:

```bash
node --test tests/*.test.mjs
QT_QPA_PLATFORM=offscreen QT_QUICK_BACKEND=software \
  /usr/lib/qt6/bin/qmltestrunner -input tests/tst_indicator.qml
omarchy plugin validate .
```

The Qt test runner comes from Arch's `qt6-declarative` package. The runtime
uses Omarchy's existing Qt/Quickshell components; no extra daemon is installed.

## Credits and license

Based on [Omarchy's workspace widget](https://github.com/omacom/omarchy), with
the jelly motion study and implementation by [nurfaizfoat](https://github.com/nurfaizfoat).
MIT licensed; the upstream copyright notice is retained in [LICENSE](LICENSE).
This is a community plugin, not an official Omarchy release.
