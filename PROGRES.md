# PROGRES.md: estat del projecte (resum per continuar en un altre xat)

> Complementa `NOTES.md` (decisions, esquema i llista completa de fases) i la guia genèrica d'Electron.
> Aquí només hi ha **què s'ha fet**, **incidències resoltes** i **què toca ara**.
> Quan `NOTES.md` i aquest fitxer difereixin, mana `NOTES.md`.

## Forma de treballar

- L'usuari vol anar **pas a pas**: un pas (o una ordre) cada vegada, esperant que confirmi el resultat abans de passar al següent.
- Idioma de la conversa: **català**.
- Editor: VS Code (veu els errors de TypeScript, ESLint i Prettier directament; no cal demanar-li que els enganxi tots si ho té net, però `npm run typecheck` és útil després de tocar `tsconfig`, `.d.ts` o el preload).
- Control de versions: Git + compte de GitHub (ja configurat). L'usuari fa ell mateix els commits; se li proposa el missatge i se li recorda mirar el `git status` abans de `git add -A`.
- Quan una ordre no mostra res si va bé, o una sortida arriba tallada, demanar-ne la part que falta en lloc de suposar-la.
- Les proves del backend es fan des de les DevTools (`F12` > Console) amb `window.api.*`; les de la UI, a l'app. L'usuari comprova la BD amb `sqlite3`.
- Les files de prova s'anomenen `PROVA` perquè es localitzin i s'esborrin; **no s'esborra mai cap dels immobles ni inquilins migrats de Base**.
- **No es toca `App.tsx`** (decisió de l'usuari): només tria entre `ProvesMantine` i `lloguers.tsx`. La pantalla principal és `src/renderer/src/lloguers.tsx`.
- La documentació de Mantine que s'ha pogut consultar arriba fins a la v8; l'API de la 9.7.1 (`useForm`, `DatePickerInput`, `Fieldset`, `SimpleGrid`, `modals.openConfirmModal`...) ha funcionat tal com es coneixia, però cal vigilar el `typecheck` en cada component nou.

## Entorn (verificat)

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
| `i18next` + `react-i18next` | instal·lats (versió a `package.json`) |
| `dayjs` | instal·lat (per a `@mantine/dates` i els càlculs de dates) |
| Repositori | `https://github.com/lmoreso/lloguers`, branca `main` |

## Estat actual

**Fases A, B i C fetes; Fase D feta fins al pas 14 (Inquilins i Immobles completes).** Toca el pas 15 de `NOTES.md`: Contractes (backend).

### Fase A: base (feta)

Projecte electron-vite (`react` + TypeScript), `better-sqlite3` compilat contra Electron, `database.ts` amb connexió
(`journal_mode = WAL`, `foreign_keys = ON`) i migracions incrustades al codi amb `import.meta.glob`. BD existent
(migrada de Base) marcada `user_version = 1` **sense executar** `001_inicial.sql`. Còpies de seguretat a `~/Lloguers/`
(`.bak`, `.bak2`), fora del repositori. cSpell desactivat al projecte.

### Fase B: backend al Main Process (feta)

- `src/shared/tipus.ts`: `Immoble`, `ImmobleDades`, `Inquili`, `InquiliDades`, `Idioma`, `Config`,
  `CodiError` (`CONTRACTE_SOLAPAT` | `FK_VIOLADA` | `CHECK_VIOLAT` | `DESCONEGUT`) i `Resultat<T>`. Cap tipus inclou
  `afegit_el` ni `ultima_mod`.
- `src/main/errors.ts`: `traduirError(e)` i `executar(op)`. `src/main/{inmobles,inquilins,config}.ts` i
  `src/main/ipc/{inmobles,inquilins,config}.ts`, registrats a `index.ts`. A `inquilins` la conversió `0/1/NULL` ↔
  `boolean` dels indicadors `ck_tel1_*` es fa només al Main.
- Preload i `src/preload/index.d.ts` amb `window.api.inmobles`, `.inquilins` i `.config` (cal duplicar la forma de
  l'objecte `api` als dos fitxers cada cop que s'hi afegeix un mètode).
- Provat des de les DevTools (lectura, crear, actualitzar, eliminar, config i rebuig d'un idioma invàlid).

### Prova d'empaquetat anticipada (feta, amb `npm run build:unpack`)

Migracions incrustades; `asarUnpack: '{resources/**,node_modules/better-sqlite3/**}'` (**un sol text**); `snap` tret de
`linux.target`. L'app empaquetada, executada amb `HOME=/tmp/provahome` (instal·lació des de zero), ha aplicat
`001_inicial.sql`, ha deixat la BD a `user_version = 1` amb 4 taules i no ha tocat la BD real.
`better-sqlite3` 13 porta els binaris a `prebuilds/<plataforma>.node`; ens cal només `linux-x64`.

### Fase C: base de la UI (feta)

- Mantine 9.7.1 (decisió **definitiva**), providers a `main.tsx`: `MantineProvider`, `DatesAmbIdioma`, `ModalsProvider`
  i `Notifications`, amb els estils de `core`, `dates` i `notifications` i els locales de dayjs `ca` i `es`.
- i18n: `src/renderer/src/i18n/{index.ts,i18next.d.ts,ca.json,es.json}`; claus tipades des de `ca.json`. L'idioma es llegeix
  de `config.json` a `main.tsx` abans de pintar. Components `SelectorIdioma` (desa i canvia sense recarregar) i
  `DatesAmbIdioma` (el locale de les dates segueix l'idioma).
- `react-router-dom` amb **`HashRouter`** (l'app empaquetada es carrega des de `file://`) i menú lateral amb `AppShell`:
  Immobles, Inquilins, Contractes, Configuració i Quant a. El selector d'idioma és a Configuració.
  Contractes i Quant a només tenen un títol provisional.
- `src/renderer/src/utils/resultat.ts`: `esOk(resposta)` (notifica l'error traduït amb `t('errors.<CODI>')` i retorna
  `false` si ha fallat) i `notificarError`.
- Neteja del CSS de la plantilla: eliminats `main.css`, `base.css`, `Versions.tsx` i els SVG de demostració.
  No s'ha de tornar a posar `user-select: none` (cal poder copiar NIF, telèfons...).

### Fase D: pantalles (feta fins al pas 14)

- **Inquilins** (`src/renderer/src/pantalles/{Inquilins,FormulariInquili}.tsx`): taula, alta i edició en modal,
  validació (cal nom o cognoms), eliminació amb confirmació (`modals.openConfirmModal`) i notificacions.
- **Immobles** (`{Immobles,FitxaImmoble,FormulariImmoble}.tsx`): llista; formulari en pantalla pròpia amb quatre seccions
  (`/immobles/nou`, `/immobles/:id`); camps obligatoris validats; superfícies amb coma o punt; dates amb
  `DatePickerInput` (treballa directament amb text `AAAA-MM-DD`, **no cal conversió `Date`**); eliminació amb
  confirmació; avís de caducitats (certificat i cèdula) a **60 dies** (`DIES_AVIS` a `utils/caducitat.ts`; el dia de
  caducitat el document encara és vigent).
- Provat tot amb files `PROVA` i comprovat a la BD (`NULL` en camps buits, camps d'auditoria omplerts pels triggers).
  Les dates d'auditoria són en UTC (a Barcelona es veuen 1 o 2 hores menys al `sqlite3`); correcte, es convertiran a hora
  local només quan es mostrin a la UI.
- L'eliminació d'un immoble o inquilí **amb contractes** (error `FK_VIOLADA`) encara no s'ha pogut provar: no hi ha contractes.

### Pendent de confirmar

- **Commit** del pas 14e (avís de caducitats) i dels canvis a `NOTES.md` i `PROGRES.md`.
- Pujar les dues versions noves al projecte de Claude (**tots dos alhora**, perquè no es desquadrin).
- No s'ha vist la sortida del `cmp` de la còpia `lloguers.sqlite.bak2`.
- Aplicar a `NOTES.md` les dues lliçons del pas 14 (formularis llargs i números al formulari) si no s'han fet ja.

## Pròxim pas

**Fase D, pas 15 de `NOTES.md`: Contractes (backend).**

- Tipus a `src/shared/tipus.ts`: `Contracte` i `ContracteDades` (sense `afegit_el` ni `ultima_mod`). Camps: `id`, `id_inmoble`,
  `data_inici`, `data_fi` (buida = contracte **vigent**), `id_inquili`, `d_fi_prevista`, `lloguer_inicial` (`NUMERIC`),
  `comentaris`. Decidir si el llistat porta també l'adreça de l'immoble i el nom de l'inquilí (un `JOIN`) per no haver de
  fer més crides des de la UI.
- `src/main/contractes.ts` (CRUD amb `SELECT` de columnes explícites), `src/main/ipc/contractes.ts`, registre a `index.ts`,
  preload i `index.d.ts`.
- **Provar els triggers de solapament amb dades de prova**, des de les DevTools: dos contractes de la mateixa finca amb períodes
  que se solapen (ha de sortir `CONTRACTE_SOLAPAT`); el dia final és inclusiu (un contracte que acaba el 31-03 permet que el
  següent comenci l'01-04); `data_fi` buida es tracta com `9999-12-31`; el solapament amb un `UPDATE` també ha de fallar.
- **Verificar que `better-sqlite3` retorna els codis `SQLITE_CONSTRAINT_*`** que usa `traduirError`
  (`..._TRIGGER` → `CONTRACTE_SOLAPAT`, `..._FOREIGNKEY` → `FK_VIOLADA`, `..._CHECK` → `CHECK_VIOLAT`). Si no coincideixen,
  `CONTRACTE_SOLAPAT` no es detectarà. Provar també els `CHECK` de dates (`data_fi >= data_inici`, `d_fi_prevista >= data_inici`).
- Provar que eliminar un immoble o un inquilí amb contractes dona `FK_VIOLADA`.
- Esborrar les files de prova al final.

Després: Contractes (UI, pas 16), Documents (backend i UI, passos 17 i 18) i distribució (Fase E).

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
cal consultar-ho amb `npm install-scripts ls`. Decisions preses:

```bash
npm install-scripts approve electron
npm install-scripts approve esbuild
npm install-scripts approve better-sqlite3
npm install-scripts deny electron-winstaller   # només per a Windows, no el necessitem
```

Després d'aprovar `better-sqlite3`, cal forçar la compilació: `npm rebuild better-sqlite3`.
Aquesta ordre compila contra el Node del sistema; el `postinstall` de la plantilla s'encarrega de la versió d'Electron.
Després de cada `npm install` de paquets nous, executar `npm install-scripts ls`.

### 2. Error de sandbox en arrencar Electron

Error: `The SUID sandbox helper binary was found, but is not configured correctly`.
Solució (des de la carpeta del projecte):

```bash
sudo chown root:root node_modules/electron/dist/chrome-sandbox
sudo chmod 4755 node_modules/electron/dist/chrome-sandbox
```

Es perd si es reinstal·la Electron (p. ex. `rm -rf node_modules` + `npm install`). Cal repetir-ho llavors.
L'app empaquetada (`dist/linux-unpacked/`) necessita el mateix sobre el seu propi `chrome-sandbox`.

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

### 6. Missatges de `libva` / `vaInitialize` a la terminal

Venen de la GPU virtual de la VM (`virtio_gpu`): Chromium no pot usar l'acceleració de vídeo i renderitza per programari.
Són inofensius. Si molesten, `app.disableHardwareAcceleration()` al Main.

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

## Altres pendents

- `traduirError` fa `console.error('Error de BD no reconegut:')` també per a errors que no són de BD
  (p. ex. l'idioma invàlid). Només cosmètic; ajustar el text si molesta.
- Configuració només té el selector d'idioma, i Quant a només el títol (la versió es pot llegir de `package.json`).
- `ProvesMantine.tsx` i `App.tsx.bak` són de l'usuari; decidir més endavant si s'esborren (`App.tsx.bak` es va fer fora de
  Git: comprovar-ho amb `git status` abans de `git add -A`).
- Empaquetat (Fase E): excloure els binaris de `better-sqlite3` d'altres plataformes (opcional), revisar `appId`,
  `maintainer` i el bloc `publish` (apunta a `example.com`), generar `.deb` / AppImage i provar al portàtil Mint.

## Git

- Repositori **ja iniciat i enllaçat amb GitHub** (`lmoreso/lloguers`, branca `main`; fet per l'usuari).
