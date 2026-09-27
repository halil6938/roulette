# 🎡 Roulette des cadeaux

Roue de la fortune tactile pour Raspberry Pi 4 : on touche la roue, elle tourne ~5 secondes,
s'arrête sous le triangle, puis confettis + fanfare + « Vous avez gagné 1 télé !! ».

Fonctionne **hors ligne**, sans aucune installation en dehors de Chromium.

## Modifier les cadeaux

Tout se règle dans **`config.js`** : textes, couleurs, messages, chances (`poids`), durée, sons.
Après modification : `git push`, et le Raspberry récupère la nouvelle version à son prochain redémarrage.

## Tester sur un ordinateur

Double-cliquer sur `index.html` (ou l'ouvrir dans Chrome/Firefox). Espace ou Entrée lancent aussi la roue.

## Installation sur le Raspberry Pi 4

Prérequis : Raspberry Pi OS **avec bureau**, écran tactile branché.

```bash
cd ~
git clone https://github.com/halil6938/roulette.git
cd roulette
./install.sh
sudo reboot
```

Au démarrage, la roue s'ouvre automatiquement en plein écran (mode kiosque).

`install.sh` :
- installe Chromium s'il est absent ;
- ajoute le lancement automatique (`~/.config/autostart/roulette.desktop`) ;
- ajoute **Jeux → Roulette** dans le menu, pour relancer après avoir quitté ;
- désactive la mise en veille de l'écran.

### Mise à jour automatique

À chaque démarrage, `start.sh` fait un `git pull` si Internet est disponible
(journal dans `update.log`). Sans Internet, la dernière version téléchargée est utilisée.

Mise à jour manuelle à distance (SSH) :

```bash
cd ~/roulette && git pull && sudo reboot
```

> Dépôt **privé** ? Le Raspberry a besoin d'un accès : cloner avec un jeton GitHub
> (`git clone https://<jeton>@github.com/halil6938/roulette.git`) ou une clé SSH.

### Quitter / relancer

- **Quitter** : toucher la petite **croix ✕ en haut à droite**, puis **OUI, QUITTER**
  (ou touche `Échap` avec un clavier). On revient au bureau du Raspberry.
- **Relancer** sans redémarrer : menu Raspberry → **Jeux → Roulette**.
- En SSH : `pkill chromium` pour quitter.
Pour désactiver le lancement automatique : `rm ~/.config/autostart/roulette.desktop`.

## Fichiers

| Fichier      | Rôle                                      |
|--------------|-------------------------------------------|
| `config.js`  | **Cadeaux et réglages** (à modifier)       |
| `index.html` | Page de la roue                           |
| `style.css`  | Design                                    |
| `app.js`     | Rotation, sons, confettis                 |
| `start.sh`   | Mise à jour + lancement plein écran       |
| `install.sh` | Installation sur le Raspberry (une fois)  |
