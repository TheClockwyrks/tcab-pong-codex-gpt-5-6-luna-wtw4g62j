# Carom

Carom is a browser-based top-down paddle duel. Rally the ball across a dark
field, bend shots with paddle spin, and use the two moving obstacles for bank
shots. Solo pits you against the reactive AI; Versus is local two-player.

## Install and run

```sh
npm ci
npm run dev
```

Open the Vite URL shown in the terminal. Build the static site with
`npm run build`; the result is emitted to `dist/`.

## Controls

- Player one: `W` / `S`
- Player two: `ArrowUp` / `ArrowDown`
- Menus: arrow keys or `W`/`S`, then `Enter` or `Space`
- Pause/resume: `P` or `Escape`
- Mute: `M`

Move a paddle as the ball arrives to add spin. First to 11 points, with a
two-point lead, wins.
