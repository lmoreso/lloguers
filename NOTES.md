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
- Idioma de la interfície i dels noms de taules/columnes: **català** (excepte `inmobles`, que
  conserva el nom original de Base).

## Ubicació de les dades

Tot penja d'una sola carpeta, per facilitar còpies de seguretat i portabilitat:

```
~/lloguers/
├── lloguers.sqlite
└── documents/
    └── <id_contracte>/
        └── <id_document>_<nom_segur>.<ext>
```

```ts
const DADES   = path.join(app.getPath('home'), 'lloguers')
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
- Esquema versionat amb `PRAGMA user_version` i fitxers a `src/main/migrations/`
  (`001_inicial.sql`, `002_...sql`, ...). No editar mai una migració ja aplicada.

## Taules

| Taula | Descripció |
|---|---|
| `inmobles` | Immobles: adreça, referència cadastral, superfícies, certificat energètic i cèdula d'habitabilitat (registre, data, caducitat). |
| `inquilins` | Inquilins: nom, cognoms, NIF, telèfon i indicadors WhatsApp/Bizum (`ck_tel1_wassap`, `ck_tel1_bizum`). |
| `contractes` | Històric de contractes. Clau pròpia `id`. FK a `inmobles` i `inquilins`. |
| `documents_contracte` | Documents adjunts d'un contracte (0..N). FK amb `ON DELETE CASCADE`. |

Els `CREATE TABLE` definitius són a `001_inicial.sql` (bolcat amb `sqlite3 lloguers.sqlite ".schema"`).

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
  Process. Cal capturar-los als handlers IPC i retornar un missatge entenedor al formulari
  (en especial el de solapament de contractes).
- Els triggers `AFTER INSERT` d'`afegit_el` fan un `UPDATE` intern que activa `ultima_mod`; és
  esperat. Una fila nova queda amb `ultima_mod = afegit_el`.
- Tota la lògica de BD i fitxers va al **Main Process**; React només crida via IPC
  (`window.api.*`), amb els tipus declarats a `electron.d.ts`.

## Diferències amb la guia

1. La guia desa la BD a `app.getPath('userData')`; aquí s'usa `~/lloguers/` (vegeu més amunt).
2. La guia crea les taules amb `db.exec` dins de `database.ts`; aquí s'apliquen migracions SQL.
3. La guia només té una taula `clients` d'exemple; l'esquema real és el descrit a dalt.
4. Error a l'`App.tsx` de la guia: `</tr</thead>` ha de ser `</tr></thead>`.

## Pròxims passos

1. Crear el projecte amb electron-vite (React + TypeScript) i instal·lar `better-sqlite3`.
2. Afegir `001_inicial.sql` i el sistema de migracions a `database.ts`.
3. Implementar el CRUD d'`inmobles` i `inquilins` (IPC + preload + tipus).
4. Contractes amb gestió d'errors de solapament.
5. Documents: diàleg d'adjuntar, còpia a `documents/`, obrir i esborrar.
6. Distribució amb electron-builder (`.deb` / AppImage) per al portàtil Mint.
