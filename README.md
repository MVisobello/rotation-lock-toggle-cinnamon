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
