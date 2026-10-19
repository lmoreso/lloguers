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
const DADES = path.join(app.getPath('home'), 'Lloguers')
const dbPath = path.join(DADES, 'lloguers.sqlite')
const docsDir = path.join(DADES, 'documents')
```

- A la BD, `documents_contracte.ruta` guarda **només la ruta relativa** (`documents/1/xxx.pdf`).
- Abans d'obrir un fitxer, comprovar que la ruta resolta queda **dins de `documents/`** (evitar `..`).
- Esborrar un document o un contracte ha d'**esborrar també el fitxer del disc** (la BD no ho fa).
- Obrir fitxers amb `shell.openPath()`; triar-ne amb `dialog.showOpenDialog` (selecció múltiple) i
  copiar-los amb `fs.copyFile`.

## Convencions de la BD

- `PRAGMA foreign_keys = ON` a **cada connexió** (i `journal_mode = WAL`).
- Dates com a text ISO `AAAA-MM-DD`, validades amb `CHECK (date(x) IS x)`. **`IS` i no `=`**: `date()` retorna
  `NULL` per a un text que no entén, i un `CHECK` només falla quan dona 0, no `NULL`.
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
  **Excepció:** la `002` es va editar (`date(x) = x` → `IS`) abans que cap instal·lació real la fes servir;
  només s'havia aplicat a bases de dades de desenvolupament, que es van restaurar a la versió 1.
  No és un costum: la regla d'avui és no editar mai una migració ja aplicada.

## Taules

| Taula                 | Descripció                                                                                                                      |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `inmobles`            | Immobles: adreça, referència cadastral, superfícies, certificat energètic i cèdula d'habitabilitat (registre, data, caducitat). |
| `inquilins`           | Inquilins: nom, cognoms, NIF, telèfon i indicadors WhatsApp/Bizum (`ck_tel1_wassap`, `ck_tel1_bizum`).                          |
| `contractes`          | Històric de contractes. Clau pròpia `id`. FK a `inmobles` i `inquilins`.                                                        |
| `documents_contracte` | Documents adjunts d'un contracte (0..N). FK amb `ON DELETE CASCADE`.                                                            |
| `tipus_document`      | Tipus de document: `nom` (dada de l'usuari) i `classe` (codi intern que el programa coneix).                                    |

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

## Contractes: disseny funcional

### Model

- Un contracte lliga un **immoble** amb un **inquilí** (i un segon inquilí opcional). Un immoble té molts
  contractes al llarg del temps, mai solapats.
- **No hi ha pròrroga.** El contracte continua vigent passada la `d_fi_prevista`. Quan acaba de debò, es tanca
  (`data_fi`) i, si cal, es crea un contracte nou pel mateix inquilí, que es gestiona com si fos un altre
  (fiança nova, sense relació amb l'anterior). El contracte tancat conserva la gestió de la devolució de la fiança.
- Totes les dades de fiança i de devolució són a `contractes`; els fitxers, a `documents_contracte`.
  El contracte **no** guarda l'`id` de cap document.

### Columnes noves de `contractes` (migració 002)

| Grup          | Columnes                                                                                                                                                                                                                                                |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Segon inquilí | `id_inquili_2` (opcional, FK a `inquilins`)                                                                                                                                                                                                             |
| Lloguer       | `lloguer_inicial` (ja hi és), `lloguer_actual` (obligatori), `data_ultima_revisio` (obligatòria, ISO)                                                                                                                                                   |
| Fiança        | `fianca_import`, `fianca_nc` (registre INCASOL, p. ex. `NC 0230241403599`), `fianca_data_model2` (gravació a l'INCASOL), `fianca_data_ingres`, `fianca_data_notificacio` (l'INCASOL notifica el pagament), `fianca_num_registre` (el de la notificació) |
| Devolució     | `devolucio_data_sollicitud`, `devolucio_data_cobrament` (l'INCASOL paga), `devolucio_import` (retornat a l'inquilí), `devolucio_motiu` (text lliure: per què s'ha retornat sencera o no)                                                                |

Imports (`lloguer_*`, `fianca_import`, `devolucio_import`) com a `NUMERIC`. Tot el que no s'ha dit obligatori és
opcional (`NULL`). Noms de columna sense accents ni `ç`. Les columnes de devolució es creen ja a la migració 002,
tot i que la pantalla es faci més tard (la taula és buida: no costa res i evita tocar-la un altre cop).

### Regles de la BD (`CHECK`)

- `id_inquili_2` ha de ser diferent d'`id_inquili`.
- `fianca_nc` i `fianca_data_model2`: **o les dues o cap**. `fianca_num_registre` i `fianca_data_notificacio`:
  **o les dues o cap**. El document adjunt no és obligatori; la pantalla avisa si hi ha la data i falta el document.
- `fianca_data_ingres` és independent de les altres dates.
- Les dades de devolució només es poden informar amb el contracte tancat (`data_fi` informada).
- `data_ultima_revisio >= data_inici`. Totes les dates noves, ISO validat amb `CHECK (date(x) IS x)`.

### Lloguer actual i revisió

- Al crear un contracte, el Main fixa `lloguer_actual = lloguer_inicial` i `data_ultima_revisio = data_inici`
  (el formulari de creació no els demana). Un trigger no pot fer-ho: la columna `NOT NULL` fallaria abans.
- Mentre `data_ultima_revisio = data_inici` (mai revisat), editar `data_inici` o `lloguer_inicial` arrossega
  els dos camps. Un cop revisat, són independents. (Cas límit assumit: una revisió feta el mateix dia que
  `data_inici` no es distingeix de "mai revisat".)
- `lloguer_actual` i `data_ultima_revisio` només els canvia l'acció **Revisar lloguer**, que demana l'import i
  la data **alhora**. L'import pot ser igual (lloguer congelat). Al formulari d'edició són de només lectura.

### Avisos (només contractes vigents, `data_fi` buida)

| Avís               | Quan                                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------------ |
| Fi prevista        | A **90 dies** de `d_fi_prevista`, i **també un cop passada** (sense pròrroga, és l'única senyal)             |
| Revisió de lloguer | A **30 dies** de l'aniversari de l'última revisió (`data_ultima_revisio` + 1 any), i **també un cop passat** |

Constants a `src/renderer/src/utils/caducitat.ts`, com `DIES_AVIS` d'Immobles. Es compara només el dia, en hora local.

### Interfície

- S'hi entra **des d'Immobles**, amb un botó per fila (`/immobles/:id/contractes`). Llista dels contractes d'aquell
  immoble, l'últim primer (`data_inici` descendent), amb el nom dels inquilins (`JOIN` al Main) i una etiqueta
  _vigent_ / _tancat_. L'`INNER JOIN` amb `inquilins` no perd cap contracte (`NOT NULL` + clau forana).
- "Afegir" porta l'immoble ja posat i **no modificable**; tampoc es pot canviar en editar.
- Formulari en pantalla pròpia amb seccions (dades, fiança, devolució), com Immobles.
- Editar un contracte **tancat** demana confirmació. Eliminar sempre en demana, i el text avisa que s'esborren
  la fiança i els documents adjunts (fitxers inclosos).
- Accions sobre el contracte: **Tancar** (demana `data_fi`, `>= data_inici`) i **Revisar lloguer**.
- El menú **Contractes vigents** (amb els avisos) està decidit però **fora de l'abast de la fase 1**.
  El filtre per immoble del backend serà un paràmetre opcional perquè ho permeti.

### Tipus de document: taula `tipus_document`

- `tipus_document(id INTEGER PRIMARY KEY AUTOINCREMENT, nom TEXT NOT NULL, classe TEXT NOT NULL, afegit_el, ultima_mod)`,
  amb els triggers d'auditoria com la resta de taules. `documents_contracte.id_tipus` hi és clau forana
  (substitueix el `tipus` amb `CHECK`; sense `ON DELETE CASCADE`, així no es pot esborrar un tipus en ús).
  La migració 002 la crea **buida**: el sembrat el fa l'app.
- **`classe`** és un codi intern d'una llista tancada al codi (`src/shared/tipus.ts`): `contracte`, `annex`,
  `fianca_model2`, `fianca_notificacio`, `fianca_model3`, `rebut`, `altres`. **No es valida a la BD** (afegir-ne
  una exigiria reconstruir la taula): ho valida el **Main**, i la UI només ofereix un desplegable.
- La lògica del programa mira sempre la **classe**, mai l'`id` ni el `nom`. Dos tipus poden compartir classe.
- `nom` és dada de l'usuari i no es tradueix. Les descripcions de cada classe en tots els idiomes són als JSON
  (`documents.classes.<classe>`) i serveixen per sembrar i pel desplegable.
- **Sembrat:** a cada arrencada, amb l'idioma ja definitiu i abans de pintar l'app, el Renderer envia al Main el
  nom traduït de cada classe; el Main insereix un tipus per cada classe que **no en tingui cap** (idempotent).
  Així cada classe amb lògica té sempre almenys un tipus. Els noms queden en l'idioma del primer arrencat.
- La pantalla per crear i editar tipus (a Configuració) **no és a la fase 1**.

### Migració 002

- **Reconstrueix** `contractes` i `documents_contracte` (estan buides; cal verificar-ho abans) i crea
  `tipus_document`: SQLite no permet afegir `CHECK` entre columnes amb `ALTER`.
- Ordre: esborrar primer `documents_contracte` i després `contractes`; crear `tipus_document`, `contractes` i
  `documents_contracte`. Cal **recrear els índexs i els triggers** d'aquestes taules (solapament, `afegit_el`,
  `ultima_mod`) i afegir-ne per a `tipus_document`.

### Fases

1. **Fase 1:** dades, segon inquilí, lloguer i revisió, fiança fins a la notificació, accions Tancar i
   Revisar lloguer, avisos i documents amb la taula de tipus.
2. **Fase 2 (feta):** devolució de la fiança (model 3).
3. **Fase 3:** canvi de signants (annex), correcció de l'immoble d'un contracte i menú Contractes vigents.

### Pendent per a més endavant

- **Corregir l'immoble** d'un contracte mal assignat: ara només es pot eliminar i recrear, i això perd els documents.
  Una correcció d'una data de revisió ha de poder retrocedir.
- **Canvi de signants:** de moment s'edita `id_inquili` / `id_inquili_2` i es puja l'annex. No es guarda qui hi havia abans.
- **Revisions de lloguer:** no hi ha historial; només el valor actual i la data de l'última.
- Pantalla per crear i editar tipus de document.

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

### Contractes

- **Icones**: `@tabler/icons-react` per a editar, eliminar, revisar i tancar (icona sola amb `Tooltip` i `aria-label` traduïts), **una columna per icona** perquè quedin alineades. Les accions principals (Afegir) són botons de text.
  Els avisos es mostren apilats (`Stack`), com els inquilins.
- **Avisos de contractes**: `DIES_AVIS_FI` (90) i `DIES_AVIS_REVISIO` (30) a `utils/caducitat.ts`; l'aniversari de la revisió és `data_ultima_revisio` + 1 any. `DatePickerInput` accepta `minDate` com a text ISO.
- **Formulari de contracte**: permet informar `data_fi` per registrar contractes antics; l'acció Tancar és per al cas habitual.  
- **Documents**: es desen a l'instant, independentment del botó Desar de les dades del contracte. El tipus d'una selecció
  múltiple és comú. El nom del fitxer al disc porta el prefix de l'`id` del document (sense col·lisions) i es neteja de
  caràcters reservats; el `nom_original` es conserva a la BD tal com era.
- **Avís "Falten documents"**: hi ha una data de la fiança informada (model 2 o notificació) i cap document adjunt de la
  classe corresponent (`fianca_model2` / `fianca_notificacio`). Surt també als contractes tancats, perquè aquests
  documents són els que calen per demanar la devolució. El calcula el Main (`te_doc_model2`, `te_doc_notificacio`).
- **Preload**: cada bloc nou s'ha d'afegir als **dos** fitxers (`index.ts` i `index.d.ts`), i dins de `api`, no dins d'un
  altre bloc. Si es oblida, el `typecheck` falla només a l'`.d.ts`, perquè la consola de les DevTools no comprova tipus.
- **Menú d'accions**: la llista de contractes té una sola icona per fila (capçalera "Accions") que obre un menú amb icona i
  text. Als vigents: Revisar lloguer i Tancar contracte; als tancats: Devolució de la fiança; a tots: Editar i Eliminar.
- **Devolució de la fiança**: acció pròpia (finestra), només als contractes tancats. Cap camp és obligatori; tot buit
  esborra la devolució. El Main valida que el cobrament no sigui anterior a la sol·licitud i que la sol·licitud no sigui
  anterior a la fi del contracte (i la fi no pot passar de la sol·licitud). Un contracte amb devolució informada no es pot
  reobrir (esborrar `data_fi`), i el formulari ho diu amb un missatge concret.
- **Avisos de la fiança**: "Falten documents" també per al model 3 (hi ha data de sol·licitud i no hi ha cap document de classe
  `fianca_model3`); "Devolució pendent" als contractes tancats amb el model 2 o la notificació informats i sense data de
  cobrament. Risc assumit: un contracte antic amb la fiança ja retornada però no anotada avisa fins que s'hi posa el cobrament.  
  
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

Resum: la interfície és en català i castellà, i es poden afegir més idiomes sense tocar la lògica. L'idioma es
tria el primer cop que s'obre l'app i es guarda a `~/Lloguers/config.json`.

### Principis

- **Només es tradueix la interfície**, no la BD. Taules i columnes es queden en català.
- **Idioma de referència**: català (`ca`). `ca.json` dona el tipat de les claus; `es.json` ha de tenir les mateixes.
- **Llibreria**: `i18next` + `react-i18next`, només al Renderer. El Main no té traduccions.
- **Llista d'idiomes**: una sola constant, `IDIOMES`, a `src/shared/tipus.ts`
  (`export const IDIOMES = ['ca', 'es'] as const`). El tipus `Idioma` se'n deriva, i tant el Main
  (per validar) com el Renderer (per als selectors) la fan servir.
- **Nom de cada idioma**: cada JSON porta una clau `idiomaNom` amb el nom de l'idioma **en el seu propi idioma**
  ("Català", "Castellano"). Els selectors el llegeixen del recurs de cada idioma
  (`i18n.getFixedT(codi)('idiomaNom')`), no de l'idioma actiu. Substitueix les claus `configuracio.idiomes.*`.
- **Valors enumerats de la BD** (com la `classe` dels tipus de document): són **claus internes**; a la pantalla
  es mostren amb `t('documents.classes.<classe>')`.

### Afegir un text nou

Sempre en tres passos: (1) la clau a `ca.json`, (2) la mateixa clau a `es.json`, (3) `t('camí.de.la.clau')`
al component. Mai escriure textos a mà dins d'un component.

Només `ca.json` es valida: si falta una clau a `es.json`, no hi ha error i es veu el text en català.
Comprovació de claus iguals (necessita `jq`), des de `src/renderer/src/i18n/`:

```bash
diff <(jq -r 'paths(scalars) | join(".")' ca.json | sort) <(jq -r 'paths(scalars) | join(".")' es.json | sort) && echo "claus iguals"
```

Les claus dels errors (`errors.<CODI>`) han de coincidir amb els valors de `CodiError`.

### Afegir un idioma nou

1. Crear el JSON (copiant `ca.json`, amb `idiomaNom` i tots els textos traduïts).
2. Afegir-lo als `resources` d'`i18n/index.ts`.
3. Afegir el codi a `IDIOMES` (`src/shared/tipus.ts`).
4. Afegir el locale de dayjs a `main.tsx` (`import 'dayjs/locale/xx'`), per als calendaris.

### Idioma triat i primer arrencament

**On es guarda**: `~/Lloguers/config.json`, a la mateixa carpeta que la BD (així entra a les còpies de
seguretat). Format: `{ "idioma": "ca" }`. Es llegeix i s'escriu només des del **Main**, per IPC
(`config:obtenir`, `config:desar`); el Main valida l'idioma amb `IDIOMES` abans d'escriure.

**Què fa l'app en arrencar**, en aquest ordre, abans de pintar res:

1. El Renderer (a `main.tsx`) demana la configuració amb `config:obtenir`.
2. El Main respon `{ idioma, confirmat }`:
   - Si `config.json` existeix i és vàlid: `confirmat = true` i l'idioma del fitxer.
   - Si no existeix o és invàlid: `confirmat = false` i l'idioma per defecte. **El Main no escriu res.**
3. **Idioma per defecte**: la part d'idioma de `app.getLocale()` (p. ex. `es-ES` → `es`) si és a `IDIOMES`;
   si no, `ca`.
4. Si `confirmat = false`, el Renderer mostra la **pantalla de selecció d'idioma** (vegeu a sota). Només quan
   l'usuari confirma es crida `config:desar`.
5. Amb l'idioma ja definitiu, el Renderer fa `i18n.changeLanguage`.
6. Es fa el **sembrat dels tipus de document** (vegeu "Contractes: disseny funcional").
7. Es pinta l'app.

**Pantalla de selecció d'idioma**:

- Una llista de botons, un per idioma, cadascun amb el seu `idiomaNom`. Surt preseleccionat l'idioma per defecte.
- El **títol i el botó de confirmar** surten en l'idioma ressaltat. Canvia en memòria en seleccionar-ne un altre;
  no es desa res fins a confirmar. No hi ha cap text en tots els idiomes alhora, perquè la llista ha de poder créixer.

**Registre a la consola** (mentre es depura):

- El Main escriu a la **terminal** (la de `npm run dev`): l'idioma que detecta del sistema, si l'app el té,
  si `config.json` existia i era vàlid, i l'idioma resultant amb l'estat confirmat o no.
- El Renderer escriu a la consola de les **DevTools**: si mostra la pantalla i què tria l'usuari.

**Per provar-ho**: esborrar `~/Lloguers/config.json` a mà reprodueix el primer arrencament. La detecció de
l'idioma del sistema no es pot provar canviant el SO; els logs diuen què detecta `app.getLocale()`.

### Errors de la BD → codis

El Main captura les excepcions dels triggers i dels `CHECK` i retorna un **codi** estable per IPC
(p. ex. `CONTRACTE_SOLAPAT`), mai el text de SQLite. El Renderer el tradueix amb `t('errors.<CODI>')`.
Així no cal editar migracions ja aplicades.

- Resposta de tots els handlers: `Resultat<T> = { ok: true; dades: T } | { ok: false; error: CodiError }`
  (tipus a `src/shared/tipus.ts`).
- Codis inicials: `CONTRACTE_SOLAPAT`, `FK_VIOLADA`, `CHECK_VIOLAT`, `DESCONEGUT`.

### Dates i números

A la BD, ISO `AAAA-MM-DD`. Es formaten només a la interfície segons el locale actiu (dayjs o `Intl`).
Mantine: `DatesAmbIdioma` (embolcalla `DatesProvider`) amb els locales `dayjs/locale/ca` i `dayjs/locale/es`.

### Textos del Main Process

Els diàlegs natius (com `dialog.showOpenDialog`) reben els títols **ja traduïts** del Renderer. Si es fa un menú
natiu, caldrà traduir-lo al Main.

### Estructura

```
src/renderer/src/
├── i18n/
│   ├── index.ts          ← inicialització d'i18next
│   ├── i18next.d.ts      ← tipatge de les claus a partir de ca.json
│   ├── ca.json           ← idioma de referència (tipat)
│   └── es.json
└── components/
    ├── SelectorIdioma.tsx    ← selector (Configuració)
    ├── SeleccioIdioma.tsx    ← pantalla del primer arrencament
    └── DatesAmbIdioma.tsx
```

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
15. Contractes (backend), en quatre blocs:
    - [x] **15a.** Idioma al primer arrencament (vegeu "Multiidioma"): `IDIOMES` a `tipus.ts`, `config:obtenir`
          sense escriure i amb l'estat de confirmació, pantalla de selecció, logs. Independent de les taules.
    - [x] **15b.** Migració `002_...sql`: reconstrucció de `contractes` i `documents_contracte`, `tipus_document`.
          Abans, comprovar que les dues taules són buides. Provar-la amb una instal·lació des de zero.
    - [x] **15c.** Classes i sembrat de tipus de document: llista de classes a `tipus.ts`, claus
          `documents.classes.*` als JSON, IPC de sembrat, validació de classes al Main.
    - [x] **15d.** Tipus `Contracte`, `ContracteDades`, `ContracteLlistat`; `src/main/contractes.ts` (CRUD, `JOIN`
          amb `inquilins`, regles del lloguer i la revisió); handlers IPC, preload i `index.d.ts`. Provar els
          triggers de solapament (dia final inclusiu, `data_fi` buida) i els `CHECK` nous des de les DevTools.
          Verificar que `better-sqlite3` retorna els codis `SQLITE_CONSTRAINT_*` que usa `traduirError`.
          Provar `FK_VIOLADA` en eliminar un immoble o un inquilí amb contractes.
16. [x] Contractes (UI, fase 1): s'hi entra des d'Immobles (`/immobles/:id/contractes`), amb llista, formulari en pantalla pròpia, eliminar, les accions Tancar i Revisar lloguer (finestres) i els avisos.
17. [x] Documents (backend): diàleg d'adjuntar al Main (el Renderer només envia contracte, tipus i títol, mai rutes),
    còpia a `documents/<id_contracte>/<id_document>_<nom_segur>.<ext>`, ruta relativa a la BD, validació que la ruta
    queda dins de `documents/`, obrir amb `shell.openPath()` i esborrar també el fitxer. `eliminarContracte` esborra la
    carpeta del contracte. Nou codi d'error `FITXER_NO_TROBAT`.
18. [x] Documents (UI): pestanyes Dades i Documents a la fitxa d'un contracte (les pestanyes només en editar); adjuntar,
    obrir, editar (tipus, data i comentaris) i eliminar; avís "Falten documents".

### Fase E: distribució

19. Empaquetat. Fet i verificat amb `build:unpack` i un `HOME` buit (instal·lació des de zero):
    - [x] Migracions incrustades al codi amb `import.meta.glob(..., { query: '?raw', eager: true })`
          a `database.ts` (ja no es llegeixen del disc).
    - [x] `asarUnpack: '{resources/**,node_modules/better-sqlite3/**}'`. Ha de ser **un sol text**,
          no una llista (la validació d'electron-builder la rebutja).
    - [x] `snap` tret de `linux.target` (necessita `snapcraft`).
    - [ ] `better-sqlite3` 13 porta els binaris a `prebuilds/<plataforma>.node`; només ens cal `linux-x64`.
          Opcional: excloure la resta per reduir la mida.
    - [x] Revisar `appId`, `maintainer` i el bloc `publish` (apunta a `example.com`).
20. [x]`npm run build:linux` (`.deb` / AppImage) i prova al portàtil Mint.

## Correccions i Noves funcionalitats 

### Generals
- Poder introduir les dates manualment.
- Tots els camps de dades: menú per Editar amb botó dret (copiar, enganxar, etc.)
- Posar una barra superior mes currada amb el nom de la pantalla (a estudiar). 
- A la part dreta de la barra superior posar un menu amb les accions de la pantalla (tornar, Afegir, Desar, etc) i no botons a la part superior (Afegir) i botons a la part inferior (si la panttalla creix en altura els botons queden amagats).
- Menú sortir a la parte esquerre inferior.
- Icona de la Aplicació

### Nova Taula i Pantalla Propietaris
- Dades personals com a Inquilins, amb IBAN.

### Pantalla Inquilins (Llista)
- Afegir columna al principi amb el ID.
- Afegir nova acció per anar al nou formulari dels Documents (veure apartat seguent).

#### Nova Gestió dels Documents del Inquilí (pendent d'aprofundir)
- Nou Formulari.
- DNI, Vida Laboral, Nómina, Altres.
- Estudiar si fer servir la mateixa taula i estructura de carpetes o no.
- Accesible desde la llista i desde Editar.

#### Formulari Editar Inquilí
- Validar que NO es pugui marcar Bizzum i Whatssap si no hi ha telèfon.
- Afegir camp IBAN.
- Acció per anar al nou formulari dels Documents. Abans preguntar si es vol Guardar (Si, Cancelar). En cas de Error quedarse al Inquilí. 

### Pantalla Immmobles (Llista)
- Afegir columna al principi amb el ID.
- Afegir un Avis genèric si algun contracte te avisos.
- Afegir nova acció per anar al nou formulari dels Documents (veure apartat seguent).
- Afegir nova acció per editar directament el últim contracte.

#### Nova Gestió dels Documents del Immoble (pendent d'aprofundir)
- Certificat Energètic, Cédula habitibilitat, Fotos, Altres.
- Estudiar si fer servir la mateixa taula i estructura de carpetes o no.
- Accesible desde la llista i desde Editar.

#### Pantalla Editar Immoble
- Acció per anar directament als contractes (ara s'ha de tornar a la llista). Si hi han modificacions preguntar si es vol Guardar (Si, Cancelar). Si hi ha errors ens mantenim a Immobles.
- Acció per anar al nou formulari dels Documents. Abans preguntar si es vol Guardar (Si, Cancelar). Si hi ha errors ens mantenim a Immobles. 
- Afegir la barra superior taronja (com a la llista) amb detall dels avisos + l'avis genèric si els contractes tenen avisos.
- Afegir els propietaris que tinguin amb el seu % (que ha de sumar 100). Taula a part o afegir 4 propietaris com a màxim a la taula de Inmobles (mes senzill). Si la pantalla està molt carregada, posar-ho a una altra pestanya.

### Pantalla Contractes (Llista)
- A la part superior poder Navegar entre els Immobles.
- Afegir columna al principi amb el ID.

#### Pantalla Editar Contracte
- Al subtítol només hi consta el Immobles. Afegir:
  - 'Contracte nou' si es el cas.
  - 'Contracte de {data}' si el contracte ja existía.
- Afegir barres de navegació abans del subtítol, per navegar entre contractes. Si hi han modificacions preguntar si es vol guardar (Si, Cancel·lar). Si hi han errors al guardar, ens mantenim al mateix registre.
- Al clicar a la pestanya Documents fer el mateix que al Navegar si hi han modificacions.
- Afegir format monetari als camps Lloguer Inicial i Fiança (a Lloguer actual ja hi es).
- Afegir barra superior tronja amb els avisos del Contracte.
- Nova acció per Tancar el Contracte. Si hi han modificacions preguntar si es vol guardar (Si, Cancel·lar). Si hi han errors al guardar, ens mantenim al mateix registre.

#### Tancar Contracte
- Afegir camp 'Motiu de Final' amb llista desplegable fixa:
  - No renovació.
  - Voluntaria.
  - Nou Contracte.
  - Altres.
- Afegir camp 'Comentaris del Tancament'.

### Configuració
- Ruta i nom de la BD a escollir. Cal fitxer de configuració a una carpeta estandar del SO.
  - Posibilitat de treballar amb varies BD. 
  - Al obrir la App carregar sempre la última BD.
- Mantenir la configuració del Idioma a la mateixa carpeta de la BD.

### Empaquetat (executables).
- Falta sistema de versions.
- Activar suport per Windows.
