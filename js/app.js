/* =========================================================
   OBRA · app.js
   Punto de entrada: registra rutas e inicia la aplicación.
   Las pantallas del expediente se cargan bajo demanda.
   ========================================================= */

import { route, startRouter } from './navigation.js';
import { store } from './storage.js';
import { setSoundEnabled } from './ui.js';
import { applyTheme, currentTheme } from './theme.js';
import { menuScreen, opsScreen, archiveScreen, briefingScreen } from './screens.js';

setSoundEnabled(store.get().settings.sound);
applyTheme(currentTheme()); // tema día / noche guardado

route(/^\/$/, () => menuScreen());
route(/^\/operaciones$/, () => opsScreen());
route(/^\/archivo$/, () => archiveScreen());
route(/^\/caso\/(\d{3})$/, ([id]) => briefingScreen(id));
route(/^\/caso\/(\d{3})\/escena$/, async ([id]) => (await import('./investigation.js')).sceneScreen(id));
route(/^\/caso\/(\d{3})\/evidencias(?:\/(E\d{2}))?$/, async ([id, ev]) => (await import('./evidence.js')).evidenceScreen(id, ev));
route(/^\/caso\/(\d{3})\/normativa(?:\/(V\d{1,2}))?$/, async ([id, v]) => (await import('./verification.js')).verificationScreen(id, v));
route(/^\/caso\/(\d{3})\/hipotesis$/, async ([id]) => (await import('./hypotheses.js')).hypothesesScreen(id));
route(/^\/caso\/(\d{3})\/informe$/, async ([id]) => (await import('./report.js')).reportScreen(id));
route(/^\/caso\/(\d{3})\/resultado$/, async ([id]) => (await import('./report.js')).resultScreen(id));

route(/^\/modelos$/, async () => (await import('./viewer.js')).galleryScreen());
route(/^\/modelos\/(\w+)$/, async ([k]) => (await import('./viewer.js')).viewerScreen(k));
route(/^\/historia$/, async () => (await import('./story.js')).storyHome());
route(/^\/historia\/jugar$/, async () => (await import('./story.js')).storyPlay());

startRouter();
