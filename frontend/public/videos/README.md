Landing Video-Hintergrund

Ablagepfade:
- WebM: frontend/public/videos/landing-animation.webm
- MP4:  frontend/public/videos/landing-animation.mp4
- Poster: frontend/public/images/landing-animation-poster.jpg

Empfohlene Konvertierung (ffmpeg):

WebM (klein, modern):
```
ffmpeg -i input.gif -vf "fps=24,scale=1280:-1:flags=lanczos" -c:v libvpx-vp9 -b:v 0 -crf 32 -row-mt 1 frontend/public/videos/landing-animation.webm
```

MP4 (Fallback für iOS/Safari):
```
ffmpeg -i input.gif -vf "fps=24,scale=1280:-1:flags=lanczos" -c:v libx264 -pix_fmt yuv420p -movflags +faststart -crf 23 -preset veryfast frontend/public/videos/landing-animation.mp4
```

Tipps:
- Falls Datei noch groß: `-crf` erhöhen (WebM: 34–38, MP4: 24–28)
- Nur sichtbare Länge verwenden (optional schneiden): `-t 12`
- Poster aus Frame generieren:
```
ffmpeg -i frontend/public/videos/landing-animation.mp4 -ss 00:00:01.000 -vframes 1 frontend/public/images/landing-animation-poster.jpg
```

Bei Ablage der Dateien unter obigen Pfaden ist keine weitere Code-Änderung nötig.

