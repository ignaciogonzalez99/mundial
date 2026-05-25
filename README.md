# Mundial 2026 Analytics

Webapp en Next.js para analizar selecciones, jugadores, grupos, partidos y
probabilidades estimadas del Mundial FIFA 2026.

## Desarrollo local

```bash
npm install
npm run dev
```

La app local usa archivos JSON en `/data` y API Routes en `/src/app/api` para
leer/escribir resultados, recalcular predicciones y registrar sincronizaciones.

## Verificacion

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## GitHub Pages

El deploy se ejecuta con GitHub Actions desde `.github/workflows/github-pages.yml`.
Pages es hosting estatico, por eso el build publicado queda en modo lectura:
las pantallas analiticas funcionan, pero las acciones que escriben JSON requieren
el servidor local de Next.js.

```bash
npm run build:pages
```

URL esperada despues del primer deploy:

```txt
https://ignaciogonzalez99.github.io/mundial/
```
