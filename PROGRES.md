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
- Les proves de la Fase B es fan des de les DevTools (`F12` > Console) amb `window.api.*`; l'usuari comprova la BD amb `sqlite3`.

## Entorn (verificat)

| Element | Valor |
|---|---|
| SO | Ubuntu Cinnamon 26.04 (VM) sobre amfitrió Ubuntu 24.04 |
| Usuari / host | `lluismb@UbuntuKvm` |
| Carpeta del projecte | `~/Projectes/Lloguers/lloguers/` |
| Carpeta de dades | `~/Lloguers/` (**L majúscula**; conté `lloguers.sqlite`, `config.json` i `documents/`) |
| Node.js | v24.21.0 (instal·lat amb nvm, `nvm install --lts`) |
| npm | 11.19.0 |
| nvm | v0.40.3 |
| g++ | 15.2.0 |
| make | 4.4.1 |
| `curl`, `git`, `python3`, `build-essential` | instal·lats amb apt |
| Electron | 39.8.10 |
| Vite | 7.3.7 |
| electron-builder | 26.15.3 |
| `better-sqlite3` | 13.0.3 |

## Estat actual

**Fases A i B fetes, i prova d'empaquetat anticipada superada.** Toca començar la Fase C de `NOTES.md`.

### Fase A: base (feta)

1. Projecte creat amb `npm create @quick-start/electron@latest` (nom `lloguers`, framework `react`, TypeScript **Yes**).
2. Scripts d'instal·lació d'npm aprovats i permisos del sandbox arreglats (vegeu "Incidències").
3. `better-sqlite3`, `@types/better-sqlite3` i `@electron/rebuild` instal·lats; mòdul compilat contra Electron.
4. `src/main/migrations/001_inicial.sql` (sense la línia `CREATE TABLE sqlite_sequence`).
5. `src/main/database.ts`: connexió a `~/Lloguers/lloguers.sqlite` (`journal_mode = WAL`, `foreign_keys = ON`),
   migracions amb `PRAGMA user_version`, i `export { db, docsDir, DADES }`. Carregat des de `index.ts`.
6. BD existent verificada (4 taules, 2 índexs, 9 triggers, 10 columnes a `contractes`) i marcada
   `user_version = 1` **sense executar** la migració. Còpies de seguretat a `~/Lloguers/` (`.bak`, `.bak2`), fora del repositori.
7. cSpell desactivat per al projecte (`.vscode/settings.json`).

### Fase B: backend al Main Process (feta)

- `src/shared/tipus.ts`: `Immoble`, `ImmobleDades`, `Inquili`, `InquiliDades`, `Idioma`, `Config`,
  `CodiError` (`CONTRACTE_SOLAPAT` | `FK_VIOLADA` | `CHECK_VIOLAT` | `DESCONEGUT`) i `Resultat<T>` amb `error: CodiError`.
  Cap tipus inclou `afegit_el` ni `ultima_mod`.
- `src/main/errors.ts`: `traduirError(e)` i `executar(op)`, que converteix qualsevol operació en un `Resultat<T>`.
- `src/main/inmobles.ts` i `src/main/inquilins.ts` (CRUD amb `SELECT` de columnes explícites). A `inquilins` la
  conversió `0/1/NULL` ↔ `boolean` dels indicadors `ck_tel1_*` es fa només aquí.
- `src/main/config.ts`: llegeix i escriu `~/Lloguers/config.json` (`{ "idioma": "ca" }`); si no existeix o és invàlid, crea el
  valor per defecte des de `app.getLocale()` (fallback `ca`).
- `src/main/ipc/{inmobles,inquilins,config}.ts`, registrats a `index.ts` abans de crear la finestra.
- Preload i `src/preload/index.d.ts` amb `window.api.inmobles`, `.inquilins` i `.config`
  (cal duplicar la forma de l'objecte `api` als dos fitxers cada cop que s'hi afegeix un mètode).
- Provat des de les DevTools: lectura d'immobles i inquilins, crear/actualitzar/eliminar un inquilí de prova
  (`ultima_mod` s'actualitza sola), config (crear, desar, rebuig d'un idioma invàlid). Fila de prova esborrada.

### Prova d'empaquetat anticipada (feta, amb `npm run build:unpack`)

- Migracions incrustades al codi amb `import.meta.glob('./migrations/*.sql', { query: '?raw', import: 'default', eager: true })`.
  Ja no es llegeixen del disc.
- `electron-builder.yml`: `asarUnpack: '{resources/**,node_modules/better-sqlite3/**}'` (**un sol text**) i `snap` tret de `linux.target`.
- Executada l'app empaquetada amb `HOME=/tmp/provahome` (instal·lació des de zero): ha sortit
  `Migració aplicada: 001_inicial.sql`, la BD nova té `user_version = 1` i 4 taules, i la BD real no s'ha tocat.
- `better-sqlite3` 13 porta els binaris a `prebuilds/<plataforma>.node`; ens cal només `linux-x64`.

### Pendent de confirmar

- **Commit** dels canvis a `NOTES.md` i `PROGRES.md` (les dues versions actualitzades).
- Pujar les dues versions noves al projecte de Claude (**tots dos alhora**, perquè no es desquadrin).
- No s'ha vist la sortida del `cmp` de la còpia `lloguers.sqlite.bak2`.

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
- electron-builder avisa que `@electron/rebuild` és una dependència sobrera; és inofensiu. Es pot treure de
  `devDependencies` més endavant.

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

## Pròxim pas

**Fase C, pas 8 de `NOTES.md`: instal·lar Mantine i complements.**

- Paquets previstos: `@mantine/core`, `@mantine/hooks`, `@mantine/form`, `@mantine/dates` (amb `dayjs`),
  `@mantine/notifications` i `@mantine/modals`.
- Seguir la documentació de la **versió instal·lada** (les versions majors han canviat coses).
- Després d'instal·lar, executar `npm install-scripts ls` per si algun paquet nou necessita aprovació.
- Muntar `MantineProvider`, `DatesProvider`, `Notifications` i `ModalsProvider`.

Després: i18n (pas 9), `react-router-dom` i disseny general (pas 10), utilitats de dates i errors (pas 11).

## Altres pendents

- Verificar amb un cas real (pas 15, contractes) que `better-sqlite3` retorna els codis `SQLITE_CONSTRAINT_*`
  que usa `traduirError`. Si no coincideixen, `CONTRACTE_SOLAPAT` no es detectarà.
- `traduirError` fa `console.error('Error de BD no reconegut:')` també per a errors que no són de BD
  (p. ex. l'idioma invàlid). Només cosmètic; ajustar el text si molesta.
- Empaquetat (Fase E): excloure els binaris de `better-sqlite3` d'altres plataformes (opcional), revisar `appId`,
  `maintainer` i el bloc `publish` (apunta a `example.com`), generar `.deb` / AppImage i provar al portàtil Mint.

## Git

- Repositori **ja iniciat i enllaçat amb GitHub** (fet per l'usuari).
