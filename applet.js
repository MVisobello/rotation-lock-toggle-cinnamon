const Applet = imports.ui.applet;
const Gio = imports.gi.Gio;
const Util = imports.misc.util;
const Mainloop = imports.mainloop;
const Gettext = imports.gettext;
const GLib = imports.gi.GLib;

/* === Identità applet === */
const UUID = "rotation-lock-toggle@MVisobello";
const _ = Gettext.domain(UUID).gettext;

/* === Percorsi === */
const HOME = GLib.get_home_dir();
const SCRIPT_PATH = HOME + "/.local/bin/rotation-lock-toggle";
const STATE_DIR  = HOME + "/.config/rotation-lock-toggle";
const STATE_FILE = STATE_DIR + "/state";

class RotationLockToggle extends Applet.IconApplet {

    constructor(orientation, panel_height, instance_id) {
        super(orientation, panel_height, instance_id);

        // assicura directory stato
        this.ensureStateDir();

        // ripristino ritardato (fix race condition al boot)
        Mainloop.timeout_add_seconds(5, () => {
            this.restoreState();
            this.refresh();
            return false;
        });
    }

    /* === Utility === */

    ensureStateDir() {
        Util.spawnCommandLine(`/bin/mkdir -p "${STATE_DIR}"`);
    }

    isServiceActive() {
        try {
            let proc = Gio.Subprocess.new(
                ["/bin/systemctl", "is-active", "iio-sensor-proxy"],
                Gio.SubprocessFlags.STDOUT_PIPE
            );
            let [, stdout] = proc.communicate_utf8(null, null);
            return stdout.trim() === "active";
        } catch (e) {
            return false;
        }
    }

    /* === Stato persistente === */

    saveState(locked) {
        let value = locked ? "locked" : "unlocked";
        Util.spawnCommandLine(
            `/bin/bash -c "echo ${value} > '${STATE_FILE}'"`
        );
    }

    restoreState() {
        try {
            let proc = Gio.Subprocess.new(
                ["/bin/cat", STATE_FILE],
                Gio.SubprocessFlags.STDOUT_PIPE
            );
            let [, stdout] = proc.communicate_utf8(null, null);
            let state = stdout.trim();

            if (state === "locked" && this.isServiceActive()) {
                Util.spawnCommandLine(`/bin/bash -c "${SCRIPT_PATH}"`);
            }

            if (state === "unlocked" && !this.isServiceActive()) {
                Util.spawnCommandLine(`/bin/bash -c "${SCRIPT_PATH}"`);
            }
        } catch (e) {
            // primo avvio: nessun file di stato
        }
    }

    /* === UI === */

    refresh() {
        if (this.isServiceActive()) {
            this.set_applet_icon_symbolic_name("object-unlocked-symbolic");
            this.set_applet_tooltip(_("Auto rotation enabled"));
        } else {
            this.set_applet_icon_symbolic_name("object-locked-symbolic");
            this.set_applet_tooltip(_("Rotation locked"));
        }
    }

    /* === Click === */

    on_applet_clicked() {
        Util.spawnCommandLine(`/bin/bash -c "${SCRIPT_PATH}"`);

        Mainloop.timeout_add(300, () => {
            let locked = !this.isServiceActive();
            this.saveState(locked);
            this.refresh();
            return false;
        });
    }
}

/* === Entry point === */
function main(metadata, orientation, panel_height, instance_id) {
    return new RotationLockToggle(orientation, panel_height, instance_id);
}
