# PROGRES.md: estat del projecte (resum per continuar en un altre xat)

> Complementa `NOTES.md` (decisions i esquema) i la guia genèrica d'Electron.
> Aquí només hi ha **què s'ha fet** i **què queda**.

## Forma de treballar

- L'usuari vol anar **pas a pas**: un pas (o una ordre) cada vegada, esperant que confirmi el resultat abans de passar al següent.
- Idioma de la conversa: **català**.
- Editor: VS Code. Control de versions: Git + compte de GitHub (ja configurat).

## Entorn (verificat)

| Element | Valor |
|---|---|
| SO | Ubuntu Cinnamon 26.04 (VM) sobre amfitrió Ubuntu 24.04 |
| Usuari / host | `lluismb@UbuntuKvm` |
| Carpeta del projecte | `~/Projectes/Lloguers/lloguers/` |
| Node.js | v24.21.0 (instal·lat amb nvm, `nvm install --lts`) |
| npm | 11.19.0 |
| nvm | v0.40.3 |
| g++ | 15.2.0 |
| make | 4.4.1 |
| `curl`, `git`, `python3`, `build-essential` | instal·lats amb apt |

## Fet: pas 1 dels pròxims passos (completat)

1. Instal·lats `curl` i `git` (apt).
2. Instal·lat **nvm** i, amb ell, **Node LTS**.
3. Instal·lades les eines de compilació (`python3 make g++ build-essential`).
4. Creat el projecte amb `npm create @quick-start/electron@latest`:
   nom `lloguers`, framework `react`, TypeScript **Yes**, sense updater ni mirror.
5. `npm install` fet dins de `lloguers/`.
6. Aprovats els scripts d'instal·lació d'npm (vegeu "Incidències").
7. Arreglats els permisos del sandbox d'Electron (vegeu "Incidències").
8. **`npm run dev` arrenca i mostra la finestra de la plantilla.** Funciona.

## Versions reals vs. la guia

La guia genèrica és antiga respecte al que s'ha instal·lat:

- Electron **39.8.10** (la guia diu 33), Vite **7.3.7** (la guia diu 5).
- La plantilla genera `electron-builder.yml` pròpiament: la configuració de distribució **no va dins de `package.json`** com diu la guia.
- La plantilla porta ESLint (`eslint.config.mjs`) i Prettier.
- Fitxers `tsconfig`: `tsconfig.json`, `tsconfig.node.json` i `tsconfig.web.json`. La guia només en menciona un, així que quan toqui declarar `electron.d.ts`, cal comprovar a quin d'ells s'ha d'incloure (probablement `tsconfig.web.json`, que és el del renderer).

## Incidències resoltes (cal repetir-les si es reinstal·la)

### 1. npm bloqueja els scripts d'instal·lació
Les versions noves d'npm no executen els `postinstall` fins que s'aproven. Decisions preses:

```bash
npm install-scripts approve electron
npm install-scripts approve esbuild
npm install-scripts deny electron-winstaller   # només per a Windows, no el necessitem
```

**Pendent d'esperar:** `better-sqlite3` també tindrà un script d'instal·lació (compila el mòdul natiu). Probablement caldrà `npm install-scripts approve better-sqlite3`.

### 2. Error de sandbox en arrencar Electron
Error: `The SUID sandbox helper binary was found, but is not configured correctly`.
Solució (des de la carpeta del projecte):

```bash
sudo chown root:root node_modules/electron/dist/chrome-sandbox
sudo chmod 4755 node_modules/electron/dist/chrome-sandbox
```

Es perd si es reinstal·la Electron (p. ex. `rm -rf node_modules` + `npm install`). Cal repetir-ho llavors.

## Pendent immediat: continuació del pas 2

`better-sqlite3` **encara no està instal·lat**. Ordre previst:

1. Instal·lar `better-sqlite3`, `@types/better-sqlite3` i, si cal, `@electron/rebuild`.
   Aprovar l'script d'instal·lació de `better-sqlite3`.
2. Recompilar el mòdul natiu contra Electron (`npx electron-rebuild -f -w better-sqlite3`), o bé afegir `"postinstall": "electron-builder install-app-deps"` a `scripts`. Si falla amb Electron 39, mirar la combinació de versions.
3. Comprovar que `npm run dev` segueix arrencant amb el mòdul instal·lat.
4. Obtenir el fitxer **`001_inicial.sql`** (no era al projecte la primera vegada: cal pujar-lo o enganxar-lo) i col·locar-lo a `src/main/migrations/001_inicial.sql`.
5. Escriure `src/main/database.ts` amb: carpeta `~/lloguers/`, connexió amb `foreign_keys = ON` i `journal_mode = WAL`, i sistema de migracions amb `PRAGMA user_version` (vegeu `NOTES.md`).

## Pròxims passos (de `NOTES.md`, sense canvis)

1. ~~Crear el projecte amb electron-vite i instal·lar `better-sqlite3`.~~ (projecte creat; falta `better-sqlite3`)
2. Afegir `001_inicial.sql` i el sistema de migracions a `database.ts`.
3. CRUD d'`inmobles` i `inquilins` (IPC + preload + tipus).
4. Contractes amb gestió d'errors de solapament.
5. Documents: diàleg d'adjuntar, còpia a `documents/`, obrir i esborrar.
6. Distribució amb electron-builder (`.deb` / AppImage) per al portàtil Mint.

## Altres pendents

- Obrir el projecte amb VS Code (`code .` des de la carpeta del projecte).

## Git

- Repositori **ja iniciat i enllaçat amb GitHub** (fet per l'usuari).
