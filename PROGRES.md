# PROGRES.md: estat del projecte (resum per continuar en un altre xat)

> Complementa `NOTES.md` (decisions, esquema i llista completa de fases) i la guia genèrica d'Electron.
> Aquí només hi ha **què s'ha fet**, **incidències resoltes** i **què toca ara**.
> Quan `NOTES.md` i aquest fitxer difereixin, mana `NOTES.md`.

## Forma de treballar

- L'usuari vol anar **pas a pas**: un pas (o una ordre) cada vegada, esperant que confirmi el resultat abans de passar al següent.
- Idioma de la conversa: **català**.
- Editor: VS Code (veu els errors de TypeScript, ESLint i Prettier directament; no cal demanar-li que els enganxi tots si ho té net, però `npm run typecheck` és útil després de tocar `tsconfig`, `.d.ts` o el preload).
- Control de versions: Git + compte de GitHub (ja configurat a la VM i al portàtil). L'usuari fa ell mateix els commits; se li proposa el missatge i se li recorda mirar el `git status` abans de `git add -A`.
- Quan una ordre no mostra res si va bé, o una sortida arriba tallada, demanar-ne la part que falta en lloc de suposar-la.
- Les proves del backend es fan des de les DevTools (`F12` > Console) amb `window.api.*`; les de la UI, a l'app. L'usuari comprova la BD amb `sqlite3`.
- Les files de prova s'anomenen `PROVA` perquè es localitzin i s'esborrin; **no s'esborra mai cap dels immobles ni inquilins migrats de Base**.
- **No es toca `App.tsx`** (decisió de l'usuari): només tria entre `ProvesMantine` i `lloguers.tsx`. La pantalla principal és `src/renderer/src/lloguers.tsx`.
- La documentació de Mantine que s'ha pogut consultar arriba fins a la v8; l'API de la 9.7.1 (`useForm`, `DatePickerInput`, `Fieldset`, `SimpleGrid`, `modals.openConfirmModal`...) ha funcionat tal com es coneixia, però cal vigilar el `typecheck` en cada component nou.
- **Quan s'enganxen sortides al terminal, no enganxar mai línies que comencin amb `>`** (p. ex. `> lloguers@1.0.0 dev`): el shell les interpreta com una redirecció i crea fitxers buits amb aquests noms (`electron-vite`, `lloguers@1.0.0`). Tampoc enganxar dues ordres amb un `|` entre elles: la segona rep la sortida de la primera.

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
| Carpeta de dades | `~/Lloguers/` creada per l'app (BD començada de zero) |
| `sqlite3` / DB Browser | instal·lats amb `sudo apt install -y sqlite3 sqlitebrowser` |

Com es va instal·lar (ordre seguit):

1. `sudo apt install -y build-essential python3 make g++ git curl`.
2. nvm (`curl ... nvm-sh/nvm/master/install.sh | bash`) i `nvm install --lts`.
3. VS Code (`.deb` amb `sudo apt install ./fitxer.deb`; l'avís `N: La baixada es duu a terme fora de l'entorn segur...` és inofensiu) i extensions amb `code --install-extension`.
4. Git: nom i correu ja configurats; `git config --global init.defaultBranch main`. Clau SSH: `ssh-keygen -t ed25519 -C "lmoreso@yahoo.com"`, afegida a <https://github.com/settings/keys>, i comprovada amb `ssh -T git@github.com`. No cal iniciar sessió a GitHub des de VS Code.
5. `git clone`, `npm install`. `npm install-scripts ls` **no mostra res pendent**: les aprovacions viatgen amb el repositori. `better-sqlite3` porta `prebuilds/linux-x64.node` i Electron es descarrega bé.
6. `chrome-sandbox` de `node_modules/electron/dist/` (`chown root:root` + `chmod 4755`), vegeu la incidència 2.
7. `npm run dev`: l'app crea `~/Lloguers/` i la BD, aplica `001` i `002` (`user_version = 2`, taules `contractes`, `documents_contracte`, `inmobles`, `inquilins`, `tipus_document`), mostra la pantalla de selecció d'idioma i desa `config.json`.

## Estat actual

**Fases A, B i C fetes; Fase D fins al pas 14 (Inquilins i Immobles completes) i els blocs 15a i 15b fets; prova d'empaquetat al portàtil feta.**

Cal verificar al codi si els blocs **15c** (classes i sembrat de tipus de document) i **15d** (backend de Contractes) ja estan fets: el repositori anava per davant d'aquest fitxer (vegeu "Pròxim pas").

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

### Fase D: pantalles i contractes

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
- **15a (idioma al primer arrencament): fet.** Confirmat pels logs d'arrencada (`[idioma] config.json no existeix; per defecte
  "ca" (no confirmat, no s'escriu res)`), per la pantalla de selecció que es mostra i per l'últim commit
  "Idioma al primer arrencament: confirmació, pantalla de selecció i logs".
- **15b (migració 002): feta.** Confirmat pel log `Migració aplicada: 002_contractes_documents.sql`, per `user_version = 2`
  amb la taula `tipus_document` present i pel commit "Migració 002: contractes ampliats, tipus_document i documents amb tipus".
- L'eliminació d'un immoble o inquilí **amb contractes** (error `FK_VIOLADA`) encara no s'ha pogut provar: no hi ha contractes.

### Fase E: empaquetat (feta al portàtil)

Prova d'empaquetat anticipada a la VM (`npm run build:unpack`): migracions incrustades; `asarUnpack: '{resources/**,node_modules/better-sqlite3/**}'`
(**un sol text**); `snap` tret de `linux.target`. L'app empaquetada, executada amb `HOME=/tmp/provahome` (instal·lació des de
zero), va aplicar `001_inicial.sql`, va deixar la BD a `user_version = 1` amb 4 taules i no va tocar la BD real.
`better-sqlite3` 13 porta els binaris a `prebuilds/<plataforma>.node`; ens cal només `linux-x64`.

Al portàtil (14-10-2026):

- `electron-builder.yml`: `appId: com.lmoreso.lloguers`, `maintainer: 'Lluis Moreso Bosch <lmoreso@yahoo.com>'`
  i bloc `publish` **eliminat** (no hi ha `electron-updater` ni `autoUpdater` al codi). Resta igual: `asarUnpack` en un sol
  text, `linux.target` = `AppImage` + `deb`, `npmRebuild: false`.
- `package-lock.json`: l'`npm install` va afegir `"hasInstallScript": true` a `better-sqlite3` (sense canvi de versió); commitejat.
- `npm run build:linux` genera `dist/lloguers_1.0.0_amd64.deb` (98 MB) i `dist/lloguers-1.0.0.AppImage` (126 MB).
  `dist/` ja és ignorat per `.gitignore`.
- **Prova del `.deb`**: s'instal·la a `/opt/lloguers` amb `sudo apt install ./dist/lloguers_1.0.0_amd64.deb`, s'executa
  amb `lloguers`, llegeix `config.json` (`"ca" (confirmat)`) i va permetre crear un inquilí. Desinstal·lat després
  (`apt remove`; `dpkg -l` mostra l'estat `rc`, restes de configuració; `sudo apt purge lloguers` el treu de la llista).
- **Prova de l'AppImage**: `./dist/lloguers-1.0.0.AppImage` arrenca sense errors de FUSE ni de sandbox.
- **Observació sobre el `chrome-sandbox`**: el del `.deb` instal·lat (`/opt/lloguers/chrome-sandbox`) té mode `-rwxr-xr-x`,
  **sense SUID**, i l'app va arrencar igualment a Mint 22.3. No s'ha investigat el motiu (pot ser que el sistema permeti la
  sandbox per espais de noms d'usuari, però no està verificat). A la VM sí que va caldre el SUID. Si falla en un altre equip
  amb l'error del SUID, aplicar l'arreglat de la incidència 2 sobre `/opt/lloguers/chrome-sandbox`, o valorar un script `afterInstall`.

### Pendent de confirmar

- **Commit** d'aquest `PROGRES.md` i dels canvis a `NOTES.md` (passos 15a, 15b, 19 i 20), i `git push`.
- Pujar les dues versions noves al projecte de Claude (**tots dos alhora**, perquè no es desquadrin).
- No s'ha vist la sortida del `cmp` de la còpia `lloguers.sqlite.bak2`.
- Aplicar a `NOTES.md` les dues lliçons del pas 14 (formularis llargs i números al formulari) si no s'han fet ja.
- El portàtil té un inquilí de prova a la seva BD (que és només de proves).

## Pròxim pas

**Primer, verificar què hi ha fet de 15c i 15d al codi** (el repositori anava per davant d'aquest fitxer), per exemple:

```bash
git log --oneline -15
ls src/main src/main/ipc
grep -n "classe\|CLASSES" src/shared/tipus.ts
```

Segons el resultat, es continua amb el que falti.

**15c: classes i sembrat de tipus de document** (vegeu `NOTES.md`): llista de classes a `tipus.ts`, claus `documents.classes.*`
als JSON, IPC de sembrat, validació de classes al Main.

**15d: Contractes (backend).**

- Tipus a `src/shared/tipus.ts`: `Contracte`, `ContracteDades` i `ContracteLlistat` (sense `afegit_el` ni `ultima_mod`),
  amb els camps nous de la migració 002 (segon inquilí, `lloguer_actual`, `data_ultima_revisio`, fiança, devolució).
- `src/main/contractes.ts` (CRUD amb `SELECT` de columnes explícites, `JOIN` amb `inquilins`, regles del lloguer i la
  revisió), `src/main/ipc/contractes.ts`, registre a `index.ts`, preload i `index.d.ts`.
- **Provar els triggers de solapament amb dades de prova**, des de les DevTools: dos contractes de la mateixa finca amb períodes
  que se solapen (ha de sortir `CONTRACTE_SOLAPAT`); el dia final és inclusiu (un contracte que acaba el 31-03 permet que el
  següent comenci l'01-04); `data_fi` buida es tracta com `9999-12-31`; el solapament amb un `UPDATE` també ha de fallar.
- **Verificar que `better-sqlite3` retorna els codis `SQLITE_CONSTRAINT_*`** que usa `traduirError`
  (`..._TRIGGER` → `CONTRACTE_SOLAPAT`, `..._FOREIGNKEY` → `FK_VIOLADA`, `..._CHECK` → `CHECK_VIOLAT`). Si no coincideixen,
  `CONTRACTE_SOLAPAT` no es detectarà. Provar també els `CHECK` de dates i els nous (`id_inquili_2 <> id_inquili`,
  parelles de fiança, devolució només amb contracte tancat, `data_ultima_revisio >= data_inici`).
- Provar que eliminar un immoble o un inquilí amb contractes dona `FK_VIOLADA`.
- Esborrar les files de prova al final.

Després: Contractes (UI, pas 16), Documents (backend i UI, passos 17 i 18) i el que quedi de la Fase E
(opcional: excloure els binaris de `better-sqlite3` d'altres plataformes).

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

Les aprovacions viatgen amb el repositori: en clonar-lo al portàtil, `npm install-scripts ls` ja no mostrava res pendent
i no va caldre repetir-les. Si algun cop `better-sqlite3` no queda compilat, forçar-ho amb `npm rebuild better-sqlite3`
(compila contra el Node del sistema; el `postinstall` de la plantilla s'encarrega de la versió d'Electron).
Després de cada `npm install` de paquets nous, executar `npm install-scripts ls`.

### 2. Error de sandbox en arrencar Electron

Error: `The SUID sandbox helper binary was found, but is not configured correctly`.
Solució (des de la carpeta del projecte):

```bash
sudo chown root:root node_modules/electron/dist/chrome-sandbox
sudo chmod 4755 node_modules/electron/dist/chrome-sandbox
```

Es perd si es reinstal·la Electron (p. ex. `rm -rf node_modules` + `npm install`). Cal repetir-ho llavors.
S'ha aplicat també al portàtil. L'app empaquetada a `dist/linux-unpacked/` necessita el mateix sobre el seu propi
`chrome-sandbox`. Vegeu l'observació de la Fase E sobre el `.deb` instal·lat.

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
(una vegada es va malmetre en editar-lo i va caldre substituir-lo sencer; el fitxer acaba sense salt de línia final).

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

### 10. Fitxers buits `electron-vite` i `lloguers@1.0.0` a l'arrel

Apareixen a `git status` com a no seguits. Són el resultat d'enganxar al terminal línies de sortida que comencen amb `>`
(`> lloguers@1.0.0 dev`, `> electron-vite dev`): el shell les executa com una redirecció. Solució: `rm electron-vite lloguers@1.0.0`
(comprovant abans amb `ls -l` que fan 0 bytes).

## Altres pendents

- `traduirError` fa `console.error('Error de BD no reconegut:')` també per a errors que no són de BD
  (p. ex. l'idioma invàlid). Només cosmètic; ajustar el text si molesta.
- Configuració només té el selector d'idioma, i Quant a només el títol (la versió es pot llegir de `package.json`).
- `ProvesMantine.tsx` i `App.tsx.bak` són de l'usuari; decidir més endavant si s'esborren (`App.tsx.bak` es va fer fora de
  Git: comprovar-ho amb `git status` abans de `git add -A`).
- Empaquetat (opcional): excloure els binaris de `better-sqlite3` d'altres plataformes per reduir la mida.

## Git

- Repositori **ja iniciat i enllaçat amb GitHub** (`lmoreso/lloguers`, branca `main`). A la VM, fet per l'usuari; al portàtil,
  clonat per SSH. Últim estat verificat al portàtil (14-10-2026): `## main...origin/main`, net, amb els commits
  "package-lock: marca hasInstallScript a better-sqlite3", "Migració 002: contractes ampliats, tipus_document i documents amb tipus"
  i "Idioma al primer arrencament: confirmació, pantalla de selecció i logs", més el de `electron-builder.yml`
  (proves d'empaquetat al portàtil Mint).
