#!/usr/bin/env bash
# Installation sur Raspberry Pi (Raspberry Pi OS avec bureau).
# À lancer une seule fois :  ./install.sh
set -e

DIR="$(cd "$(dirname "$(readlink -f "$0")")" && pwd)"
chmod +x "$DIR/start.sh"

echo "==> Vérification de Chromium"
if ! command -v chromium-browser >/dev/null && ! command -v chromium >/dev/null; then
  sudo apt-get update
  sudo apt-get install -y chromium-browser || sudo apt-get install -y chromium
fi

echo "==> Lancement automatique au démarrage"
mkdir -p "$HOME/.config/autostart"
cat >"$HOME/.config/autostart/roulette.desktop" <<DESKTOP
[Desktop Entry]
Type=Application
Name=Roulette
Exec=$DIR/start.sh
X-GNOME-Autostart-enabled=true
DESKTOP

echo "==> Désactivation de la mise en veille de l'écran"
if command -v raspi-config >/dev/null; then
  sudo raspi-config nonint do_blanking 1 || true
fi

echo
echo "Installation terminée. Redémarrez avec :  sudo reboot"
