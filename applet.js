const Applet = imports.ui.applet;
const Gio = imports.gi.Gio;
const Util = imports.misc.util;
const Mainloop = imports.mainloop;

const SCRIPT_PATH = "/home/mauri/.local/bin/rotation-lock-toggle";

class RotationLockToggle extends Applet.IconApplet {

    constructor(orientation, panel_height, instance_id) {
        super(orientation, panel_height, instance_id);
        this.refresh();
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

    refresh() {
        if (this.isServiceActive()) {
            this.set_applet_icon_symbolic_name("object-unlocked-symbolic");
            this.set_applet_tooltip("Auto rotation enabled");
        } else {
            this.set_applet_icon_symbolic_name("object-locked-symbolic");
            this.set_applet_tooltip("Rotation locked");
        }
    }

    on_applet_clicked() {
        Util.spawnCommandLine(
            `/bin/bash -c "${SCRIPT_PATH}"`
        );

        Mainloop.timeout_add(400, () => {
            this.refresh();
            return false;
        });
    }
}

function main(metadata, orientation, panel_height, instance_id) {
    return new RotationLockToggle(orientation, panel_height, instance_id);
}
