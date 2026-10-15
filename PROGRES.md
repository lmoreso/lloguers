# PROGRES.md: estat del projecte (resum per continuar en un altre xat)

> Complementa `NOTES.md` (decisions, esquema i llista completa de fases) i la guia genèrica d'Electron.
> Aquí només hi ha **què s'ha fet**, **incidències resoltes** i **què toca ara**.
> Quan `NOTES.md` i aquest fitxer difereixin, mana `NOTES.md`.

## Forma de treballar

- L'usuari vol anar **pas a pas**: un pas (o una ordre) cada vegada, esperant que confirmi el resultat abans de passar al següent.
- Idioma de la conversa: **català**.
- Editor: VS Code (veu els errors de TypeScript, ESLint i Prettier directament; no cal demanar-li que els enganxi tots si ho té net, però `npm run typecheck` és útil després de tocar `tsconfig`, `.d.ts` o el preload).
- Control de versions: Git + compte de GitHub (ja configurat a la VM i al portàtil). L'usuari fa ell mateix els commits; se li proposa el missatge i se li recorda mirar el `git status` abans de `git add -A`.
- **Treballa en dos ordinadors** (VM i portàtil Mint) amb GitHub com a única font de veritat: abans de deixar-ne un, `commit` i `push`; en arribar a l'altre, `git pull`. **Les BD no se sincronitzen** (cada màquina té la seva).
- Quan una ordre no mostra res si va bé, o una sortida arriba tallada, demanar-ne la part que falta en lloc de suposar-la. Si l'usuari enganxa només una ordre sense la sortida, demanar la sortida.
- Les proves del backend es fan des de les DevTools (`F12` > Console) amb `window.api.*`; les de la UI, a l'app. L'usuari comprova la BD amb `sqlite3`.
- Les files de prova s'anomenen `PROVA` perquè es localitzin i s'esborrin; **no s'esborra mai cap dels immobles ni inquilins migrats de Base**.
- **No es toca `App.tsx`** (decisió de l'usuari): només tria entre `ProvesMantine` i `lloguers.tsx`. La pantalla principal és `src/renderer/src/lloguers.tsx`.
- La documentació de Mantine que s'ha pogut consultar arriba fins a la v8; l'API de la 9.7.1 (`useForm`, `DatePickerInput`, `Fieldset`, `SimpleGrid`, `modals.openConfirmModal`...) ha funcionat tal com es coneixia, però cal vigilar el `typecheck` en cada component nou.
- **Quan s'enganxen sortides al terminal, no enganxar mai línies que comencin amb `>`** (p. ex. `> lloguers@1.0.0 dev`): el shell les interpreta com una redirecció i crea fitxers buits amb aquests noms. Tampoc enganxar dues ordres amb un `|` entre elles.
- La CLI `sqlite3` arrenca amb les **claus foranes desactivades** i continua executant després d'un error (cal `-bail` en provar migracions). Per tant una prova amb la CLI valida l'SQL, no el comportament amb `foreign_keys = ON` de l'app.
- Les migracions es proven **sempre sobre còpies** (`/tmp/...`) i en dos escenaris: la BD real copiada i una instal·lació des de zero (001 + 002...). Després, l'app amb un `HOME` fals i, només al final, la BD real amb una còpia de seguretat fresca.

## Entorn (verificat)

### VM de desenvolupament

| Element                                                               | Valor                                                                                  |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| SO                                                                    | Ubuntu Cinnamon 26.04 (VM) sobre amfitrió Ubuntu 24.04                                 |
| Usuari / host                                                         | `lluismb@UbuntuKvm`                                                                    |
| Carpeta del projecte                                                  | `~/Projectes/Lloguers/lloguers/`                                                       |
| Carpeta de dades                                                      | `~/Lloguers/` (**L majúscula**; conté `lloguers.sqlite`, `config.json` i `documents/`) |
| Node.js                                                               | v24.21.0 (instal·lat amb nvm, `nvm install --lts`)                                     |
| npm                                                                   | 11.19.0                                                                                |
| g++ / make                                                            | 15.2.0 / 4.4.1                                                                         |
| Electron                                                              | 39.8.10                                                                                |
| Vite                                                                  | 7.3.7                                                                                  |
| electron-builder                                                      | 26.15.3                                                                                |
| `better-sqlite3`                                                      | 13.0.3                                                                                 |
| React                                                                 | 19.3.0                                                                                 |
| Mantine (`core`, `hooks`, `form`, `dates`, `notifications`, `modals`) | 9.7.1 (**totes la mateixa versió**)                                                    |
| `react-router-dom`                                                    | 7.18.4                                                                                 |
| `i18next` + `react-i18next`                                           | instal·lats (versió a `package.json`)                                                  |
| `dayjs`                                                               | instal·lat (per a `@mantine/dates` i els càlculs de dates)                             |
| Repositori                                                            | `https://github.com/lmoreso/lloguers`, branca `main`                                   |

### Portàtil Linux Mint (verificat el 14-10-2026)

| Element                | Valor                                                                                    |
| ---------------------- | ---------------------------------------------------------------------------------------- |
| SO                     | Linux Mint 22.3 (Zena), base Ubuntu 24.04, x86_64                                        |
| Usuari / host          | `lluismb@LENOVO-LLUIS`                                                                   |
| g++ / make / git       | 13.3.0 / 4.3 / 2.43.0                                                                    |
| Node.js / npm          | v24.21.0 / 11.19.0 (nvm, `nvm install --lts`; idèntics a la VM)                          |
| VS Code                | 1.141.1 (`.deb` oficial; extensions ESLint 3.0.34 i Prettier 12.4.0)                     |
| GitHub                 | clau SSH ed25519 (`~/.ssh/id_ed25519`); clonat amb `git@github.com:lmoreso/lloguers.git` |
| Carpeta del projecte   | `~/Projectes/Lloguers/lloguers/`                                                         |
| Carpeta de dades       | `~/Lloguers/` creada per l'app (**BD de proves**, sense dades reals)                     |
| `sqlite3` / DB Browser | instal·lats amb `sudo apt install -y sqlite3 sqlitebrowser`                              |
| `jq`                   | instal·lat el 15-10-2026 (cal per a la comprovació de claus d'i18n)                      |

Com es va instal·lar (ordre seguit):

1. `sudo apt install -y build-essential python3 make g++ git curl`.
2. nvm (`curl ... nvm-sh/nvm/master/install.sh | bash`) i `nvm install --lts`.
3. VS Code (`.deb` amb `sudo apt install ./fitxer.deb`; l'avís `N: La baixada es duu a terme fora de l'entorn segur...` és inofensiu) i extensions amb `code --install-extension`.
4. Git: nom i correu ja configurats; `git config --global init.defaultBranch main`. Clau SSH: `ssh-keygen -t ed25519 -C "lmoreso@yahoo.com"`, afegida a <https://github.com/settings/keys>, i comprovada amb `ssh -T git@github.com`.
5. `git clone`, `npm install`. `npm install-scripts ls` **no mostra res pendent**: les aprovacions viatgen amb el repositori.
6. `chrome-sandbox` de `node_modules/electron/dist/` (`chown root:root` + `chmod 4755`), vegeu la incidència 2.
7. `npm run dev`: l'app crea `~/Lloguers/` i la BD, aplica `001` i `002` (`user_version = 2`), mostra la pantalla de selecció d'idioma i desa `config.json` en confirmar.

## Estat actual

**Fases A, B i C fetes; Fase D feta fins al pas 15 (backend de Contractes completat i provat).** Toca el **pas 16**: UI de Contractes.

### Fase A: base (feta)

Projecte electron-vite (`react` + TypeScript), `better-sqlite3` compilat contra Electron, `database.ts` amb connexió
(`journal_mode = WAL`, `foreign_keys = ON`) i migracions incrustades al codi amb `import.meta.glob`. BD existent
(migrada de Base) marcada `user_version = 1` **sense executar** `001_inicial.sql`. Còpies de seguretat a `~/Lloguers/`
(`*.bak*`, fora del repositori); la còpia `lloguers.dades.migrada_001.sqlite.bak` (versió 1, amb les dades reals) serveix per
tornar a provar la migració 002 des de la BD real. cSpell desactivat al projecte.

### Fase B: backend al Main Process (feta)

- `src/shared/tipus.ts`: `Immoble`, `ImmobleDades`, `Inquili`, `InquiliDades`, `Idioma`, `Config`, `ConfigObtinguda`,
  `CodiError` (`CONTRACTE_SOLAPAT` | `FK_VIOLADA` | `CHECK_VIOLAT` | `DESCONEGUT`) i `Resultat<T>`. Cap tipus inclou
  `afegit_el` ni `ultima_mod`.
- `src/main/errors.ts`: `traduirError(e)` i `executar(op)`. `src/main/{inmobles,inquilins,config}.ts` i
  `src/main/ipc/{inmobles,inquilins,config}.ts`, registrats a `index.ts`. A `inquilins` la conversió `0/1/NULL` ↔
  `boolean` dels indicadors `ck_tel1_*` es fa només al Main.
- Preload i `src/preload/index.d.ts` amb `window.api.*` (cal duplicar la forma de l'objecte `api` als dos fitxers cada cop que
  s'hi afegeix un mètode). Ara hi ha `inmobles`, `inquilins`, `config`, `tipusDocument` i `contractes`.
- Els tres codis `SQLITE_CONSTRAINT_*` que usa `traduirError` **estan verificats amb casos reals**: `_TRIGGER` →
  `CONTRACTE_SOLAPAT`, `_CHECK` → `CHECK_VIOLAT` i `_FOREIGNKEY` → `FK_VIOLADA`.

### Fase C: base de la UI (feta)

- Mantine 9.7.1 (decisió **definitiva**), providers a `main.tsx`: `MantineProvider`, `DatesAmbIdioma`, `ModalsProvider`
  i `Notifications`, amb els estils de `core`, `dates` i `notifications` i els locales de dayjs `ca` i `es`.
- i18n: `src/renderer/src/i18n/{index.ts,i18next.d.ts,ca.json,es.json}`; claus tipades des de `ca.json`. Components
  `SelectorIdioma`, `SeleccioIdioma` i `DatesAmbIdioma` a `src/renderer/src/components/`.
- `react-router-dom` amb **`HashRouter`** (l'app empaquetada es carrega des de `file://`) i menú lateral amb `AppShell`:
  Immobles, Inquilins, Contractes, Configuració i Quant a. Contractes i Quant a només tenen un títol provisional.
- `src/renderer/src/utils/resultat.ts`: `esOk(resposta)` (notifica l'error traduït amb `t('errors.<CODI>')` i retorna
  `false` si ha fallat) i `notificarError`.
- Neteja del CSS de la plantilla: eliminats `main.css`, `base.css`, `Versions.tsx` i els SVG de demostració.
  No s'ha de tornar a posar `user-select: none` (cal poder copiar NIF, telèfons...).

### Fase D: pantalles i contractes

- **Inquilins** (`src/renderer/src/pantalles/{Inquilins,FormulariInquili}.tsx`): taula, alta i edició en modal,
  validació (cal nom o cognoms), eliminació amb confirmació (`modals.openConfirmModal`) i notificacions.
- **Immobles** (`{Immobles,FitxaImmoble,FormulariImmoble}.tsx`): llista; formulari en pantalla pròpia amb quatre seccions
  (`/immobles/nou`, `/immobles/:id`); dates amb `DatePickerInput` (treballa amb text `AAAA-MM-DD`, **no cal conversió `Date`**);
  eliminació amb confirmació; avís de caducitats (certificat i cèdula) a **60 dies** (`DIES_AVIS` a `utils/caducitat.ts`).
- Les dates d'auditoria són en UTC (a Barcelona es veuen 1 o 2 hores menys al `sqlite3`); correcte, es convertiran a hora
  local només quan es mostrin a la UI.

**Pas 15: Contractes (backend), complet.**

- **15a, idioma al primer arrencament.** `IDIOMES` (constant única a `tipus.ts`, `Idioma` en deriva) i `idiomaNom` a cada JSON.
  `config:obtenir` retorna `{ idioma, confirmat }` i **no escriu res**: si `config.json` no existeix o és invàlid retorna
  l'idioma del sistema (`app.getLocale()`, fallback `ca`) com a no confirmat. Si no és confirmat, `main.tsx` mostra
  `SeleccioIdioma` (un botó per idioma pel seu nom propi; títol i botó en l'idioma ressaltat; només es desa en confirmar).
  Logs `[idioma]` a la terminal (Main) i a les DevTools (Renderer). Provat: fitxer vàlid, absent i amb `"fr"`.
  `app.getLocale()` retorna `"ca"` a la VM i al portàtil; la branca "idioma del sistema no suportat" no s'ha pogut provar.
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
- **15d, backend de Contractes.** Tipus `Contracte`, `ContracteDades` (sense `lloguer_actual`, `data_ultima_revisio` ni
  devolució), `ContracteLlistat` (amb els dos inquilins); `src/main/contractes.ts` (CRUD, `JOIN` + `LEFT JOIN`, accions
  `tancarContracte` i `revisarLloguer`) i `src/main/ipc/contractes.ts`. En crear, el Main fixa `lloguer_actual =
lloguer_inicial` i `data_ultima_revisio = data_inici`; en actualitzar, `id_inmoble` s'ignora i, mentre no s'ha revisat mai,
  s'arrossega el lloguer i la data. Provat des de les DevTools: solapament (vigent, dia final inclusiu, `UPDATE`),
  els `CHECK` (4 casos), `FK_VIOLADA` en eliminar immoble o inquilins amb contractes, arrossegament, Revisar lloguer,
  Tancar (data anterior a l'inici, `null`), i el llistat amb segon inquilí. Files de prova esborrades.

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

### Pendent de confirmar

- **Commit** de l'edició de la 002 (`IS` en lloc d'`=`) i dels canvis a `NOTES.md`; i `git push`. No consta que s'hagi fet.
- Aplicar a `NOTES.md`: marcar el **15d** com a fet; corregir `CHECK (date(x) = x)` → `IS` als tres llocs (convencions de la BD,
  regles de contractes) i afegir l'excepció de la 002 al punt de les migracions.
- **Portàtil**: `git pull`, `npm install`, `npm install-scripts ls`, i **esborrar la seva BD de proves** (té la 002 antiga i
  contractes de prova): `mv ~/Lloguers/lloguers.sqlite ~/Lloguers/lloguers.sqlite.vella`, esborrar `-wal`/`-shm` i arrencar
  perquè l'app la creï amb la 001 + 002. Comprovar `user_version = 2`, 7 tipus, 3/5/11 i que `'2025-1-1'` es rebutja.
- Pujar `NOTES.md` i `PROGRES.md` al projecte de Claude (**tots dos alhora**).

## Pròxim pas

**Fase D, pas 16: Contractes (UI, fase 1)** (vegeu `NOTES.md`, "Contractes: disseny funcional > Interfície"). Proposta de trossos:

1. Claus de text (`contractes.*`) i botó "Contractes" a cada fila d'Immobles, amb la ruta `/immobles/:id/contractes`.
   Treure l'entrada provisional "Contractes" del menú (s'hi entra només des d'Immobles; el menú "Contractes vigents" és de la fase 3).
2. Llista de contractes de l'immoble (l'últim primer, nom dels dos inquilins, etiqueta _vigent_ / _tancat_).
3. Formulari en pantalla pròpia, per seccions (dades, fiança): immoble fix i no modificable, selector d'inquilí cercable i segon
   inquilí opcional; `lloguer_actual` i `data_ultima_revisio` de només lectura en editar. Les dades de devolució NO hi són (fase 2).
4. Accions **Tancar** (demana `data_fi`) i **Revisar lloguer** (import i data alhora; l'import pot ser igual).
5. Confirmació en editar un contracte tancat; eliminar amb confirmació que avisa que s'esborren fiança i documents.
6. Avisos de fi prevista (90 dies, també un cop passada) i de revisió de lloguer (30 dies abans de l'aniversari, també passat),
   només per a contractes vigents, amb constants a `utils/caducitat.ts`.

Després: Documents (backend i UI, passos 17 i 18), Fase 2 (devolució de la fiança) i Fase 3 (canvi de signants, correcció de
l'immoble d'un contracte, menú Contractes vigents).

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

## Altres pendents

- `traduirError` fa `console.error('Error de BD no reconegut:')` també per a errors que no són de BD
  (p. ex. l'idioma invàlid o les validacions de `tancarContracte`/`revisarLloguer`). Només cosmètic.
- Configuració només té el selector d'idioma, i Quant a només el títol (la versió es pot llegir de `package.json`).
- `ProvesMantine.tsx` i `App.tsx.bak` són de l'usuari; decidir més endavant si s'esborren.
- Pantalla per crear i editar tipus de document (a Configuració): fora de la fase 1.
- Fase 2: devolució de la fiança (model 3). Fase 3: canvi de signants (annex), correcció de l'immoble d'un contracte
  (ara només es pot eliminar i recrear, i això perd els documents), menú "Contractes vigents", historial de revisions.
- `eliminarContracte` encara no esborra els fitxers del disc (no n'hi ha cap fins al pas 17).
- Empaquetat (opcional): excloure els binaris de `better-sqlite3` d'altres plataformes per reduir la mida.

## Git

- Repositori **enllaçat amb GitHub** (`lmoreso/lloguers`, branca `main`). Últim estat verificat a la VM (15-10-2026): al dia amb
  `origin/main` al commit `04c0206` ("Contractes: backend (tipus, CRUD, accions Tancar i Revisar lloguer, IPC); proves parcials"),
  precedit per "Sembrat dels tipus de document a l'arrencada" i "Tipus de document: classes, sembrat i IPC". Després d'això
  s'ha editat la migració 002 i `NOTES.md`; **falta el commit** (vegeu "Pendent de confirmar").
