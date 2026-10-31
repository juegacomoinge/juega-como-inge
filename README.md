# OBRA · Expedientes Ocultos — v0.4

Videojuego web educativo de investigación forense de anomalías en obras civiles.
*Cada estructura cuenta una historia. Descubre qué salió mal.*

## Cómo ejecutarlo

La aplicación usa módulos ES y carga JSON, por lo que necesita un servidor local (no funciona abriendo `index.html` con doble clic).

```bash
node server.js
```

Luego abra **http://localhost:8080**. En Windows también puede ejecutar `iniciar.bat`.

Alternativa con Python: `py -m http.server 8080`.

> La escena 3D carga Three.js 0.160 desde jsDelivr. Sin conexión a internet, el juego cambia automáticamente a la **vista 2D** interactiva (toda la jugabilidad se conserva).

## Estructura

```
index.html            Punto de entrada (import map de Three.js)
server.js / iniciar.bat  Servidor estático de desarrollo, sin dependencias
css/
  main.css            Tokens de diseño, tipografía, botones, utilidades
  interface.css       Menú, centro de operaciones, archivo, modales, notificaciones
  game.css            Expediente: escenario, evidencias, tablero, informe, evaluación
  theme.css           Temas día/noche y acabado «terminal de campo» con texturas reales
  modes.css           Visor de modelos, galería y modo historia
js/
  app.js              Registro de rutas e inicio
  navigation.js       Enrutador SPA por hash (#/ruta) — conserva la pantalla al recargar
  storage.js          Estado del jugador + LocalStorage (guardado automático), niveles
  data.js             Carga de expedientes JSON, desbloqueos, objetivos
  ui.js               Nodos, iconos SVG, modales, notificaciones, sonido (Web Audio)
  layout.js           Barra superior y pestañas del expediente; registro de evidencias
  screens.js          Menú, cómo jugar, centro de operaciones, archivo, presentación
  investigation.js    Escenario: herramientas, puntos de interés, ventana de inspección
  evidence.js         Archivo de evidencias (documentos, revisión)
  evidenceViewer.js   Visor reutilizable, consulta rápida e inventario (tecla I)
  verification.js     Verificación normativa NSR-10
  hypotheses.js       Tablero de hipótesis (estados, relaciones, argumentos, notas)
  report.js           Informe guiado y pantalla de evaluación
  scoring.js          Motor de evaluación (funciones puras)
  illustrations.js    Ilustraciones SVG generadas por código
  viewer.js           Galería y visor de modelos 3D (acceso libre)
  story.js            Modo historia «72 horas»
scenes/
  kit.js              Texturas fotográficas, panoramas, escena base, rayos X
  case001.js / case004.js / case005.js   Escenas 3D de los expedientes jugables
  case002.js / case003.js   Modelos preliminares (expedientes en desarrollo)
  story.js            Refugio modular que se construye por etapas
  fallback2d.js       Vista 2D equivalente
data/
  cases.json          Registro de expedientes, requisitos de desbloqueo, especialidades
  case001.json / case004.json / case005.json   Contenido de los expedientes
  story.json          Guion, fichas técnicas y decisiones del modo historia
assets/textures/      Texturas y panoramas CC0 (Poly Haven) · ver assets/CREDITOS.md
```

## Verificación normativa (NSR-10)

La pestaña **Normativa** presenta 11 requisitos del Reglamento NSR-10 vinculados a las evidencias (C.5.6.2.4, C.5.6.3.3, C.5.11.1, C.6.2.1, C.6.2.2.1, C.6.2.2.2, C.7.7.1, C.7.10.5, C.10.6.4 y C.20). Para cada uno, el jugador compara los datos de la evidencia con el requisito y dictamina *Cumple*, *No cumple* o *Requiere verificación adicional*. Las citas indican numeral y folio del texto oficial, consultados en la base indexada del Reglamento. La retroalimentación se muestra en la evaluación final.

## Acceso rápido a evidencias

- **Inventario** (botón en la barra del expediente o tecla **I**): búsqueda y consulta de cualquier evidencia en ventana flotante, sin salir de la sección actual.
- **Ver evidencia** desde: la ventana de inspección (*Registrar y ver*), la notificación de registro, las fichas del tablero de hipótesis, las referencias de los argumentos, los chips de relación, el paso de evidencias del informe y cada verificación normativa.

## EXP-005 · La parrilla pisada (disponible desde el inicio)

El balcón en voladizo del apartamento 402 de un edificio recién entregado se descolgó (flecha de 38 mm y fisura superior en el empotramiento), mientras los balcones idénticos de los otros pisos están bien. La investigación revela un mal procedimiento constructivo del maestro de obra: fundir sin silletas, «levantar la malla con el gancho» y dejar que obreros y carretillas pisaran la parrilla superior, lo que bajó el acero de 40 a 85 mm de profundidad. Se suma el retiro de puntales a los 7 días y una lista de chequeo de la supervisión sin firmar.

- Herramientas nuevas: **nivel láser** (flecha) y **pachómetro** (posición del acero).
- Evidencias con entrevista al maestro, fotos del chat de obra y un balcón «gemelo» de control (502).
- Verificaciones NSR-10: C.7.5.1 y CR7.5.1, C.7.5.2.1, Tabla C.9.5(a), C.7.7.1, C.5.6.3.3, Tabla B.4.2.1-1, C.6.2.2.1, C.1.3.2 y Tabla I.4.3-2, Capítulo C.20.
- Lección: la decisión fue del maestro, pero el error pasó por un sistema de control que no funcionó.

## EXP-004 · Cuenta regresiva (misión en tiempo real)

Evaluación postsísmica de una torre de 8 pisos + 2 sótanos ocupada. Se desbloquea al resolver EXP-001 con 60 puntos o más.

- **Índice de estabilidad** que decae mientras haya amenazas críticas sin controlar (columna corta B-3, punzonamiento en C-3, tanque elevado). Réplicas programadas causan daño adicional, menor cuantas más amenazas estén controladas.
- **Medidas de emergencia** (tecla **M**): 2 cuadrillas + brigada de evacuación; cada orden tarda un tiempo real. Hay medidas inadecuadas que penalizan o hacen perder tiempo.
- Al controlar todas las amenazas el reloj se detiene; si la estabilidad llega a 0 hay **colapso parcial** y la misión falla (máx. 25 puntos, no cuenta como resuelta).
- Pausa con **P** (oculta la información). El reloj solo corre con el expediente abierto y la pestaña visible.
- Motor reutilizable: `js/crisis.js` + bloque `crisis` del JSON del expediente. Citas NSR-10: A.6.5, A.8.1.1, A.8.2, A.10.1.3.4, A.10.10.1.2, A.10.10.1.3, C.11.11.1.

## Modo historia · 72 HORAS

Desde el menú o el Centro de operaciones. Tras un sismo, hay que levantar en 72 horas un refugio de emergencia en estructura metálica para 300 personas en un municipio andino. Seis capítulos y un final:

1. **La llamada**: clasificación como Grupo IV, I = 1,50 (A.2.5.1.1 c, Tabla A.2.5-1) y supervisión obligatoria (I.1.2.3).
2. **El terreno**: escogencia del lote y exploración por categoría de la unidad (Tabla H.3.1-1, H.3.2.3).
3. **Cimientos contra el reloj**: curado frente a resistencia en la etapa de carga y curado acelerado (C.5.11.1, C.5.11.3).
4. **Acero en pie**: secuencia de montaje con arriostramiento temporal (F.2.13.4.2) y pernos pretensionados verificables (F.2.14.5.6).
5. **Cubierta antes de la tormenta**: granizo sobre 2 000 m s. n. m. y viento (B.4.8.3.1, B.6.1.1).
6. **Puertas abiertas**: número de salidas por ocupación (Tabla K.3.4-1) y recibo con la supervisión técnica.

Cada capítulo tiene diálogo, una ficha técnica con el proceso constructivo, citas con folio y una «clave de velocidad», y luego las decisiones. Cada decisión consume horas. Las malas dejan riesgos ocultos que se ven en la **noche de prueba**, una granizada con réplica en la que el modelo 3D muestra los daños. La puntuación va de 0 a 100, con estrellas y XP.

## Visor de modelos 3D

`#/modelos`: acceso libre a los seis modelos (EXP-001, EXP-005, EXP-004, EXP-002 y EXP-003 preliminares, y el refugio de la historia), sin importar desbloqueos. Tiene rotación automática, **rayos X**, puntos de inspección opcionales en los expedientes jugables, control de etapas de obra en el refugio y captura PNG. Es de solo lectura y no altera el progreso.

## Tema día / noche y estilo «terminal de campo»

Interruptor **Día / Noche** en la barra superior y en el menú, que también cambia el panorama fotográfico y la luz de las escenas 3D. La interfaz usa fotografías reales de materiales de obra: fondo de concreto, barra de chapa diamantada con borde de peligro, placas de acero pintado con remaches, tablero de hipótesis en OSB. Sobre ellas hay una capa de instrumentación: lecturas en fósforo ámbar, corchetes HUD en las escenas, indicadores con cinta rotuladora en relieve y cinta de enmascarar en las carpetas. Las escenas 3D usan las mismas texturas y panoramas como fondo e iluminación.

## Evaluación

| Criterio | Peso | Qué mide |
|---|---|---|
| Identificación y verificación normativa | 15 % | Anomalías marcadas, elementos anómalos inspeccionados y dictámenes NSR-10 (45 %) |
| Recolección de evidencias | 20 % | Evidencias clave recolectadas, revisadas y citadas (penaliza distractores) |
| Análisis de hipótesis | 25 % | Estado de cada hipótesis, relaciones evidencia–hipótesis, observaciones escritas |
| Diagnóstico técnico | 25 % | Hipótesis principal, fundamentación, clasificación de conceptos, causas, consecuencias, nivel de certeza |
| Propuesta de solución | 15 % | Medidas correctivas e inmediatas + medidas preventivas |

Resolver EXP-001 con 60 puntos o más autoriza EXP-002 (marcado como contenido de la v0.2).

## Añadir un expediente

1. Crear `data/caseXXX.json` con la misma estructura que `case001.json` (hotspots, evidences, hypotheses, report, scoring, reveal).
2. Registrarlo en `data/cases.json` (`data`, `requires`, `inDevelopment: false`).
3. Crear `scenes/caseXXX.js` exportando `mountScene({ container, hotspots, isFound, onSelect })` con la API `{ focus, resetView, setTool, refresh, dispose }`, y ajustar la importación en `js/investigation.js` (actualmente fija a `case001`).

## Ampliaciones previstas para la escena 3D

- Sustituir la geometría procedural por modelos glTF (`assets/models/`) y texturas PBR (`assets/textures/`).
- Herramientas adicionales: martillo de percusión, esclerómetro, pachómetro.
- Recorrido en primera persona y medición directa sobre la geometría.

## Aviso técnico

Caso ficticio con fines educativos. Todos los registros, mediciones y resultados de ensayo son **datos simulados**. Las referencias al Reglamento NSR-10 (Título C: C.5.6 evaluación y aceptación del concreto, C.5.11 curado, C.6.2 remoción de encofrados y puntales) y a las normas NTC 396, NTC 673 y ASTM C42 son orientativas; consulte siempre el texto oficial vigente.
