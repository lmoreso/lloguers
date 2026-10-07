# PROGRES.md: estat del projecte (resum per continuar en un altre xat)

> Complementa `NOTES.md` (decisions, esquema i llista completa de fases) i la guia genèrica d'Electron.
> Aquí només hi ha **què s'ha fet**, **incidències resoltes** i **què toca ara**.
> Quan `NOTES.md` i aquest fitxer difereixin, mana `NOTES.md`.

## Forma de treballar

- L'usuari vol anar **pas a pas**: un pas (o una ordre) cada vegada, esperant que confirmi el resultat abans de passar al següent.
- Idioma de la conversa: **català**.
- Editor: VS Code (veu els errors de TypeScript, ESLint i Prettier directament; no cal demanar-li que els enganxi tots si ho té net, però `npm run typecheck` és útil després de tocar `tsconfig`).
- Control de versions: Git + compte de GitHub (ja configurat). L'usuari fa ell mateix els commits; se li proposa el missatge.

## Entorn (verificat)

| Element | Valor |
|---|---|
| SO | Ubuntu Cinnamon 26.04 (VM) sobre amfitrió Ubuntu 24.04 |
| Usuari / host | `lluismb@UbuntuKvm` |
| Carpeta del projecte | `~/Projectes/Lloguers/lloguers/` |
| Carpeta de dades | `~/Lloguers/` (**L majúscula**; conté `lloguers.sqlite` i `documents/`) |
| Node.js | v24.21.0 (instal·lat amb nvm, `nvm install --lts`) |
| npm | 11.19.0 |
| nvm | v0.40.3 |
| g++ | 15.2.0 |
| make | 4.4.1 |
| `curl`, `git`, `python3`, `build-essential` | instal·lats amb apt |
| Electron | 39.8.10 |
| Vite | 7.3.7 |
| `better-sqlite3` | 13.0.3 |

## Estat actual

**Fase A (base) feta.** Falta començar la Fase B de `NOTES.md`.

### Fet

1. Entorn preparat i projecte creat amb `npm create @quick-start/electron@latest`
   (nom `lloguers`, framework `react`, TypeScript **Yes**, sense updater ni mirror).
2. Scripts d'instal·lació d'npm aprovats (vegeu "Incidències") i permisos del sandbox d'Electron arreglats.
3. `better-sqlite3`, `@types/better-sqlite3` i `@electron/rebuild` instal·lats; `better-sqlite3` compilat contra Electron.
   `npm run dev` arrenca amb el mòdul instal·lat. Commit i push fets.
4. `001_inicial.sql` a `src/main/migrations/`, amb la línia `CREATE TABLE sqlite_sequence` eliminada.
5. `src/main/database.ts`: connexió a `~/Lloguers/lloguers.sqlite` (`journal_mode = WAL`, `foreign_keys = ON`),
   sistema de migracions amb `PRAGMA user_version`, i `export { db, docsDir }`. Carregat des de `src/main/index.ts`
   amb `import './database'`. Commit fet.
6. BD existent verificada (4 taules, 2 índexs, 9 triggers, 10 columnes a `contractes`, sense `ruta_contracte`)
   i marcada amb `PRAGMA user_version = 1` **sense executar** la migració.
   Còpia de seguretat feta a `~/Lloguers/lloguers.sqlite.bak` (fora del repositori).
7. `src/shared/tipus.ts` amb `Immoble` i `ImmobleDades` (sense `afegit_el` ni `ultima_mod`).
   `src/shared/**/*` afegit a l'`include` de `tsconfig.node.json` i `tsconfig.web.json`; `npm run typecheck` net.
8. `src/main/inmobles.ts` amb el CRUD (`obtenirInmobles`, `obtenirInmoble`, `crearInmoble`,
   `actualitzarInmoble`, `eliminarInmoble`). `SELECT` amb columnes explícites; `INSERT`/`UPDATE` no toquen els camps d'auditoria.
9. cSpell desactivat per al projecte a `.vscode/settings.json` (`"cSpell.enabled": false`).
10. `Resultat<T>` afegit al final de `src/shared/tipus.ts`.
11. `NOTES.md` revisat i corregit (4 incoherències resoltes; vegeu `NOTES.md` per a l'estat final).

### Pendent de confirmar

- **Commit** dels punts 7 a 10 (`tipus.ts`, `tsconfig`, `inmobles.ts`, `settings.json`). L'últim commit confirmat és el de `database.ts`.
- Aplicar a `NOTES.md` els tres retocs menors de l'última revisió (redacció de "Entorn", línia llarga de
  `user_version` i indentació del bloc d'estructura d'i18n), si no s'han fet ja.

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

### 3. Error TypeScript 4023 a `database.ts`

`Exported variable 'db' has or is using name 'BetterSqlite3.Database'... but cannot be named.`
Solució: importar el tipus i anotar la variable.

```ts
import type { Database as DatabaseType } from 'better-sqlite3'
const db: DatabaseType = new Database(dbPath)
```

## Pròxim pas

**Fase B, pas 1 de `NOTES.md`: codis d'error.**

- Canviar `Resultat<T>` a `src/shared/tipus.ts` perquè porti `error: CodiError` (ara porta `error: string`, que
  contradiu la decisió d'i18n) i definir `CodiError` com a unió de codis:
  `CONTRACTE_SOLAPAT`, `FK_VIOLADA`, `CHECK_VIOLAT`, `DESCONEGUT`.
- Crear `src/main/errors.ts` amb `traduirError(e)`: `SQLITE_CONSTRAINT_TRIGGER` → `CONTRACTE_SOLAPAT`,
  `..._FOREIGNKEY` → `FK_VIOLADA`, `..._CHECK` → `CHECK_VIOLAT`, resta → `DESCONEGUT`.
  Comprovar amb una prova real que `better-sqlite3` retorna aquests noms de codi.

Després: handlers IPC d'`inmobles` (pas 2), preload i `window.api.inmobles` (pas 3) i prova des de les DevTools (pas 4).

## Altres pendents

- Empaquetat (Fase E): `migracionsDir` apunta a `src/main/migrations` i només funciona en desenvolupament.
  Cal incloure les migracions com a recurs o amb `?raw` de Vite, i fer `asarUnpack` de `better-sqlite3`.
  Opcional: fer una prova d'empaquetat anticipada després del pas 7 de la Fase B, per detectar-ho aviat.

## Git

- Repositori **ja iniciat i enllaçat amb GitHub** (fet per l'usuari).
