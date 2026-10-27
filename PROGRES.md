# PROGRES.md: estat del projecte (resum per continuar en un altre xat)

> Complementa `NOTES.md` (decisions, esquema i llista completa de fases) i la guia genèrica d'Electron.
> Aquí només hi ha **què s'ha fet**, **incidències resoltes** i **què toca ara**.
> Quan `NOTES.md` i aquest fitxer difereixin, mana `NOTES.md`.

## Forma de treballar

- L'usuari vol anar **pas a pas**: un pas (o una ordre) cada vegada, esperant que confirmi el resultat abans de passar al següent.
- Idioma de la conversa: **català**.
- Editor: VS Code (veu els errors de TypeScript, ESLint i Prettier directament; no cal demanar-li que els enganxi tots si ho té net, però `npm run typecheck` és útil després de tocar `tsconfig`, `.d.ts` o el preload).
- Control de versions: Git + compte de GitHub (ja configurat a la VM i al portàtil). L'usuari fa ell mateix els commits; se li proposa el missatge i se li recorda mirar el `git status` abans de `git add -A`.
- **Treballa en dos ordinadors** (VM i portàtil Mint) amb GitHub com a única font de veritat: abans de deixar-ne un, `commit` i `push`; en arribar a l'altre, `git pull` (i `npm install` si s'han afegit paquets). **Les BD no se sincronitzen** (cada màquina té la seva).
- Quan una ordre no mostra res si va bé, o una sortida arriba tallada, demanar-ne la part que falta en lloc de suposar-la. Si l'usuari enganxa només una ordre sense la sortida, demanar la sortida.
- Les proves del backend es fan des de les DevTools (`F12` > Console) amb `window.api.*`; les de la UI, a l'app. L'usuari comprova la BD amb `sqlite3`. **La consola de les DevTools no comprova tipus**: un backend que funciona no demostra que el `typecheck` passi.
- Les files de prova s'anomenen `PROVA` perquè es localitzin i s'esborrin; **no s'esborra mai cap dels immobles ni inquilins migrats de Base**.
- **No es toca `App.tsx`** (decisió de l'usuari): només tria entre `ProvesMantine` i `lloguers.tsx`. La pantalla principal és `src/renderer/src/lloguers.tsx`.
- La documentació de Mantine que s'ha pogut consultar arriba fins a la v8; l'API de la 9.7.1 (`useForm`, `DatePickerInput` amb `minDate`, `Fieldset`, `SimpleGrid`, `Select`, `Tabs`, `modals.openConfirmModal`...) ha funcionat tal com es coneixia, però cal vigilar el `typecheck` en cada component nou.
- **Quan s'enganxen sortides al terminal, no enganxar mai línies que comencin amb `>`** (p. ex. `> lloguers@1.0.0 dev`): el shell les interpreta com una redirecció i crea fitxers buits amb aquests noms. Tampoc enganxar dues ordres amb un `|` entre elles.
- La CLI `sqlite3` arrenca amb les **claus foranes desactivades** i continua executant després d'un error (cal `-bail` en provar migracions). Per tant una prova amb la CLI valida l'SQL, no el comportament amb `foreign_keys = ON` de l'app.
- Les migracions es proven **sempre sobre còpies** (`/tmp/...`) i en dos escenaris: la BD real copiada i una instal·lació des de zero (001 + 002...). Després, l'app amb un `HOME` fals i, només al final, la BD real amb una còpia de seguretat fresca.
- Cada bloc nou de l'API s'afegeix als **dos** fitxers del preload (`index.ts` i `index.d.ts`) i dins de `api`, no dins d'un altre bloc (vegeu la incidència 15).
- Quan una prova "no funciona", **primer comprovar que el canvi s'ha aplicat al fitxer** (`grep -n` sobre el text nou): ha passat
  tres cops (`asarUnpack`, el bloc `documents` de l'`index.d.ts` i l'entrada de devolució del menú de contractes).
- Quan l'usuari diu **"continua"**, vol dir que tot el pendent està fet i provat correctament: es passa al pas següent.
- **Pantalles noves: cap botó a sota** (si la llista o el formulari és gran, es perden); les accions van a la capçalera, al costat del títol.
- L'usuari treballa per defecte a la **VM**; el portàtil i l'ordinador anfitrió (Ubuntu 24.04, dades reals) es fan servir per a proves
  d'empaquetat. Abans d'instal·lar una versió nova a l'anfitrió, còpia de seguretat de `~/Lloguers/lloguers.sqlite` (les migracions
  s'apliquen soles en la primera arrencada).

## Entorn (verificat)

### VM de desenvolupament

| Element | Valor |
|---|---|
| SO | Ubuntu Cinnamon 26.04 (VM) sobre amfitrió Ubuntu 24.04 |
| Usuari / host | `lluismb@UbuntuKvm` |
| Carpeta del projecte | `~/Projectes/Lloguers/lloguers/` |
| Carpeta de dades | `~/Lloguers/` (**L majúscula**; conté `lloguers.sqlite`, `config.json` i `documents/`) |
| Node.js | v24.21.0 (instal·lat amb nvm, `nvm install --lts`) |
| npm | 11.19.0 |
| g++ / make | 15.2.0 / 4.4.1 |
| Electron | 39.8.10 |
| Vite | 7.3.7 |
| electron-builder | 26.15.3 |
| `better-sqlite3` | 13.0.3 |
| React | 19.3.0 |
| Mantine (`core`, `hooks`, `form`, `dates`, `notifications`, `modals`) | 9.7.1 (**totes la mateixa versió**) |
| `react-router-dom` | 7.18.4 |
| `@tabler/icons-react` | 3.49.0 (icones d'editar, eliminar, revisar, tancar, adjuntar, obrir...) |
| `i18next` + `react-i18next` | instal·lats (versió a `package.json`) |
| `dayjs` | instal·lat (per a `@mantine/dates` i els càlculs de dates) |
| Repositori | `https://github.com/lmoreso/lloguers`, branca `main` |

### Portàtil Linux Mint (verificat el 14-10-2026)

| Element | Valor |
|---|---|
| SO | Linux Mint 22.3 (Zena), base Ubuntu 24.04, x86_64 |
| Usuari / host | `lluismb@LENOVO-LLUIS` |
| g++ / make / git | 13.3.0 / 4.3 / 2.43.0 |
| Node.js / npm | v24.21.0 / 11.19.0 (nvm, `nvm install --lts`; idèntics a la VM) |
| VS Code | 1.141.1 (`.deb` oficial; extensions ESLint 3.0.34 i Prettier 12.4.0) |
| GitHub | clau SSH ed25519 (`~/.ssh/id_ed25519`); clonat amb `git@github.com:lmoreso/lloguers.git` |
| Carpeta del projecte | `~/Projectes/Lloguers/lloguers/` |
| Carpeta de dades | `~/Lloguers/` creada per l'app (**BD de proves**, sense dades reals) |
| `sqlite3` / DB Browser | instal·lats amb `sudo apt install -y sqlite3 sqlitebrowser` |
| `jq` | instal·lat el 15-10-2026 (cal per a la comprovació de claus d'i18n) |

Com es va instal·lar (ordre seguit):

1. `sudo apt install -y build-essential python3 make g++ git curl`.
2. nvm (`curl ... nvm-sh/nvm/master/install.sh | bash`) i `nvm install --lts`.
3. VS Code (`.deb` amb `sudo apt install ./fitxer.deb`; l'avís `N: La baixada es duu a terme fora de l'entorn segur...` és inofensiu) i extensions amb `code --install-extension`.
4. Git: nom i correu ja configurats; `git config --global init.defaultBranch main`. Clau SSH: `ssh-keygen -t ed25519 -C "lmoreso@yahoo.com"`, afegida a <https://github.com/settings/keys>, i comprovada amb `ssh -T git@github.com`.
5. `git clone`, `npm install`. `npm install-scripts ls` **no mostra res pendent**: les aprovacions viatgen amb el repositori.
6. `chrome-sandbox` de `node_modules/electron/dist/` (`chown root:root` + `chmod 4755`), vegeu la incidència 2.
7. `npm run dev`: l'app crea `~/Lloguers/` i la BD, aplica `001` i `002` (`user_version = 2`), mostra la pantalla de selecció d'idioma i desa `config.json` en confirmar.

## Estat actual

**Fases A, B i C fetes; Fase D feta fins al pas 23.** Contractes: fase 1 (dades, segon inquilí, lloguer i revisió, fiança fins a la notificació, accions Tancar i Revisar lloguer, avisos i documents amb la taula de tipus) i fase 2 (devolució de la fiança). A més: la vista "Últims contractes" (20), una primera versió empaquetada (21), la gestió ampliada d'immobles (22) i els documents d'immoble (23). **La BD és a `user_version = 3`.** L'empaquetat s'ha provat fins al pas 21 (`.deb` v1.0.2 a l'anfitrió, amb dades reals); **els passos 22 i 23 no s'han empaquetat encara**.

### Fase A: base (feta)

Projecte electron-vite (`react` + TypeScript), `better-sqlite3` compilat contra Electron, `database.ts` amb connexió
(`journal_mode = WAL`, `foreign_keys = ON`) i migracions incrustades al codi amb `import.meta.glob`. BD existent
(migrada de Base) marcada `user_version = 1` **sense executar** `001_inicial.sql`. Còpies de seguretat a `~/Lloguers/`
(`*.bak*`, fora del repositori); la còpia `lloguers.dades.migrada_001.sqlite.bak` (versió 1, amb les dades reals) serveix per
tornar a provar la migració 002 des de la BD real. cSpell desactivat al projecte.

### Fase B: backend al Main Process (feta)

- `src/shared/tipus.ts`: `Immoble`, `ImmobleDades`, `Inquili`, `InquiliDades`, `Contracte`, `ContracteDades`,
  `ContracteLlistat`, `DevolucioDades`, `IDIOMES`/`Idioma`, `Config`, `ConfigObtinguda`, `CLASSES_DOCUMENT`/`ClasseDocument`, `TipusDocument`,
  `NomsClasses`, `DocumentContracte`, `DocumentDades`, `DocumentLlistat`, `CodiError` (`CONTRACTE_SOLAPAT` | `FK_VIOLADA` |
  `CHECK_VIOLAT` | `FITXER_NO_TROBAT` | `DESCONEGUT`) i `Resultat<T>`. Cap tipus inclou `afegit_el` ni `ultima_mod`.
- `src/main/errors.ts`: `traduirError(e)`, `executar(op)` i `executarAsync(op)` (per a diàlegs i obrir fitxers).
  `src/main/{inmobles,inquilins,config,tipusDocument,contractes,documents}.ts` i `src/main/ipc/*.ts`, registrats a `index.ts`.
  A `inquilins` la conversió `0/1/NULL` ↔ `boolean` dels indicadors `ck_tel1_*` es fa només al Main.
- Preload i `src/preload/index.d.ts` amb `window.api.*` (cal duplicar la forma de l'objecte `api` als dos fitxers cada cop que
  s'hi afegeix un mètode). Ara hi ha `inmobles`, `inquilins`, `config`, `tipusDocument`, `contractes` i `documents`.
- Els tres codis `SQLITE_CONSTRAINT_*` que usa `traduirError` **estan verificats amb casos reals**: `_TRIGGER` →
  `CONTRACTE_SOLAPAT`, `_CHECK` → `CHECK_VIOLAT` i `_FOREIGNKEY` → `FK_VIOLADA`.

### Fase C: base de la UI (feta)

- Mantine 9.7.1 (decisió **definitiva**), providers a `main.tsx`: `MantineProvider`, `DatesAmbIdioma`, `ModalsProvider`
  i `Notifications`, amb els estils de `core`, `dates` i `notifications` i els locales de dayjs `ca` i `es`.
- i18n: `src/renderer/src/i18n/{index.ts,i18next.d.ts,ca.json,es.json}`; claus tipades des de `ca.json`; `idiomaNom` a cada JSON.
  Components `SelectorIdioma`, `SeleccioIdioma` i `DatesAmbIdioma` a `src/renderer/src/components/`.
- `react-router-dom` amb **`HashRouter`** (l'app empaquetada es carrega des de `file://`) i menú lateral amb `AppShell`:
  **Immobles, Inquilins, Configuració i Quant a** (Contractes no té entrada al menú: s'hi entra des d'Immobles). Configuració només
  té el selector d'idioma, i Quant a només el títol.
- `src/renderer/src/utils/`: `resultat.ts` (`esOk` i `notificarError`), `caducitat.ts`, `adreca.ts`, `dates.ts` (`formatData`)
  i `formulari.ts` (`buitANull`, `aNumero`).
- Neteja del CSS de la plantilla: eliminats `main.css`, `base.css`, `Versions.tsx` i els SVG de demostració.
  No s'ha de tornar a posar `user-select: none` (cal poder copiar NIF, telèfons...).

### Fase D: pantalles i contractes

- **Inquilins** (`src/renderer/src/pantalles/{Inquilins,FormulariInquili}.tsx`): taula, alta i edició en modal,
  validació (cal nom o cognoms), eliminació amb confirmació (`modals.openConfirmModal`) i notificacions.
- **Immobles** (`{Immobles,FitxaImmoble,FormulariImmoble}.tsx`): llista; formulari en pantalla pròpia amb quatre seccions
  (`/immobles/nou`, `/immobles/:id`); dates amb `DatePickerInput` (treballa amb text `AAAA-MM-DD`, **no cal conversió `Date`**);
  eliminació amb confirmació; avís de caducitats (certificat i cèdula) a **60 dies** (`DIES_AVIS` a `utils/caducitat.ts`).
- **Icones** (`@tabler/icons-react`): editar i eliminar a Inquilins i als Documents d'un contracte són icona sola amb `Tooltip`
  i `aria-label` traduïts, **una columna per icona** (les accions que no s'ofereixen deixen la cel·la buida i la resta queden
  alineades). Les accions principals (Afegir) són botons de text. Els avisos es mostren apilats (`Stack`). A Contractes, Immobles i als Documents d'immoble, en canvi, hi ha **una sola icona per fila** (menú d'accions, vegeu més avall).
- Les dates d'auditoria són en UTC (a Barcelona es veuen 1 o 2 hores menys al `sqlite3`); correcte, es convertiran a hora
  local només quan es mostrin a la UI.

**Pas 15: Contractes (backend), complet.**

- **15a, idioma al primer arrencament.** `IDIOMES` (constant única a `tipus.ts`, `Idioma` en deriva) i `idiomaNom` a cada JSON.
  `config:obtenir` retorna `{ idioma, confirmat }` i **no escriu res**: si `config.json` no existeix o és invàlid retorna
  l'idioma del sistema (`app.getLocale()`, fallback `ca`) com a no confirmat. Si no és confirmat, `main.tsx` mostra
  `SeleccioIdioma` (un botó per idioma pel seu nom propi; títol i botó en l'idioma ressaltat; només es desa en confirmar).
  Logs `[idioma]` a la terminal (Main) i a les DevTools (Renderer). Provat: fitxer vàlid, absent i amb `"fr"`.
  `app.getLocale()` retorna `"ca"` a la VM; la branca "idioma del sistema no suportat" no s'ha pogut provar.
- **15b, migració 002** (`contractes` i `documents_contracte` reconstruïdes, `tipus_document` nova, índexs i triggers
  recreats: **3 índexs, 5 taules, 11 triggers**). Columnes noves de `contractes`: `id_inquili_2`, `lloguer_actual`,
  `data_ultima_revisio`, fiança (6 camps), devolució (4 camps). `CHECK`s: parelles de fiança, devolució només amb
  contracte tancat, `id_inquili_2 <> id_inquili`, `data_ultima_revisio >= data_inici`.
  **Excepció a la regla "no editar mai una migració aplicada":** la 002 es va editar perquè el `CHECK (date(x) = x)` no
  rebutja dates mal escrites (`date()` dona `NULL` i un `CHECK` només falla amb 0); ara és `date(x) IS x`. Només s'havia
  aplicat a BD de desenvolupament, restaurades a la versió 1. A la VM es va restaurar la còpia `001` i l'app va tornar a
  aplicar la 002 corregida: 4 immobles i 4 inquilins intactes, 0 contractes, 7 tipus, i un `INSERT` amb `'2025-1-1'` falla.
- **15c, tipus de document.** `CLASSES_DOCUMENT` (7 classes) i `ClasseDocument` a `tipus.ts`; claus `documents.classes.*` als
  JSON; `src/main/tipusDocument.ts` i IPC (`tipusDocument:obtenir`, `tipusDocument:sembrar`). Sembrat a `main.tsx`
  (`pintarApp`), amb l'idioma ja definitiu: insereix un tipus per cada classe que no en tingui cap (idempotent, per
  classe), amb validació al Main. Provat: sembrat, idempotència, sembrat d'una sola classe i idioma triat.
- **15d, backend de Contractes.** `src/main/contractes.ts` (CRUD, `JOIN` + `LEFT JOIN`, accions `tancarContracte` i
  `revisarLloguer`) i `src/main/ipc/contractes.ts`. En crear, el Main fixa `lloguer_actual = lloguer_inicial` i
  `data_ultima_revisio = data_inici`; en actualitzar, `id_inmoble` s'ignora i, mentre no s'ha revisat mai, s'arrossega el
  lloguer i la data. Provat des de les DevTools: solapament (vigent, dia final inclusiu, `UPDATE`), els `CHECK`, `FK_VIOLADA`
  en eliminar immoble o inquilins amb contractes, arrossegament, Revisar lloguer, Tancar (data anterior a l'inici, `null`).

**Pas 16: Contractes (UI), complet** (`src/renderer/src/pantalles/`):

- Botó "Contractes" (icona i text) a cada fila d'Immobles → `/immobles/:id/contractes` (`Contractes.tsx`): llista de l'immoble,
  l'últim primer, amb etiqueta *vigent* / *tancat*, nom dels dos inquilins (apilats), dates `DD/MM/AAAA` i lloguer en euros.
  Per fila, al menú d'accions: revisar lloguer i tancar (només vigents), editar (amb confirmació si és tancat) i eliminar (la confirmació avisa
  que s'esborren fiança i documents).
- Formulari en pantalla pròpia (`FitxaContracte.tsx` + `FormulariContracte.tsx`; rutes `/immobles/:id/contractes/nou` i
  `/immobles/:id/contractes/:idContracte`, amb `key` diferent): immoble fix, inquilins amb desplegable cercable, dates
  (permet informar `data_fi` per registrar contractes antics), lloguer i fiança; `lloguer_actual` i `data_ultima_revisio` de
  només lectura en editar. Un contracte inexistent o d'un altre immoble surt com a no trobat.
- Accions en finestres: `TancarContracte.tsx` (data de fi, per defecte avui, `minDate` = inici) i `RevisarLloguer.tsx` (import i
  data alhora; l'import pot ser igual).
- Avisos a la llista (només contractes vigents): **fi prevista a 90 dies** i **revisió del lloguer a 30 dies** de l'aniversari
  (`data_ultima_revisio` + 1 any), també un cop passats (`DIES_AVIS_FI` i `DIES_AVIS_REVISIO` a `utils/caducitat.ts`).

**Pas 17: Documents (backend), complet.** `src/main/documents.ts` i `src/main/ipc/documents.ts`:

- `adjuntarDocuments`: el diàleg de selecció s'obre **al Main** (el Renderer només envia contracte, tipus i títol, mai rutes);
  selecció múltiple amb tipus comú; còpia a `~/Lloguers/documents/<id_contracte>/<id_document>_<nom_segur>` (el prefix evita
  col·lisions; el nom es neteja de caràcters reservats; `nom_original` es conserva); a la BD només la ruta relativa; tot o res
  (si un fitxer falla es desfan les files i els fitxers ja copiats).
- `obrirDocument` (`shell.openPath`) i `eliminarDocument` validen que la ruta queda **dins de `documents/`** abans de tocar res.
  Un fitxer absent dona `FITXER_NO_TROBAT` en obrir, i no és un error en eliminar.
- `eliminarContracte` esborra la fila (els documents, en cascada) i després la carpeta del contracte.
- Provat: múltiples fitxers, mateix nom dos cops, cancel·lar (llista buida), actualitzar (`CHECK_VIOLAT`/`FK_VIOLADA`), obrir,
  fitxer desaparegut, **ruta amb `..` rebutjada sense tocar res**, i que eliminar un contracte només s'emporta la seva carpeta
  (un id no numèric es descarta).

**Pas 18: Documents (UI), complet.** A la fitxa d'un contracte **en edició** hi ha dues pestanyes (Dades i Documents, amb els
panells muntats). `DocumentsContracte.tsx`: desplegable de tipus (per defecte el primer de classe `contracte`) i botó Adjuntar;
llista amb obrir, editar (`EditarDocument.tsx`: tipus, data i comentaris) i eliminar (confirmació que avisa que s'esborra el
fitxer). Els documents es desen a l'instant, independentment del botó Desar de les dades. **Avís "Falten documents"**: hi ha una
data de la fiança informada (model 2 o notificació) i cap document de la classe corresponent; surt a la llista de contractes
(etiqueta apilada, també als tancats) i, a la pestanya, com una caixa que diu quin falta. El calcula el Main (`te_doc_model2` i
`te_doc_notificacio` a `ContracteLlistat`).

**Menú d'accions de la llista de contractes.** Una sola icona per fila (`IconMenu2`, de moment; capçalera de columna "Accions")
que obre un `Menu` amb icona i text: als **vigents**, Revisar lloguer i Tancar contracte; als **tancats**, Devolució de la fiança;
a **tots**, Editar i (després d'una línia) Eliminar en vermell. Les confirmacions (editar un tancat, eliminar) no han canviat.

**Fase 2: devolució de la fiança (model 3), completa.**

- **Backend**: `registrarDevolucio` a `src/main/contractes.ts` (IPC `contractes:devolucio`, `window.api.contractes.devolucio`).
  Cap camp és obligatori; tot a `null` esborra la devolució. El Main valida que el cobrament no sigui anterior a la sol·licitud,
  que la sol·licitud no sigui anterior a la fi del contracte, l'import (>= 0) i el tipus dels valors; la BD ja només deixa informar-la
  amb el contracte tancat (`CHECK_VIOLAT`). `actualitzarContracte` rebutja una `data_fi` posterior a la sol·licitud ja informada.
  Provat (17 casos des de les DevTools): vigent, només la sol·licitud, dates en ordre invers, import negatiu o no numèric, data
  mal escrita, tot informat, la devolució no es perd en editar el contracte, esborrar-la, i reobrir.
- **UI**: `DevolucioFianca.tsx` (finestra amb data de sol·licitud, de cobrament, import retornat i motiu; mostra l'import de la
  fiança; els calendaris limiten les dates amb `minDate`).
- **Avisos**: "Falten documents" també per al model 3 (hi ha data de sol·licitud i cap document de classe `fianca_model3`;
  `te_doc_model3` a `ContracteLlistat`, també a la caixa de la pestanya Documents). Avís nou **"Devolució pendent"** (groc): contracte
  tancat amb el model 2 o la notificació informats i sense data de cobrament.
- **Reobrir**: un contracte amb alguna dada de devolució no es pot reobrir (esborrar `data_fi`) i la fi no pot passar de la
  sol·licitud; el formulari ho diu amb un missatge concret abans d'arribar a la BD.

**Pas 20: "Últims contractes", complet.**

- **Backend**: `obtenirUltimsContractes()` a `src/main/contractes.ts` (IPC `contractes:ultims`, `window.api.contractes.ultims`; tipus
  `ImmobleAmbContractes { immoble, contractes[] }`). De cada immoble surten els contractes **en curs** (sense `data_fi`, o amb `data_fi`
  d'avui o posterior; l'"avui" es calcula al Main en hora local) **més el de `data_inici` més recent** (en empat, l'`id` més alt), en ordre
  cronològic. Els immobles sense contracte hi surten amb la llista buida. Provat amb cinc casos (antic acabat + tancat a futur, tancat a
  futur + posterior, cap contracte, tots acabats, antic acabat + vigent).
- **Refactor sense canvis visibles**: `AccionsContracte.tsx` (menú d'accions compartit; navega amb `c.id_inmoble`), `utils/inquilins.ts`
  (`nomInquili`), `components/AvisosContracte.tsx` i `utils/avisosContracte.ts` (`avisos`, `faltenDocuments`, `devolucioPendent`, `teAvisos`).
- **UI**: `UltimsContractes.tsx` a `/ultims-contractes`, entrada de menú "Últims contractes" (entre Immobles i Inquilins). Una fila per
  contracte (l'adreça es repeteix si un immoble en té dos; clicable cap a la llista de contractes de l'immoble); els immobles sense
  contracte mostren "Sense contracte" i un botó Afegir. Només dos estats: Vigent i Tancat (un tancat a futur surt com a Tancat, amb la
  data de fi). Detall conegut: editar un contracte des d'aquí torna, en desar o cancel·lar, a la llista de l'immoble i no a aquesta vista.
  (`dades.flatMap<Fila>(...)`: vegeu la incidència 16.)

**Pas 21: primera versió publicable, feta.**

- Versió `1.0.2` al `package.json` (`app.getVersion()`); `<title>Lloguers</title>`; metadades del paquet (`description`, `author`,
  `homepage`; a `electron-builder.yml`, `productName: Lloguers` i el bloc `linux` amb categoria, `executableName`, `synopsis` i
  `description`). `index.ts` netejat (`ping`, `setAppUserModelId('com.lmoreso.lloguers')`).
- **Icona** (SVG Repo, lliure): `resources/icon.png` (finestra) i `build/icon.png` (paquet), 512x512, més una còpia dins del Renderer
  (`src/renderer/src/assets/icon.png`, per a Quant a). **Hi ha tres còpies que s'han de mantenir iguals.** `build/icon.icns` i
  `build/icon.ico` encara són els de la plantilla (només es fan servir a macOS i Windows).
- **Quant a** (`pantalles/QuantA.tsx`): icona abans del títol, versió (IPC `app:versio`), descripció, autor, tecnologies i la paraula
  Claude com a enllaços. Els enllaços s'obren al navegador del sistema per `app:obrirEnllac`, que **només accepta `https`**; el
  `setWindowOpenHandler` de `index.ts` també. L'usuari hi ha afegit llicència i enllaç al repositori.
- `npm run build:linux`: `.deb` generat i instal·lat a l'anfitrió amb dades reals; tot funciona (inclosos adjuntar i obrir documents).

**Pas 22: gestió ampliada d'immobles, feta.**

- **Llista d'Immobles**: columna Id, "Avisos" en lloc de "Caducitats", menú d'accions (Contractes, Documents, Editar, Eliminar) i
  l'etiqueta **"Contractes amb avisos"** quan algun dels contractes que surten a "Últims contractes" té algun avís. Les alertes de
  l'immoble són a `utils/avisosImmoble.ts`.
- **Edició d'immoble** (`FitxaImmoble.tsx` + `FormulariImmoble.tsx`): capçalera amb títol "Immoble" i subtítol "Id N: adreça" (o "Nou
  immoble"), barra taronja amb les caducitats i l'avís dels contractes, i botons Contractes, Documents, Immoble nou i Eliminar. **Desar es
  queda a la pantalla** (refresca subtítol i avisos); un immoble nou passa a `/immobles/:id`. Si hi ha canvis sense desar
  (`form.isDirty()`), els botons de la capçalera preguntan (`CanvisSenseDesar.tsx`: Desar i continuar / Descartar / Cancel·lar). **No
  cobreix el menú lateral ni `Ctrl+R`**: `HashRouter` no té `useBlocker` (cal un router de dades).
- **A revisar (decisió de l'usuari)**: la navegació entre pantalles, el botó "Descartar" (resulta confús) i els botons Desar i Cancel·lar
  a sota dels formularis (Immobles, Contractes), que es perden si el formulari és llarg.

**Pas 23: documents de l'immoble, fet.**

- **Migració `003_documents_immoble.sql`** (només afegeix una taula, un índex i un trigger; no toca res existent): `documents_immoble` amb
  `tipus` (`CHECK` amb quatre valors: `certificat_energetic`, `cedula_habitabilitat`, `fotos`, `altres`), `comentaris` obligatori i no
  buit, `data_document` amb `IS`, `ON DELETE CASCADE` cap a l'immoble. Provada sobre còpies i amb una instal·lació des de zero.
- **Backend**: `src/main/documentsImmoble.ts`, `src/main/ipc/documentsImmoble.ts` i `src/main/fitxers.ts` (funcions compartides amb
  `documents.ts`: `nomSegur`, `rutaDins`, `fitxerNoTrobat`). Fitxers a `~/Lloguers/documents/immobles/<id_immoble>/<id_document>_<nom_segur>`.
  El Main valida el comentari i el tipus **abans** d'obrir el diàleg. Una fila per fitxer, amb tipus, data i comentari comuns; si en són
  més d'un, el comentari es numera (`1. Sala`, `2. Sala`...; `01.` a partir de 10) segons l'ordre dels noms (ordre numèric). Tot o res.
  El llistat va per ordre d'adjuntat. `eliminarInmoble` esborra també la carpeta; un immoble amb contractes continua bloquejat (`FK_VIOLADA`)
  i no es toca cap fitxer. Provat: validacions sense diàleg, un i diversos fitxers, numeració i ordre, cancel·lar, data mal escrita,
  actualitzar, obrir, fitxer desaparegut, ruta amb `..` rebutjada sense tocar res, i eliminar un immoble amb documents i amb contractes.
  **No s'ha pogut provar** que, si falla un fitxer a mig adjuntar, s'esborrin els ja copiats (el codi hi és).
- **UI**: `DocumentsImmoble.tsx` a `/immobles/:id/documents` (capçalera amb Afegir, Contractes i Tornar; cap botó a sota; llista amb menú
  Visualitzar, Editar, Eliminar), `AfegirDocumentImmoble.tsx` (el botó per triar fitxers està desactivat fins que hi ha comentari) i
  `EditarDocumentImmoble.tsx` (tipus, data i comentari; el fitxer no se substitueix). Entrades al menú d'Immobles i botó Documents a l'edició.
  La confirmació d'eliminar un immoble avisa que s'esborren també els documents.

### Fase E: empaquetat (feta al portàtil)

Prova d'empaquetat anticipada a la VM (`npm run build:unpack`): migracions incrustades; `asarUnpack: '{resources/**,node_modules/better-sqlite3/**}'`
(**un sol text**); `snap` tret de `linux.target`. L'app empaquetada, executada amb `HOME=/tmp/provahome` (instal·lació des de
zero), va aplicar `001_inicial.sql`, va deixar la BD a `user_version = 1` amb 4 taules i no va tocar la BD real.
`better-sqlite3` 13 porta els binaris a `prebuilds/<plataforma>.node`; ens cal només `linux-x64`.

Al portàtil (14-10-2026):

- `electron-builder.yml`: `appId: com.lmoreso.lloguers`, `maintainer: 'Lluis Moreso Bosch <lmoreso@yahoo.com>'`
  i bloc `publish` **eliminat** (no hi ha `electron-updater` ni `autoUpdater` al codi). Resta igual: `asarUnpack` en un sol
  text, `linux.target` = `AppImage` + `deb`, `npmRebuild: false`.
- `npm run build:linux` genera `dist/lloguers_1.0.0_amd64.deb` (98 MB) i `dist/lloguers-1.0.0.AppImage` (126 MB).
  `dist/` ja és ignorat per `.gitignore`.
- **Prova del `.deb`**: s'instal·la a `/opt/lloguers` amb `sudo apt install ./dist/lloguers_1.0.0_amd64.deb`, s'executa
  amb `lloguers` i va funcionar. **Desinstal·lat** després. L'app empaquetada i `npm run dev` comparteixen `~/Lloguers/`.
- **Prova de l'AppImage**: arrenca sense errors de FUSE ni de sandbox.
- **Observació sobre el `chrome-sandbox`**: el del `.deb` instal·lat té mode `-rwxr-xr-x`, **sense SUID**, i l'app va arrencar
  igualment a Mint 22.3. No s'ha investigat el motiu. A la VM sí que va caldre el SUID. Si falla en un altre equip,
  aplicar l'arreglat de la incidència 2 sobre `/opt/lloguers/chrome-sandbox`, o valorar un script `afterInstall`.
- **Prova a l'anfitrió (Ubuntu 24.04, dades reals), després del pas 21**: `.deb` v1.0.2 instal·lat; pantalla d'idioma, contractes,
  adjuntar i obrir documents (diàleg del sistema i `shell.openPath`) i la resta funcionen. Els passos 22 i 23 no s'han empaquetat encara.

### Pendent de confirmar

- **Commit** del pas 23-3 (UI dels documents d'immoble) i d'aquest `PROGRES.md`; `git push`.
- **`NOTES.md`**: afegir a "Modificar Gestió de Immobles" els blocs "Decisions (tancades)" i "Disseny de la UI (pendent de revisar)", i
  actualitzar el punt dels documents (comentari obligatori; una fila per fitxer amb numeració). Marcar els passos 20 a 23.
- **Anfitrió (dades reals)**: quan s'hi instal·li una versió nova, fer abans una còpia de seguretat de `~/Lloguers/lloguers.sqlite`; la
  migració 003 s'hi aplicarà sola en la primera arrencada (només afegeix una taula).
- **Portàtil**: `git pull`, `npm install`, `npm install-scripts ls`, i **esborrar la seva BD de proves** (té la 002 antiga i contractes de
  prova): `mv ~/Lloguers/lloguers.sqlite ~/Lloguers/lloguers.sqlite.vella`, esborrar `-wal`/`-shm` i arrencar perquè l'app la creï amb la
  001 + 002 + 003. Comprovar `user_version = 3`, 7 tipus i que `'2025-1-1'` es rebutja.
- **Neteja de les files `PROVA`** de la BD de la VM (immobles, inquilins, contractes i documents; en aquest ordre invers per les claus
  foranes). L'usuari ho farà a mà. Si es fa per SQL, cal esborrar també `~/Lloguers/documents/<id>/` i `~/Lloguers/documents/immobles/<id>/`
  (només l'esborrat des de l'app s'emporta la carpeta); `/tmp/provaDocs` i `/tmp/provaImm` són temporals.
- Pujar `NOTES.md` i `PROGRES.md` al projecte de Claude (**tots dos alhora**).

## Pròxim pas

Cap pas en curs: el bloc "Modificar Gestió de Immobles" de `NOTES.md` està complet. Opcions, per decidir amb l'usuari:

**1. Revisar la UI pendent** (l'usuari ho va deixar per a més endavant): navegació entre pantalles, el botó "Descartar" del diàleg de
canvis sense desar, i els botons Desar i Cancel·lar a sota dels formularis d'Immobles i Contractes (moure'ls a la capçalera).

**2. Fase 3 de contractes** (decidida, no analitzada en detall; convé fer-ne un resum funcional abans de programar, com es va fer amb els
contractes): corregir l'immoble d'un contracte mal assignat (entrada al menú d'accions, amb desplegable; els documents no es mouen perquè van
per `id_contracte`), historial de revisions de lloguer, canvi de signants (annex).

**3. Nova publicació**: pujar la versió, `npm run build:linux`, còpia de seguretat de la BD de l'anfitrió i instal·lar el `.deb`
(la migració 003 s'hi aplicarà).

**4. Altres de `NOTES.md`** (la secció de notes disperses, que l'usuari marca "a ignorar per Claude": només si ell les demana): propietaris
dels immobles, documents d'inquilins, configuració de la ruta de la BD...

## Versions reals vs. la guia

La guia genèrica és antiga respecte al que s'ha instal·lat:

- Electron **39** (la guia diu 33), Vite **7** (la guia diu 5).
- La plantilla genera `electron-builder.yml`: la configuració de distribució **no va dins de `package.json`** com diu la guia.
- La plantilla porta ESLint (`eslint.config.mjs`) i Prettier. Prettier és estricte amb el format:
  `npx prettier --write <fitxer>` arregla els avisos de format.
- Tres `tsconfig`: `tsconfig.json`, `tsconfig.node.json` (Main i Preload) i `tsconfig.web.json` (Renderer).
- `window.api` es declara a `src/preload/index.d.ts` (cobert per `tsconfig.web.json`); no cal `electron.d.ts`.
- La plantilla ja porta `"postinstall": "electron-builder install-app-deps"`, que recompila els mòduls natius
  contra Electron després de cada `npm install`. No cal executar `electron-rebuild` a mà.
- electron-builder avisa que `@electron/rebuild` és una dependència sobrera; és inofensiu.

## Incidències resoltes (cal repetir-les si es reinstal·la)

### 1. npm bloqueja els scripts d'instal·lació

Les versions noves d'npm no executen els `postinstall` fins que s'aproven, i **no avisen durant `npm install`**:
cal consultar-ho amb `npm install-scripts ls`. Decisions preses a la VM:

```bash
npm install-scripts approve electron
npm install-scripts approve esbuild
npm install-scripts approve better-sqlite3
npm install-scripts deny electron-winstaller   # només per a Windows, no el necessitem
```

Les aprovacions viatgen amb el repositori. Si algun cop `better-sqlite3` no queda compilat, forçar-ho amb
`npm rebuild better-sqlite3` (compila contra el Node del sistema; el `postinstall` de la plantilla s'encarrega de la
versió d'Electron). Després de cada `npm install` de paquets nous, executar `npm install-scripts ls`.

### 2. Error de sandbox en arrencar Electron

Error: `The SUID sandbox helper binary was found, but is not configured correctly`.
Solució (des de la carpeta del projecte):

```bash
sudo chown root:root node_modules/electron/dist/chrome-sandbox
sudo chmod 4755 node_modules/electron/dist/chrome-sandbox
```

Es perd si es reinstal·la Electron (p. ex. `rm -rf node_modules` + `npm install`). Cal repetir-ho llavors.
S'ha aplicat també al portàtil. L'app empaquetada a `dist/linux-unpacked/` necessita el mateix sobre el seu propi
`chrome-sandbox`.

### 3. Error TypeScript 4023 a `database.ts`

`Exported variable 'db' has or is using name 'BetterSqlite3.Database'... but cannot be named.`
Solució: importar el tipus i anotar la variable.

```ts
import type { Database as DatabaseType } from 'better-sqlite3'
const db: DatabaseType = new Database(dbPath)
```

### 4. Avís de `baseUrl` a `tsconfig.web.json`

`Option 'baseUrl' is deprecated and will stop functioning in TypeScript 7.0.`
Solució: eliminar `baseUrl` i posar la ruta de `paths` relativa (`"./src/renderer/src/*"`).

### 5. `asarUnpack` invàlid a `electron-builder.yml`

`configuration.asarUnpack.1 should be a string`: la validació només accepta **un sol text**, no una llista.
Solució: `asarUnpack: '{resources/**,node_modules/better-sqlite3/**}'`.
Si un canvi a aquest fitxer no té efecte, comprovar-ho amb `grep -n asarUnpack electron-builder.yml`
(una vegada es va malmetre en editar-lo i va caldre substituir-lo sencer).

### 6. Missatges de `libva` / `vaInitialize` i d'`Autofill` a la terminal

Els de `libva` venen de la GPU virtual de la VM (`virtio_gpu`): Chromium renderitza per programari. Els d'`Autofill.enable` /
`Autofill.setAddresses` són soroll de les DevTools. Tots són inofensius. Si molesten, `app.disableHardwareAcceleration()`.

### 7. El `Modal` de Mantine només mostrava el fons gris

El CSS de demostració de la plantilla (`body` i `#root` amb `display: flex`, centrat i `overflow: hidden`) feia que el
contingut del modal no es veiés. Solució: eliminar `main.css`, `base.css` i els recursos de demostració, i treure
`import './assets/main.css'` de `main.tsx`. Mantine fa el seu propi tema (clar per defecte).

### 8. ESLint `react-hooks/set-state-in-effect`

No es pot cridar dins d'un `useEffect` una funció externa que fa `setState`. Solució: llegir amb `.then()` dins mateix
de l'efecte, amb un indicador `cancelat` que s'activa al retornar, i recarregar amb un comptador (`versio`) a les
dependències de l'efecte.

### 9. `git push` rebutjat (`non-fast-forward`)

El remot tenia commits que el local no tenia. Com que ningú més hi havia treballat, es va resoldre amb `git push --force`.
En un cas semblant, abans de forçar cal mirar `git log --oneline --graph --all`: un `--force` esborra del remot el que no
és en local.

### 10. Fitxers buits `electron-vite` i `lloguers@1.0.0` a l'arrel

Són el resultat d'enganxar al terminal línies de sortida que comencen amb `>`: el shell les executa com una redirecció.
Solució: `rm electron-vite lloguers@1.0.0` (comprovant abans amb `ls -l` que fan 0 bytes).

### 11. `CHECK (date(x) = x)` no rebutja dates mal escrites

`date('2025-13-45')` i `date('2025-1-1')` retornen `NULL`; `NULL = 'text'` és `NULL` i un `CHECK` només falla quan val 0.
Solució: `CHECK (date(x) IS x)` (per a dates opcionals, `x IS NULL OR date(x) IS x`). Aplicat a la migració 002.
`inmobles` té dates sense cap `CHECK`; no es va tocar (conté dades reals i el selector de dates ja protegeix l'app).

### 12. La comprovació de claus d'i18n diu `claus iguals` sense `jq`

Si `jq` no és instal·lat, els dos costats del `diff` surten buits i la comprovació sempre dona `claus iguals`.
Solució: `sudo apt install -y jq`. Convé veure que no surt cap "No s'ha trobat l'ordre".

### 13. El terminal "es queda penjat" després d'un `git diff`

És el paginador de Git (`less`): prem `q`. Per desactivar-lo: `git config --global core.pager cat`.

### 14. Dos ordinadors desquadrats (`git pull` rebutjat per fitxers modificats)

`git fetch` + `git status -sb` diu quants commits va endarrerit el local (`[darrere N]`); `git diff origin/main --stat` mostra
com a esborrat tot el que l'altre ordinador ha afegit (no és una pèrdua). Per posar-se al dia sense perdre res:
`git stash`, `git pull`, comparar amb `git diff stash@{0} -- <fitxers>` i, si no hi ha res propi, `git stash drop`.

### 15. `Property 'documents' does not exist on type ...` al `typecheck`

Un bloc nou de `window.api` (aquí `documents`) havia quedat **dins** del bloc anterior (`contractes`) a `src/preload/index.d.ts`:
no dona error de sintaxi, però el bloc no penja de `api`. Les proves des de les DevTools passaven igualment, perquè la consola no
comprova tipus. Solució: tancar bé les claus. El segon error (`unknown` no assignable) n'és només la conseqüència.

### 16. `flatMap` amb dues branques de tipus diferent (TS2322)

`dades.flatMap((d) => cond ? d.contractes.map(...) : [{ ..., contracte: null }])` no compila: TypeScript infereix el tipus de la primera
branca. Solució: declarar el tipus del resultat, `dades.flatMap<Fila>(...)`.

### 17. Una prova de `ON DELETE CASCADE` esborrava més del compte

`DELETE FROM inmobles WHERE via = 'PROVA'` esborra **tots** els immobles `PROVA` de la còpia, i els que tenen contractes fallen per clau
forana. Solució: filtrar per una clau única (la referència cadastral) i provar-ho sobre una BD des de zero. A les proves amb recompte fix
(`dades[9]`), usar `.at(-1)` i `length`: el diàleg del sistema recorda l'última carpeta i es pot triar un altre nombre de fitxers.

## Altres pendents

- `traduirError` fa `console.error('Error de BD no reconegut:')` també per a errors que no són de BD
  (p. ex. l'idioma invàlid o les validacions de `tancarContracte`/`revisarLloguer`/`registrarDevolucio`/`adjuntarDocuments`/`adjuntarDocumentsImmoble`).
  Només cosmètic.
- Configuració només té el selector d'idioma.
- Pantalla per crear i editar tipus de document (a Configuració): fora de la fase 1. Quan es faci, caldrà decidir si es pot
  esborrar l'últim tipus d'una classe amb lògica (el sembrat el recrea a l'arrencada).
- Els noms dels tipus de document sembrats queden en l'idioma del primer arrencat (són dada de l'usuari).
- Un contracte nou **no** porta a la pestanya Documents en desar-lo: cal tornar a entrar-hi amb el llapis.
- `aNumero` només converteix la coma decimal: un import amb punt de milers (`1.400,50`) no s'accepta. Escriure `1400,50` o `1400.50`.
- L'avís "Devolució pendent" pot persistir en contractes antics amb la fiança ja retornada però no anotada, fins que s'hi posa el cobrament.
- Casos límit assumits: una revisió de lloguer feta el mateix dia que `data_inici` no es distingeix de "mai revisat"; una
  correcció d'una data de revisió ha de poder retrocedir (ara es pot revisar amb una data anterior, mentre sigui `>= data_inici`).
- Fase 3: canvi de signants (annex; ara només s'edita `id_inquili` / `id_inquili_2` i no es guarda qui hi havia abans),
  correcció de l'immoble d'un contracte (ara només es pot eliminar i recrear, i això perd els documents), historial de revisions de lloguer.
- Editar un contracte des d'"Últims contractes" torna a la llista de contractes de l'immoble (no a la vista d'origen).
- La icona dels menús d'accions (`IconDots` o `IconMenu2`) és una decisió estètica pendent d'uniformar.
- `Immobles.tsx` i `FitxaImmoble.tsx` fan cadascun una crida a `contractes.ultims()` només per saber si hi ha avisos.
- `inmobles` té dates sense cap `CHECK` (conté dades reals; el selector de dates ja protegeix l'app).
- `ProvesMantine.tsx` i `App.tsx.bak` són de l'usuari; decidir més endavant si s'esborren (`App.tsx.bak` es va fer fora de Git:
  comprovar-ho amb `git status` abans de `git add -A`).
- Empaquetat (opcional): excloure els binaris de `better-sqlite3` d'altres plataformes per reduir la mida; icones de macOS/Windows i suport
  per a Windows (a `NOTES.md`).

## Git

- Repositori **enllaçat amb GitHub** (`lmoreso/lloguers`, branca `main`). Últim commit confirmat: "Migració 003: documents_immoble" i
  els del backend dels documents d'immoble (WIP). Queda per confirmar el de la UI dels documents d'immoble i el d'aquest `PROGRES.md`
  (vegeu "Pendent de confirmar").
