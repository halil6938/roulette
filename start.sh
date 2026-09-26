#!/usr/bin/env bash
# Lance la roulette en plein écran (mode kiosque) sur le Raspberry Pi.
# Au démarrage, récupère d'abord la dernière version depuis GitHub si Internet est disponible.

main() {
  DIR="$(cd "$(dirname "$(readlink -f "$0")")" && pwd)"
  cd "$DIR" || exit 1
  LOG="$DIR/update.log"

  # Mise à jour automatique (quelques essais, le temps que le réseau démarre)
  for _ in 1 2 3 4 5; do
    if timeout 5 git ls-remote origin >/dev/null 2>&1; then
      echo "=== $(date) ===" >>"$LOG"
      timeout 60 git pull --ff-only >>"$LOG" 2>&1 || echo "Mise à jour impossible" >>"$LOG"
      break
    fi
    sleep 2
  done

  BROWSER="$(command -v chromium-browser || command -v chromium)"
  if [ -z "$BROWSER" ]; then
    echo "Chromium introuvable : lancez ./install.sh" >&2
    exit 1
  fi

  exec "$BROWSER" \
    --kiosk \
    --noerrdialogs \
    --disable-infobars \
    --disable-session-crashed-bubble \
    --no-first-run \
    --password-store=basic \
    --user-data-dir="$HOME/.config/roulette-chromium" \
    --autoplay-policy=no-user-gesture-required \
    --overscroll-history-navigation=0 \
    --disable-pinch \
    --check-for-update-interval=31536000 \
    --ozone-platform-hint=auto \
    "file://$DIR/index.html?kiosk=1"
}

# Tout est dans une fonction : bash lit le script en entier avant de l'exécuter,
# donc le "git pull" peut modifier ce fichier sans casser le lancement en cours.
main "$@"
exit
