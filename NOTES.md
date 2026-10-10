# NOTES.md: context i decisions del projecte

> Aquestes decisions tenen **prioritat** sobre la guia genèrica d'Electron del projecte
> (`Guia Electron + React + Vite + TypeScript + SQLite`). Vegeu la secció "Diferències amb la guia".

## Objectiu

Aplicació d'escriptori per gestionar lloguers (immobles, inquilins i contractes), que substitueix
una base de dades de LibreOffice Base. Les dades de `Inmobles` i `Inquilins` ja s'han migrat a
SQLite; `Contractes` estava buida.

## Entorn

- Desenvolupament: VM Ubuntu Cinnamon 26.04 sobre amfitrió Ubuntu 24.04.
- Destí: la mateixa VM i/o un portàtil amb Linux Mint.
- Stack: Electron + React + Vite (electron-vite) + TypeScript + SQLite (`better-sqlite3`).
- Eines de BD: DB Browser for SQLite i CLI `sqlite3`.
- Idioma de referència de la interfície i dels noms de taules/columnes: **català** (excepte
  `inmobles`, que conserva el nom original de Base). La interfície també es ofereix en castellà
  (vegeu "Multiidioma").
- VS Code amb cSpell desactivat per al projecte (`.vscode/settings.json`): el projecte és en català.

## Ubicació de les dades

Tot penja d'una sola carpeta, per facilitar còpies de seguretat i portabilitat:

```
~/Lloguers/
├── lloguers.sqlite
└── documents/
    └── <id_contracte>/
        └── <id_document>_<nom_segur>.<ext>
```

```ts
const DADES   = path.join(app.getPath('home'), 'Lloguers')
const dbPath  = path.join(DADES, 'lloguers.sqlite')
const docsDir = path.join(DADES, 'documents')
```

- A la BD, `documents_contracte.ruta` guarda **només la ruta relativa** (`documents/1/xxx.pdf`).
- Abans d'obrir un fitxer, comprovar que la ruta resolta queda **dins de `documents/`** (evitar `..`).
- Esborrar un document o un contracte ha d'**esborrar també el fitxer del disc** (la BD no ho fa).
- Obrir fitxers amb `shell.openPath()`; triar-ne amb `dialog.showOpenDialog` (selecció múltiple) i
  copiar-los amb `fs.copyFile`.

## Convencions de la BD

- `PRAGMA foreign_keys = ON` a **cada connexió** (i `journal_mode = WAL`).
- Dates com a text ISO `AAAA-MM-DD`, validades amb `CHECK (date(x) = x)`.
- Booleans com a `INTEGER` 0/1 amb `CHECK (x IN (0,1))`.
- Imports i superfícies: `NUMERIC`. Punt decimal.
- `afegit_el` i `ultima_mod` a **totes** les taules, en **UTC** (`datetime('now')`), mantinguts per
  triggers. A la interfície, convertir a hora local per mostrar-les.
- **L'app no veu els camps d'auditoria.** Els tipus TypeScript no inclouen `afegit_el` ni
  `ultima_mod`; els `SELECT` llisten les columnes explícitament (mai `SELECT *`) i els `INSERT`
  i `UPDATE` no els toquen. Si l'app escrivís `ultima_mod`, el trigger no s'activaria, perquè
  només actua quan `NEW.ultima_mod IS OLD.ultima_mod`.
- Esquema versionat amb `PRAGMA user_version` i fitxers a `src/main/migrations/`
  (`001_inicial.sql`, `002_...sql`, ...). No editar mai una migració ja aplicada.
  La BD original (migrada de Base) es va marcar amb `PRAGMA user_version = 1` **sense executar**
  `001_inicial.sql`, perquè ja tenia aquest esquema. Una instal·lació nova la executarà normalment.

## Taules

| Taula | Descripció |
|---|---|
| `inmobles` | Immobles: adreça, referència cadastral, superfícies, certificat energètic i cèdula d'habitabilitat (registre, data, caducitat). |
| `inquilins` | Inquilins: nom, cognoms, NIF, telèfon i indicadors WhatsApp/Bizum (`ck_tel1_wassap`, `ck_tel1_bizum`). |
| `contractes` | Històric de contractes. Clau pròpia `id`. FK a `inmobles` i `inquilins`. |
| `documents_contracte` | Documents adjunts d'un contracte (0..N). FK amb `ON DELETE CASCADE`. |

Els `CREATE TABLE` definitius són a `001_inicial.sql` (bolcat amb `sqlite3 lloguers.sqlite ".schema"`).
Se n'ha **eliminat la línia `CREATE TABLE sqlite_sequence`**: és una taula interna que SQLite crea
sola per als `AUTOINCREMENT`, i intentar crear-la fa fallar la migració.

## Regles de negoci

- **Un immoble no pot tenir contractes amb períodes solapats.** Es fa complir amb dos triggers
  (`contractes_no_solapar_ins` i `contractes_no_solapar_upd`).
  - `data_fi` buida = contracte **vigent** (es tracta com `9999-12-31`).
  - El **dia final és inclusiu**: si un contracte acaba el 31-03, el següent comença l'01-04 com a
    molt d'hora.
  - Només intervenen `data_inici` i `data_fi` reals; `d_fi_prevista` no compta.
- Restriccions de dates a `contractes`: `data_fi >= data_inici` i `d_fi_prevista >= data_inici`.
- `documents_contracte.tipus` ∈ `contracte`, `annex`, `fiança`, `rebut`, `altres`.
- `documents_contracte.data_document` és la data del document en si (signatura, rebut...), opcional,
  i diferent d'`afegit_el` (quan es va pujar a l'app).
- `contractes` ja **no** té `ruta_contracte`: s'ha substituït per `documents_contracte`.

## Notes per a l'app

- Els errors dels triggers i dels `CHECK` arriben com a excepcions de `better-sqlite3` al Main
  Process. Cal capturar-los als handlers IPC i retornar un **codi d'error** estable (vegeu
  "Multiidioma"), mai el text de SQLite. El cas més important és `CONTRACTE_SOLAPAT`.
- Els triggers `AFTER INSERT` d'`afegit_el` fan un `UPDATE` intern que activa `ultima_mod`; és
  esperat. Una fila nova queda amb `ultima_mod = afegit_el`.
- Tota la lògica de BD i fitxers va al **Main Process**; React només crida via IPC
  (`window.api.*`), amb els tipus declarats a `src/preload/index.d.ts`.
- Els **tipus compartits** (`Immoble`, `ImmobleDades`, `Resultat<T>`...) viuen a `src/shared/tipus.ts`,
  perquè el Renderer no hagi d'importar de `src/main/` (que carrega `better-sqlite3` i `electron`).
  `src/shared/**/*` és a l'`include` de `tsconfig.node.json` i `tsconfig.web.json`.
- **ESLint `react-hooks/set-state-in-effect`**: no es pot cridar una funció que fa `setState` dins d'un
  `useEffect`. Es llegeix amb `.then()` dins mateix de l'efecte, amb un indicador `cancelat`, i es recarrega
  amb un comptador (`versio`) a les dependències.
- **Formularis en modal**: el formulari es munta només mentre el modal és obert, així sempre comença net
  i no cal cap `reset`. Els camps de text buits es desen com a `NULL` (`buitANull`).  
- **Formularis llargs**: pantalla pròpia amb ruta (`/x/nou`, `/x/:id`), no modal. La fitxa carrega les dades i
  **després** munta el formulari, que agafa els valors inicials sense `reset`. A les rutes, una `key` diferent
  per a "nou" i "edició" perquè React no reutilitzi l'estat.
- **Números al formulari**: camp de text amb `inputMode="decimal"` que accepta coma o punt; es converteix amb
  `aNumero()` i a la BD sempre va amb punt. Els camps buits es desen com a `NULL` (`buitANull`).
  
## Diferències amb la guia

1. La guia desa la BD a `app.getPath('userData')`; aquí s'usa `~/Lloguers/` (vegeu més amunt).
2. La guia crea les taules amb `db.exec` dins de `database.ts`; aquí s'apliquen migracions SQL.
3. La guia només té una taula `clients` d'exemple; l'esquema real és el descrit a dalt.
4. Error a l'`App.tsx` de la guia: `</tr</thead>` ha de ser `</tr></thead>`.
5. La guia declara `window.api` a un `electron.d.ts` a l'arrel; aquí es declara a
   `src/preload/index.d.ts`, que la plantilla ja inclou a `tsconfig.web.json`.

## Llibreria d'UI (decisió definitiva)

- **Mantine** com a llibreria de components, escollida per davant de Fluent UI v9 i MUI.
  Motiu: formularis, dates, modals i notificacions venen integrats i gratuïts, i el
  tipat TypeScript és bo. L'usuari coneix Fluent UI, però no és un requisit.
- Estat: **definitiva**. Validada amb la pantalla d'`inquilins` (llista, formulari en modal, validació,
  confirmació d'eliminació i notificacions).
- Paquets previstos: `@mantine/core`, `@mantine/hooks`, `@mantine/form`, `@mantine/dates`
  (amb `dayjs`), `@mantine/notifications` i `@mantine/modals`.
- Complements: `react-router-dom` per a la navegació; `TanStack Table` només si fa falta
  una taula més avançada.
- Seguir sempre la documentació de la **versió instal·lada** (les versions majors han canviat
  coses; evitar tutorials antics).
- **Dates**: a la BD són text ISO `AAAA-MM-DD`. `DatePickerInput` (Mantine 9.7.1) treballa directament amb
  aquest text (`value: string | null`), així que **no cal convertir** entre `Date` i string als formularis.
  Mai usar `toISOString()` (passa per UTC i pot desplaçar el dia). Per a "avui" o per fer càlculs, dayjs en
  hora local: `dayjs().format('YYYY-MM-DD')`. El format que veu l'usuari es controla amb `valueFormat`.
  Si s'usa un altre component de dates (`DateInput`, `DateTimePicker`...), comprovar-ne el tipus del valor.
  - **Errors de la BD** (triggers, `CHECK`): el Main els converteix en un codi (vegeu "Multiidioma");
  el Renderer el tradueix amb `t('errors.<CODI>')` i el mostra amb `@mantine/notifications` o com
  a error del camp amb `form.setErrors`.

## Multiidioma (i18n)

- **Idiomes**: català (`ca`, idioma de referència) i castellà (`es`). Afegir-ne més = crear un JSON nou.
- **Llibreria**: `i18next` + `react-i18next` (al Renderer). Tipat TypeScript de les claus a partir de `ca.json`.
- **Només es tradueix la interfície**, no la BD. Taules i columnes es queden en català.
  Els valors enumerats (p. ex. `documents_contracte.tipus`: `contracte`, `annex`, `fiança`...)
  són **claus internes**; a la pantalla es mostren amb `t('documents.tipus.<valor>')`.
- **Errors de la BD → codis.** El Main captura les excepcions dels triggers i dels `CHECK` i retorna
  un **codi** estable per IPC (p. ex. `CONTRACTE_SOLAPAT`), mai el text de SQLite. El Renderer el
  tradueix amb `t('errors.<CODI>')`. Així no cal editar migracions ja aplicades.
  - Resposta de tots els handlers: `Resultat<T> = { ok: true; dades: T } | { ok: false; error: CodiError }`
    (tipus a `src/shared/tipus.ts`).
  - Codis inicials: `CONTRACTE_SOLAPAT`, `FK_VIOLADA`, `CHECK_VIOLAT`, `DESCONEGUT`.
- **Dates i números**: a la BD, ISO `AAAA-MM-DD`. Es formaten només a la interfície segons el
  locale actiu (dayjs o `Intl`). Mantine: `DatesProvider` amb els locales `dayjs/locale/ca` i
  `dayjs/locale/es`.
- **Idioma triat**: es guarda a `~/Lloguers/config.json` (a la mateixa carpeta que la BD, així
  entra a les còpies de seguretat). Valor per defecte: `app.getLocale()` del sistema, amb
  *fallback* a `ca` si no és `ca` ni `es`.
  - Format previst: `{ "idioma": "ca" }`.
  - Llegir/escriure des del **Main Process** (IPC: `config:obtenir`, `config:desar`);
    exposar-ho via preload i declarar els tipus a `src/preload/index.d.ts`.
  - Si el fitxer no existeix o és invàlid, usar el valor per defecte i crear-lo.
- **Textos del Main Process** (diàlegs natius com `dialog.showOpenDialog`, menú): el Renderer passa
  els títols ja traduïts quan crida el diàleg. Si es fa un menú natiu, caldrà traduir-lo al Main.
- **Estructura**:

```
  src/renderer/src/
  ├── i18n/
  │   ├── index.ts          ← inicialització d'i18next
  │   ├── i18next.d.ts      ← tipatge de les claus a partir de ca.json
  │   ├── ca.json           ← idioma de referència (tipat)
  │   └── es.json
  └── components/
      ├── SelectorIdioma.tsx
      └── DatesAmbIdioma.tsx
```
- **Quan es munta**: just abans de la primera pantalla (llista + formulari d'`inquilins`), per no
  haver de refer textos escrits a mà. No depèn de `better-sqlite3` ni de les migracions.
- **Instal·lació**: `npm install i18next react-i18next`.
- **Afegir un text nou**, sempre en tres passos: (1) la clau a `ca.json`, (2) la mateixa clau a
  `es.json`, (3) `t('camí.de.la.clau')` al component. Mai escriure textos a mà dins d'un component.
  Només `ca.json` es valida: si falta una clau a `es.json`, no hi ha error i es veu el text en català.
  Comprovació de claus iguals (necessita `jq`), des de `src/renderer/src/i18n/`:
  `diff <(jq -r 'paths(scalars) | join(".")' ca.json | sort) <(jq -r 'paths(scalars) | join(".")' es.json | sort) && echo "claus iguals"`.
  Les claus dels errors (`errors.<CODI>`) han de coincidir amb els valors de `CodiError`.

## Pròxims passos

### Fase A: base (feta)
- [x] Projecte electron-vite, `better-sqlite3` compilat contra Electron.
- [x] `database.ts` amb connexió i migracions; BD existent a `user_version = 1`.
- [x] Tipus compartits a `src/shared/tipus.ts` (`Immoble`, `ImmobleDades`).
- [x] `src/main/inmobles.ts` (CRUD).

### Fase B: backend al Main Process (feta)
1. [x] Codis d'error: `Resultat<T>` amb `error: CodiError` i `src/main/errors.ts` amb `traduirError(e)`
   i `executar(op)`, que converteix qualsevol operació en un `Resultat<T>`.
   **Pendent de verificar amb un cas real** que `better-sqlite3` retorna els codis `SQLITE_CONSTRAINT_*`
   (es farà al pas 15, amb contractes).
2. [x] Handlers IPC d'`inmobles` (`src/main/ipc/inmobles.ts`) i registre a `index.ts`.
3. [x] Preload + `window.api.inmobles` tipat a `src/preload/index.d.ts`.
4. [x] Prova des de les DevTools: `inmobles.obtenir()` retorna els immobles migrats, sense camps d'auditoria.
5. [x] Mateixa cadena per a `inquilins`. `ck_tel1_*` són `boolean` al tipus; la conversió 0/1 ↔ boolean
   es fa només a `src/main/inquilins.ts`. Provats crear, actualitzar i eliminar.
6. [x] `config.ts` i IPC `config:obtenir` / `config:desar`. El Main valida l'idioma abans d'escriure.
7. [x] Commit.
8. [x] Prova d'empaquetat anticipada (`npm run build:unpack`): vegeu el pas 19.

#### Fase C: base de la UI
8. [x] Mantine 9.7.1 instal·lat (`core`, `hooks`, `form`, `dates`, `notifications`, `modals`, més `dayjs`).
   Tots els paquets de Mantine han d'anar a la **mateixa versió**. Providers muntats a `main.tsx`:
   `MantineProvider`, `DatesAmbIdioma`, `ModalsProvider` i `Notifications`.
9. [x] i18n: `i18next` + `react-i18next`, `ca.json`, `es.json`, claus tipades des de `ca.json`.
   L'idioma es llegeix de `config.json` a `main.tsx` abans de pintar. `SelectorIdioma` desa i canvia
   l'idioma sense recarregar; `DatesAmbIdioma` fa que el locale de les dates segueixi l'idioma actiu.
10. `react-router-dom` i disseny general (menú: Immobles, Inquilins, Contractes, Configuració, Quant a).
    El selector d'idioma, ara provisional a `lloguers.tsx`, passa a la pantalla de Configuració.
11. Utilitats: helper `CodiError` → `t('errors.X')` → notificació. (La conversió `Date` ↔ ISO ja no cal:
    `DatePickerInput` treballa amb text `AAAA-MM-DD`.)
12. Commit.
- `App.tsx` només tria entre pantalles (`ProvesMantine` o `lloguers.tsx`); no s'hi escriu lògica.
  La pantalla principal de l'app és `src/renderer/src/lloguers.tsx`.

### Fase D: pantalles
13. [x] Inquilins: llista + formulari en modal, validació (nom o cognoms), eliminació amb confirmació.
    Valida Mantine (decisió definitiva). Pantalles a `src/renderer/src/pantalles/`.
14. [x] Immobles: llista, formulari per seccions en pantalla pròpia (`/immobles/nou`, `/immobles/:id`),
    eliminació amb confirmació i avís de caducitats (certificat i cèdula) a 60 dies
    (`DIES_AVIS` a `src/renderer/src/utils/caducitat.ts`). El dia de caducitat el document encara és vigent.
15. Contractes (backend): CRUD, comprovar els triggers de solapament amb dades de prova.
16. Contractes (UI): selectors d'immoble i inquilí, gestió de `CONTRACTE_SOLAPAT`,
    marca de contracte vigent (`data_fi` buida).
17. Documents (backend): diàleg d'adjuntar, còpia a `documents/<id_contracte>/`,
    validació de ruta, obrir amb `shell.openPath()`, esborrar també el fitxer.
18. Documents (UI): pestanya dins del contracte.

### Fase E: distribució
19. Empaquetat. Fet i verificat amb `build:unpack` i un `HOME` buit (instal·lació des de zero):
    - [x] Migracions incrustades al codi amb `import.meta.glob(..., { query: '?raw', eager: true })`
      a `database.ts` (ja no es llegeixen del disc).
    - [x] `asarUnpack: '{resources/**,node_modules/better-sqlite3/**}'`. Ha de ser **un sol text**,
      no una llista (la validació d'electron-builder la rebutja).
    - [x] `snap` tret de `linux.target` (necessita `snapcraft`).
    - [ ] `better-sqlite3` 13 porta els binaris a `prebuilds/<plataforma>.node`; només ens cal `linux-x64`.
      Opcional: excloure la resta per reduir la mida.
    - [ ] Revisar `appId`, `maintainer` i el bloc `publish` (apunta a `example.com`).
20. `npm run build:linux` (`.deb` / AppImage) i prova al portàtil Mint.
