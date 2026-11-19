# Verbos irregulares

App web para aprender los 74 verbos irregulares de la hoja de clase (infinitivo, past simple y significado) con sesiones cortas y repetición espaciada. Pensada para móvil y tablet; se puede instalar en la pantalla de inicio y funciona sin conexión.

El past participle no se estudia de momento.

## Cómo funciona

- **Baco, el camaleón**, acompaña al alumno: cambia de color igual que los verbos irregulares cambian de forma (verde normalmente, naranja cuando es "casi", de colores al celebrar).
- **Nombre y edad**: se piden al empezar. Los mensajes usan el nombre y están escritos para que valgan igual para chicos y chicas ("¡Bien hecho, Lucía!").
- **Adaptado a la edad**:
  - hasta 10 años: 3 verbos nuevos por sesión, más preguntas de elegir antes de escribir y pista con la primera letra;
  - de 11 a 13: 4 verbos nuevos y se pasa a escribir tras el primer acierto;
  - 14 o más: se escribe desde el principio.
- **Reto de hoy** (unos 10 minutos): los repasos pendientes y los verbos nuevos del día (3 o 4 según la edad), hasta la semana en la que va la clase.
- **¡Quiero más!**: al terminar el reto, y en el resumen de cada sesión, se puede seguir aprendiendo sin límite. Siguen saliendo verbos nuevos en orden de semanas (primero lo que quede de la semana de clase y luego las siguientes), aunque se vaya por delante de clase. Cuando ya se conocen los 74, se hace un repaso extra de los que más cuestan; ahí acertar no adelanta el próximo repaso, pero fallar sí cuenta.
- **Cajas de Leitner**: cada verbo está en una caja del 1 al 5. Si aciertas, sube una caja y tarda más en volver (1, 3, 7 y 21 días). Si fallas, vuelve a la caja 1 y se repite unas preguntas después, en la misma sesión.
- **Estrellas y racha**: una estrella por cada acierto a la primera, de 1 a 3 estrellas al terminar cada sesión según los aciertos, y racha de días seguidos estudiando.
- **Tu camino**: las 11 semanas en un camino, que se va abriendo también por las semanas que se empiezan por adelantado. Una semana se completa cuando todos sus verbos se han acertado al menos una vez (★), y gana ★★ y ★★★ a medida que se afianzan.
- **Opciones falsas creíbles**: la forma regular inventada (*bringed*), el pasado de un verbo parecido (*bought* para *bring*) y las faltas típicas (*tought*, *brougth*).
- **Corrección útil**: dice qué tipo de error es y marca en fichas las letras que fallan.
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
  engine/profile.ts      ajustes según la edad
  engine/stats.ts        racha, estrellas y progreso de cada semana
  engine/answers.ts      corrección de respuestas
  engine/distractors.ts  opciones falsas para la elección múltiple
  components/            Baco, tarjetas, preguntas y camino de semanas
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
3. ~~Diseño para peques: Baco, nombre y edad, estrellas, racha y camino de semanas.~~
4. Más modos: desde el español, frase con hueco, tabla tipo examen y familias.
5. Progreso: verbos difíciles y copia de seguridad.
6. Extras: juego de parejas, sincronizar dispositivos, past participle.
