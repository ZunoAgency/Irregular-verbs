# Verbos irregulares

App web para aprender los 74 verbos irregulares de la hoja de clase (infinitivo, past simple y significado) con sesiones cortas y repetición espaciada. Pensada para móvil y tablet; se puede instalar en la pantalla de inicio y funciona sin conexión.

El past participle no se estudia de momento.

## Cómo funciona

- **Sesión del día** (unos 10 minutos): primero los repasos pendientes y después 4 verbos nuevos, empezando por los de la semana en la que va la clase.
- **Cajas de Leitner**: cada verbo está en una caja del 1 al 5. Si aciertas, sube una caja y tarda más en volver (1, 3, 7 y 21 días). Si fallas, vuelve a la caja 1 y se repite unas preguntas después, en la misma sesión.
- **Dificultad progresiva**: un verbo nuevo se presenta (con audio, familia y frase de ejemplo), luego se reconoce entre 4 opciones y, desde la caja 2, hay que escribirlo.
- **Opciones falsas creíbles**: la forma regular inventada (*bringed*), el pasado de un verbo parecido (*bought* para *bring*) y las faltas típicas (*tought*, *brougth*).
- **Corrección útil**: dice qué tipo de error es (le has puesto -ed, has escrito el infinitivo, es el pasado de otro verbo, es casi correcto) y marca las letras que fallan.
- Solo se aceptan las formas de la hoja. En *burn* y *learn* vale cualquiera de las dos; en *to be* hay que escribir *was/were*. Si se escribe *dreamed* o *spelled*, se avisa de que también existen, pero que la de la hoja es *dreamt* / *spelt*.

El progreso se guarda en el navegador del dispositivo (localStorage).

## Desarrollo

Requisitos: Node 22.

```bash
npm ci          # instalar dependencias
npm run dev     # servidor de desarrollo
npm test        # tests (Vitest)
npm run build   # compilación de producción en dist/
```

Estructura:

```
src/
  data/verbs.ts          los 74 verbos: semana, past, significado, familia, frase
  engine/srs.ts          cajas de Leitner
  engine/session.ts      planificador de la sesión del día
  engine/answers.ts      corrección de respuestas
  engine/distractors.ts  opciones falsas para la elección múltiple
  components/            tarjetas y preguntas
  screens/               bienvenida, inicio, sesión y ajustes
  storage/progress.ts    guardado del progreso
```

> Si `npm install` falla con `Cannot read properties of null (reading 'edgesOut')`, es un fallo de npm 10 al resolver dependencias: usa `npm ci` (con el lockfile) o `npx npm@11 install`.

## Publicación

GitHub Actions pasa los tests, compila y publica en GitHub Pages cada vez que se sube algo a la rama principal del repositorio. La primera vez hay que activar Pages en **Settings → Pages → Build and deployment → Source: GitHub Actions**.

La app queda en `https://<usuario>.github.io/Irregular-verbs/`. Si el repositorio cambia de nombre, hay que actualizar `BASE` en `vite.config.ts`.

## Próximas fases

1. ~~Base: datos, proyecto y publicación.~~
2. ~~Primera versión: sesión diaria, cajas, presentación, elección múltiple y escribir.~~
3. Más modos: desde el español, frase con hueco, tabla tipo examen y familias.
4. Progreso: verbos difíciles, racha y copia de seguridad.
5. Extras: juego de parejas, sincronizar dispositivos, past participle.
