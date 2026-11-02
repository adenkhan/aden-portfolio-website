# Design canvas

Open `index.html` in a browser (it loads Google Fonts, so it needs a connection). It shows three visual directions, each as a desktop (1100px) and mobile (390px) frame with real copy: nav and buttons, the Home hero with a placeholder avatar, one mission card, and the About manga panels.

- Drag to pan. Ctrl + wheel or pinch to zoom. Click a frame name to copy it. Fit all and Reset are at the bottom left.
- A. Neon cyber HUD. B. Ink and halftone manga. C. Clean futuristic, anime accents.
- Scores and the chosen direction are in `docs/DECISIONS.md`. `DESIGN.md` at the repo root is the source of truth; the canvas is an exploration and may differ from it (for example, the HUD tag above the H1).
- Limits: this is a static page, not a React route. Layout is not saved between loads, and there is no theme switcher because all directions are dark.
