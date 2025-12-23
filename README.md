# Rotation Lock Toggle (Cinnamon Applet)

A Cinnamon applet that toggles automatic screen rotation on and off.

## Why this applet exists
Cinnamon does not honor the GNOME `orientation-lock` setting.
This applet reliably enables or disables automatic screen rotation by
controlling the `iio-sensor-proxy` system service.

## How it works
- The applet runs a user script on click
- The script starts/stops `iio-sensor-proxy`
- A minimal sudoers rule is required (no password prompt)

## Persistent rotation lock (important)

Due to how systemd and udev manage hardware sensors, stopping
`iio-sensor-proxy` at runtime is not sufficient to guarantee persistence
across reboots.

When rotation is locked, this applet masks the `iio-sensor-proxy` system
service, preventing it from being automatically restarted at boot.

Unlocking rotation will unmask and restart the service.

This behavior is required to ensure reliable persistence on convertible
devices.


## Requirements
- Cinnamon desktop
- iio-sensor-proxy
- Device with orientation sensor

## Security note
This applet requires a minimal sudoers rule allowing the user to run:

- `systemctl start iio-sensor-proxy`
- `systemctl stop iio-sensor-proxy`

No other privileges are granted.

## Author
Maurizio Visobello
