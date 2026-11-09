# NOTES.md: context i decisions del projecte

> Aquestes decisions tenen **prioritat** sobre la guia genèrica d'Electron del projecte
> (`Guia Electron + React + Vite + TypeScript + SQLite`). Vegeu "Diferències amb la guia".
> L'estat del dia a dia (què s'ha fet, incidències, què toca) és a `PROGRES.md`. Quan els dos fitxers difereixin, mana aquest.

## Objectiu

Aplicació d'escriptori per gestionar lloguers (immobles, inquilins, contractes i els seus documents), que substitueix una
base de dades de LibreOffice Base. Les dades d'`inmobles` i d'`inquilins` es van migrar a SQLite; `contractes` estava buida.

## Entorn

- Desenvolupament: VM Ubuntu Cinnamon 26.04 sobre amfitrió Ubuntu 24.04. Destí: la mateixa VM, el portàtil (Linux Mint) i l'amfitrió.
- Stack: Electron + React + Vite (electron-vite) + TypeScript + SQLite (`better-sqlite3`). Eines de BD: DB Browser for SQLite i CLI `sqlite3`.
- Idioma de referència de la interfície i dels noms de taules i columnes: **català** (excepte `inmobles`, que conserva el nom original
  de Base). La interfície també s'ofereix en castellà (vegeu "Multiidioma").
- VS Code amb cSpell desactivat per al projecte (`.vscode/settings.json`).

## Ubicació de les dades

Tot penja d'una sola carpeta, per facilitar les còpies de seguretat i la portabilitat:

```
~/Lloguers/
├── lloguers.sqlite
├── config.json                       ← idioma (vegeu "Multiidioma")
└── documents/
    ├── <id_contracte>/               ← documents dels contractes
    │   └── <id_document>_<nom_segur>.<ext>
    └── immobles/
        └── <id_immoble>/             ← documents dels immobles
            └── <id_document>_<nom_segur>.<ext>
```

- La ruta base és `path.join(app.getPath('home'), 'Lloguers')` (amb **L majúscula**), definida un sol cop a `database.ts` (`DADES`, `docsDir`).
- A la BD, `ruta` guarda **només la ruta relativa**, sempre amb `/` (`documents/1/xxx.pdf`).
- Abans d'obrir o esborrar un fitxer, es comprova que la ruta resolta queda **dins de `documents/`** (`rutaDins`, a `src/main/fitxers.ts`).
- Esborrar un document, un contracte o un immoble esborra **també els fitxers del disc** (la BD només esborra les files).
- El nom al disc porta el prefix de l'`id` del document (sense col·lisions) i es neteja de caràcters reservats (`nomSegur`);
  `nom_original` es conserva a la BD tal com era.
- Obrir amb `shell.openPath()`; triar amb `dialog.showOpenDialog` **al Main** (el Renderer no envia mai rutes: només l'id, el tipus i el títol
  del diàleg, ja traduït); copiar amb `fs.copyFile`. Adjuntar és **tot o res**: si un fitxer falla, es desfan les files i s'esborren els ja copiats.

## Convencions de la BD

- `PRAGMA foreign_keys = ON` a **cada connexió**, i `journal_mode = WAL`. (La CLI `sqlite3` arrenca amb les claus foranes **desactivades**.)
- Dates com a text ISO `AAAA-MM-DD`, validades amb `CHECK (date(x) IS x)`. **`IS` i no `=`**: `date()` retorna `NULL` per a un text que no
  entén (`'2025-1-1'`, `'2025-13-45'`), i un `CHECK` només falla quan dona 0, no `NULL`.
- Booleans com a `INTEGER` 0/1 amb `CHECK (x IN (0,1))`. Imports i superfícies: `NUMERIC`, amb punt decimal.
- `afegit_el` i `ultima_mod` a **totes** les taules, en **UTC** (`datetime('now')`), mantinguts per triggers. A la interfície, convertir a hora local
  per mostrar-les.
- **L'app no veu els camps d'auditoria.** Els tipus TypeScript no els inclouen; els `SELECT` llisten les columnes explícitament (mai `SELECT *`); els
  `INSERT` i `UPDATE` no els toquen (si l'app escrivís `ultima_mod`, el trigger no s'activaria: només actua quan `NEW.ultima_mod IS OLD.ultima_mod`).
- Els triggers `AFTER INSERT` d'`afegit_el` fan un `UPDATE` intern que activa `ultima_mod`: és esperat (una fila nova queda amb `ultima_mod = afegit_el`).
- **Validacions que no són a la BD**: les columnes afegides amb `ADD COLUMN` no porten `CHECK`, i els tipus de document els valida el Main. El
  Renderer no és de fiar: cada regla es fa al formulari **i** al Main.
- **Migracions** (`PRAGMA user_version` i fitxers a `src/main/migrations/`, incrustats al codi amb `import.meta.glob(..., { query: '?raw', eager: true })`
  perquè funcionin empaquetats). Cada una s'aplica dins d'una transacció. **No s'edita mai una migració ja aplicada.** Una excepció feta una vegada:
  la `002` es va editar (`date(x) = x` → `IS`) abans que cap instal·lació real la fes servir; només s'havia aplicat a BD de desenvolupament, restaurades a la v1.
  - Una migració que **reconstrueix** una taula amb `AUTOINCREMENT` ha de conservar el comptador (`sqlite_sequence`), copiar les files amb els **mateixos
    `id`** (el nom del fitxer al disc en porta el prefix) i, si pot perdre dades, portar una **guarda** que l'aturi.
  - **No es reconstrueix `contractes`** (un `DROP TABLE` amb les claus foranes actives esborra, en cascada, els seus documents): s'hi afegeix amb `ADD COLUMN`.
  - Es proven **sempre sobre còpies**: la BD real copiada i una instal·lació des de zero (001 + ...), comparant recomptes i `id`.
  - La BD original (migrada de Base) es va marcar `user_version = 1` **sense executar** la 001. Se n'ha eliminat la línia `CREATE TABLE sqlite_sequence`
    (taula interna: crear-la fa fallar la migració).

| Migració | Contingut |
|---|---|
| `001_inicial` | `inmobles`, `inquilins`, `contractes`, `documents_contracte`, índexs i triggers (solapament i auditoria). |
| `002_contractes_documents` | Reconstrueix `contractes` i `documents_contracte` (buides): segon inquilí, lloguer actual, revisió, fiança i devolució; crea `tipus_document` (després eliminada). |
| `003_documents_immoble` | Afegeix `documents_immoble`. |
| `004_camps_immoble_documents` | Sis columnes noves a `inmobles`; reconstrueix `documents_immoble` (sense `CHECK` de tipus, comentari opcional). |
| `005_fianca_i_tipus_fixos` | Quatre columnes noves a `contractes`; reconstrueix `documents_contracte` (`tipus` de text); elimina `tipus_document`. |

## Esquema

| Taula | Descripció |
|---|---|
| `inmobles` | Adreça (`via`, `num_via`, `pis`, `porta`, `codi_postal`, `localitat`, `provincia`), `ref_catastral`, `superficie_m2`, `superficie_pati`; certificat energètic (`cert_en_reg`, `cert_en_class`, `cert_en_data`, `cert_en_caduc`); cèdula d'habitabilitat (`ced_hab_reg`, `ced_hab_data`, `ced_hab_caduc`, `ced_hab_superficie_util`); cadastre i compra (`val_cadastral_total`, `val_cadastral_constr`, `any_construccio`, `data_compra`, `valor_compra`). Les dates no porten `CHECK` (contenen dades reals i el selector de dates ja protegeix l'app). |
| `inquilins` | `nom`, `cognoms`, `nif`, `telefon_1` i els indicadors `ck_tel1_wassap` i `ck_tel1_bizum` (a l'app són `boolean`; la conversió 0/1/NULL és només a `inquilins.ts`). Cap camp és obligatori a la BD; el formulari exigeix nom o cognoms. |
| `contractes` | Vegeu "Contractes". FK a `inmobles` i a `inquilins` (dues vegades). |
| `documents_contracte` | `id_contracte` (`ON DELETE CASCADE`), `tipus` (text, validat pel Main), `nom_original`, `ruta`, `comentaris` (opcional), `data_document` (opcional, ISO). |
| `documents_immoble` | `id_inmoble` (`ON DELETE CASCADE`), `tipus` (text, validat pel Main), `nom_original`, `ruta`, `comentaris` (opcional), `data_document` (opcional, ISO). |

## Regles de negoci

- **Un immoble no pot tenir contractes amb períodes solapats.** Ho fan complir dos triggers (`contractes_no_solapar_ins` i `_upd`):
  `data_fi` buida = contracte **vigent** (es tracta com `9999-12-31`); el **dia final és inclusiu** (si un contracte acaba el 31-03, el següent
  comença l'01-04 com a molt d'hora); només intervenen `data_inici` i `data_fi` reals (`d_fi_prevista` no compta).
- Restriccions de dates: `data_fi >= data_inici` i `d_fi_prevista >= data_inici`.
- Un immoble o un inquilí **amb contractes no es pot eliminar** (`FK_VIOLADA`). Eliminar un immoble sense contractes esborra els seus documents.
- Un contracte nou **sense** `data_fi` solapa amb qualsevol d'un altre posterior del mateix immoble: per registrar un contracte antic, hi cal posar la
  data de fi des del primer moment.

## Immobles

- **Llista** (`/immobles`): `Id`, adreça, localitat, referència cadastral, superfície (amb `m²`), **Avisos** (caducitats del certificat i de la cèdula i
  l'etiqueta "Contractes amb avisos"), icona d'editar a la primera columna i un menú d'accions (**Contractes, Documents, Editar, Eliminar**).
- **Avisos de caducitat**: certificat i cèdula, a **60 dies** (`DIES_AVIS`) i també un cop caducats. El dia de caducitat el document encara és vigent.
- **"Contractes amb avisos"**: algun dels contractes que surten a "Últims contractes" (els en curs i l'últim) té algun avís. No compten els tancats antics:
  un "Devolució pendent" de fa anys avisaria per sempre. Surt a la llista i a la barra taronja de l'edició.
- **Edició** (`/immobles/nou` i `/immobles/:id`), en pantalla pròpia:
  - Títol "Editar immoble" amb el subtítol "Id N: adreça" (o "Nou immoble", sense subtítol), barra taronja d'avisos i **una sola fila de botons**:
    *Contractes*, *Documents*, *Immoble nou* i *Eliminar* a l'esquerra; *Tornar* i *Desar* a la dreta. Res a sota. El botó *Desar* queda enllaçat amb el
    formulari per l'atribut `form`.
  - Dues pestanyes amb la capçalera sempre visible: **Adreça i cadastre** (Adreça; Cadastre: referència, superfície, superfície del pati, valors
    cadastrals, any de construcció, data i valor de compra) i **Certificat i cèdula** (Certificat energètic; Cèdula d'habitabilitat amb la superfície útil).
  - **Desar es queda a la pantalla** (refresca subtítol i avisos); un immoble nou passa a `/immobles/:id`. Si la validació falla, el formulari canvia a la
    pestanya del primer camp amb error.
  - **Canvis sense desar** (`form.isDirty()`): *Tornar* i els botons que canvien de pantalla pregunten (`CanvisSenseDesar`: Desar i continuar / Descartar /
    Cancel·lar). **No cobreix el menú lateral ni `Ctrl+R`**: `HashRouter` no té `useBlocker` (caldria un router de dades). **Escape** fa el mateix que Tornar
    (no actua amb una finestra o un calendari obert) i **Intro** desa.
  - **Validacions** (formulari i Main, `validacionsImmoble.ts`), cada regla entre dos camps només si hi són els dos: superfície útil <= superfície; valor
    cadastral de la construcció <= total; data de compra >= 1 de gener de l'any de construcció; any entre 1800 i l'any actual; imports >= 0.
- **Documents d'immoble** (`/immobles/:id/documents`):
  - Tipus (llista fixa al codi, `TIPUS_DOCUMENT_IMMOBLE`): `certificat_energetic`, `cedula_habitabilitat`, `fitxa_cadastral`, `fotos`, `altres`.
  - **Documents únics** (`TIPUS_UNICS_IMMOBLE`: certificat, cèdula i fitxa cadastral): un sol document per immoble, garantit **només per l'app**. Es
    gestionen des de l'edició, amb un **clip** al costat del títol de la seva secció: sense document, *Afegir*; amb document, *Visualitzar*, *Editar* i
    *Eliminar*. *Afegir* i *Editar* demanen només el comentari (opcional) i, a la fitxa cadastral, la data; la data d'un certificat o d'una cèdula és la de
    la secció de l'immoble (no es copia). Es desen a l'instant, sense passar per Desar; en un immoble nou, el clip és desactivat. El diàleg del sistema només
    deixa triar un fitxer.
  - **Pantalla de documents**: títol, adreça i una fila *Afegir* (esquerra) / *Tornar* (dreta, porta a l'edició). Llista per ordre d'adjuntat amb menú
    *Visualitzar*, *Editar* i *Eliminar*; els tres tipus únics només *Visualitzar* i *Eliminar*. *Afegir* i *Editar* ofereixen només **Fotos i Altres**.
  - **Adjuntar**: tipus, data i comentari comuns; **el comentari és opcional**. Una fila per fitxer, ordenats pel nom (ordre numèric: `x2` abans de `x10`);
    amb més d'un, el comentari es numera (`1. Sala`; sense comentari, `1.`; amb zero davant a partir de 10).

## Inquilins

- Llista (`/inquilins`) amb alta i edició en **modal**, validació (cal nom o cognoms) i eliminació amb confirmació. Edició i eliminació, icones amb `Tooltip`.

## Contractes

### Model

- Un contracte lliga un **immoble** amb un **inquilí** i un segon inquilí opcional. Un immoble té molts contractes al llarg del temps, mai solapats.
- **No hi ha pròrroga**: el contracte continua vigent passada la `d_fi_prevista`. Quan acaba de debò, es **tanca** (`data_fi`) i, si cal, es crea un
  contracte nou pel mateix inquilí, que es gestiona com un altre (fiança nova, sense relació amb l'anterior). El tancat conserva la devolució de la fiança.
- Les dades de fiança i de devolució són a `contractes`; els fitxers, a `documents_contracte`. El contracte **no** guarda l'`id` de cap document.

### Columnes de `contractes`

| Grup | Columnes |
|---|---|
| Bàsiques | `id_inmoble`, `data_inici`, `data_fi` (buida = vigent), `motiu_fi`, `id_inquili`, `id_inquili_2` (opcional), `d_fi_prevista`, `comentaris` |
| Lloguer | `lloguer_inicial`, `lloguer_actual`, `data_ultima_revisio` (obligatòria, ISO, `>= data_inici`) |
| Fiança (ingrés) | `fianca_import` (la **fiança INCASOL**), `fianca_adicional` (`NOT NULL DEFAULT 0`), `fianca_nc` (registre INCASOL, p. ex. `NC 0230241403599`), `fianca_data_model2`, `fianca_data_ingres`, `fianca_data_notificacio`, `fianca_num_registre` (el de la notificació), `fianca_comentari` (incidències amb l'INCASOL) |
| Devolució | `devolucio_nc`, `devolucio_data_sollicitud`, `devolucio_data_cobrament` (abonament de l'INCASOL), `devolucio_import` (import a retornar a l'inquilí), `devolucio_motiu` (**justificació** de l'import) |

`motiu_fi` pren un valor de `MOTIUS_FI`: `no_renovacio`, `voluntaria`, `nou_contracte`, `altres` (nom visible traduït a `contractes.motiusFi.*`).

### Regles

**A la BD** (`CHECK`): `id_inquili_2 <> id_inquili`; `fianca_nc` i `fianca_data_model2` o les dues o cap; `fianca_num_registre` i `fianca_data_notificacio` o les
dues o cap; les dades de devolució (dates, import i motiu) només amb el contracte tancat; dates ISO.

**Al Main i al formulari** (`preparar`, a `contractes.ts`):
- `devolucio_nc` i `devolucio_data_sollicitud` s'informen **junts**; `devolucio_nc` i `motiu_fi` només amb el contracte tancat.
- L'abonament no pot ser anterior a la sol·licitud, ni la sol·licitud a la data de fi (només es compara si les dues dates tenen format ISO).
- Imports, lloguers i fiança addicional >= 0 (la fiança addicional, si no arriba, és 0). `motiu_fi` ha de ser de la llista.
- **Justificació obligatòria** si l'import a retornar és inferior a `fianca_import + fianca_adicional`.

### Lloguer actual i revisió

- En **crear**, el Main fixa `lloguer_actual = lloguer_inicial` i `data_ultima_revisio = data_inici` (ignora el que arribi). Un trigger no pot fer-ho: la
  columna `NOT NULL` fallaria abans.
- En **actualitzar**, `id_inmoble` s'ignora (l'immoble no es pot canviar). Mentre el contracte no s'ha revisat mai (`data_ultima_revisio = data_inici`), si el lloguer
  actual i la data de revisió arriben iguals als desats, segueixen el lloguer inicial i la data d'inici. Si arriben diferents, és una revisió feta des del
  formulari i s'accepta. (Cas límit assumit: una revisió feta el mateix dia que `data_inici` no es distingeix de "mai revisat".)
- **Revisar lloguer** és un botó del formulari que obre una finestra (import i data **alhora**; l'import pot ser igual: lloguer congelat) i **no escriu a la BD**:
  només posa els dos valors als camps, que es desen amb *Desar*. Desactivat amb el contracte tancat. No hi ha historial de revisions.

### Formulari (`/immobles/:id/contractes/nou` i `/immobles/:id/contractes/:idContracte`)

- L'immoble és fix (no es pot canviar ni en crear ni en editar). Títol "Nou contracte" / "Editar contracte" i l'adreça com a subtítol. Si hi ha avisos (només en
  editar), una **barra taronja** sota el subtítol, una línia per avís.
- **Una sola fila de botons**: *Desar* (`IconCheck`), *Documents*, *Afegir* i *Eliminar* a l'esquerra (els tres últims, en editar); *Tornar*
  (`IconCornerUpLeft`) a la dreta. Res a sota. **Ctrl+S** desa; **Intro no desa**; **Escape** = Tornar. Tornar i els botons que canvien de pantalla pregunten si
  hi ha canvis sense desar. Cap tecla actua si hi ha una finestra o un desplegable **visible** (`hiHaCapaOberta`, `utils/teclat.ts`: els desplegables de Mantine
  poden quedar muntats i amagats). *Eliminar* no pregunta pels canvis.
- **Desar es queda a la pantalla**; un contracte nou passa a l'edició. Si la validació falla, canvia a la pestanya del primer camp amb error.
- **Pestanya Dades**:
  - *Dades del contracte*: immoble (de només lectura), inquilins (desplegables cercables), *Inici* (amb el clip del document *Contracte*), *Fi prevista* i comentari.
  - *Lloguer*: primera fila *Lloguer inicial*, *Fiança INCASOL* i *Fiança addicional*; segona fila (en editar) *Lloguer actual* i *Última revisió* (de només lectura) i
    el botó *Revisar lloguer* a la dreta.
  - *Tancament*: *Data de fi* (**sempre editable**, també en un contracte nou), *Motiu de fi*, *Import a retornar* i *Justificació de l'import a retornar*
    (multilínia). Els tres últims, **desactivats** mentre no hi ha data de fi. En posar la data de fi per primer cop, l'import a retornar surt amb la **suma de les dues
    fiances**. Esborrar la data de fi buida els camps de tancament i de devolució i els desactiva. La justificació és obligatòria si l'import és inferior a la suma.
- **Pestanya Fiança INCASOL**: *Ingrés de la fiança* (NC, data del model 2, data de l'ingrés, núm. de registre i data de la notificació), *Devolució de la fiança*
  (NC, data de sol·licitud i data d'abonament, desactivats sense data de fi) i *Comentari*. Un camp desactivat es distingeix amb el fons gris de Mantine.
- **Notificacions en desar**: si un contracte obert passa a tancat i té fiança, avís groc "queda pendent gestionar la devolució"; si és obert, té *Fiança INCASOL* > 0 i
  no té data d'ingrés, avís groc "cal gestionar l'ingrés a l'INCASOL" (a cada desat mentre sigui pendent).
- Un contracte tancat demana confirmació abans d'editar-lo (des de la llista).

### Documents del contracte

- **Tipus fixos al codi** (`TIPUS_DOCUMENT_CONTRACTE`): `contracte`, `annex`, `fianca_model2`, `fianca_notificacio`, `fianca_model3`, `rebut`, `altres`, `documents_inquili`.
  El nom visible surt de `documents.tipus.<tipus>`. **No hi ha taula de tipus, ni classes, ni sembrat.**
- **Documents únics** (`TIPUS_UNICS_CONTRACTE`: contracte, model 2, notificació i model 3), amb un **clip** al costat de la data de la seva secció del formulari: *Inici*,
  *Data del model 2*, *Data de la notificació* i *Data de sol·licitud* (model 3). Un sol document per contracte, garantit només per l'app. Sense document, *Afegir*
  obre **directament** el diàleg del sistema (un sol fitxer, sense comentari); amb document, *Visualitzar* i *Eliminar* (no hi ha *Editar*: per canviar el fitxer, s'elimina i
  se'n torna a adjuntar un). Es desen a l'instant, sense passar per Desar, i refresquen la barra d'avisos. En un contracte nou, els clips són desactivats. La **data**
  no es desa: es mostra la de la secció del contracte.
- **Tipus lliures** (`TIPUS_LLIURES_CONTRACTE`: annex, rebut, altres i **documents de l'inquilí**, que són dades sensibles i es guarden amb el contracte), només des de la
  pantalla de documents.
- **Pantalla de documents** (`/immobles/:id/contractes/:idContracte/documents`): títol, subtítol (adreça i data d'inici), barra d'avisos de documents que falten i una fila
  *Afegir* (esquerra) / *Tornar* (dreta, porta al formulari). Llista per ordre d'adjuntat, amb menú *Visualitzar*, *Editar* i *Eliminar* (els quatre tipus únics, sense *Editar*).
  *Afegir* i *Editar* ofereixen només els tipus lliures.
- **Adjuntar**: el comentari és **opcional**; amb diversos fitxers, una fila per fitxer ordenats pel nom (ordre numèric), amb el comentari numerat (`1. Sala`; sense
  comentari, `1.`; amb zero davant a partir de 10). Els tipus únics només deixen triar un fitxer.

### Avisos

| Avís | Quan | Només per a |
|---|---|---|
| Fi prevista | A **90 dies** de `d_fi_prevista` (`DIES_AVIS_FI`), i també un cop passada (sense pròrroga, és l'única senyal) | contractes vigents |
| Revisió de lloguer | A **30 dies** (`DIES_AVIS_REVISIO`) de l'aniversari de l'última revisió (`data_ultima_revisio` + 1 any), i també un cop passat | contractes vigents |
| Ingrés pendent | *Fiança INCASOL* > 0 i sense data d'ingrés | contractes vigents |
| Falten documents | Una data (model 2, notificació o sol·licitud de devolució) sense el document del seu tipus | tots |
| Devolució pendent | Contracte tancat amb model 2, notificació o sol·licitud i **sense data d'abonament** | contractes tancats |

Es calculen a `utils/avisosContracte.ts` (les mateixes funcions per a les llistes, "Últims contractes", la barra de l'edició i l'etiqueta d'Immobles) i es comparen sempre
només els dies, en hora local. Risc assumit: un contracte antic amb la fiança ja retornada però no anotada avisa fins que s'hi posa l'abonament. Els indicadors de
documents (`te_doc_model2`, `te_doc_notificacio`, `te_doc_model3`) els calcula el Main amb un `EXISTS` sobre `documents_contracte`.

### Llistes

- **Llista d'un immoble** (`/immobles/:id/contractes`, s'hi entra des d'Immobles): l'últim primer (`data_inici` descendent), amb els dos inquilins (`JOIN` al Main), estat
  *Vigent* / *Tancat*, dates, lloguer actual, avisos apilats i un menú d'accions. Títol i, a sota, *Afegir* (esquerra) i *Tornar* (dreta), amb icona. Icona d'editar a la primera columna.
- **Menú d'accions** (també a "Últims contractes"): **Documents, Editar i Eliminar**, igual per a vigents i tancats. Tancar un contracte, la devolució de la fiança i la revisió del
  lloguer es fan des del formulari. Eliminar demana confirmació i avisa que s'esborren la fiança i els documents adjunts (fitxers inclosos).
- **Últims contractes** (`/ultims-contractes`): una fila per contracte, amb l'adreça repetida si un immoble en té dos. De cada immoble surten els contractes **en curs**
  (sense `data_fi`, o amb `data_fi` d'avui o posterior) **més el de `data_inici` més recent** (en empat, l'`id` més alt). Així: un vigent amb un d'antic, només el vigent; un
  tancat a futur amb un de posterior, els dos; tots acabats, només l'últim. Els immobles sense contracte hi surten ("Sense contracte" i un botó *Afegir*). Només dos estats
  visibles (un tancat a futur surt com a *Tancat*, amb la data de fi a la columna). L'adreça porta a la llista de contractes de l'immoble.

## Convencions de l'app

- **Main i Renderer**: tota la lògica de BD i fitxers és al **Main**; React només crida per IPC (`window.api.*`), amb els tipus a `src/preload/index.d.ts`. Cada bloc nou de l'API
  s'afegeix als **dos** fitxers del preload (`index.ts` i `index.d.ts`) i **dins de `api`**, no dins d'un altre bloc (si s'oblida, el `typecheck` falla només a l'`.d.ts`: la consola de
  les DevTools no comprova tipus). Blocs actuals: `inmobles`, `inquilins`, `config`, `contractes`, `documents`, `documentsImmoble` i `app` (versió i obrir enllaços).
- **Resposta dels handlers**: `Resultat<T> = { ok: true; dades: T } | { ok: false; error: CodiError }`. `CodiError`: `CONTRACTE_SOLAPAT`, `FK_VIOLADA`, `CHECK_VIOLAT`,
  `FITXER_NO_TROBAT`, `DESCONEGUT`. El Main converteix les excepcions de `better-sqlite3` (`SQLITE_CONSTRAINT_TRIGGER`, `_FOREIGNKEY`, `_CHECK`) amb `traduirError`, mai retorna
  el text de SQLite; el Renderer ho tradueix amb `t('errors.<CODI>')` i `esOk(resposta)` (`utils/resultat.ts`) notifica l'error traduït i retorna `false` si ha fallat.
  `executar` i `executarAsync` (diàlegs i obrir fitxers) embolcallen les operacions.
- **Tipus compartits** a `src/shared/tipus.ts` (el Renderer no importa de `src/main/`, que carrega `better-sqlite3` i `electron`); `src/shared/**/*` és als `include` de
  `tsconfig.node.json` i `tsconfig.web.json`. Cap tipus inclou els camps d'auditoria.
- **Formularis**: el formulari es munta **després** de carregar les dades (valors inicials sense `reset`), amb una `key` diferent per a "nou" i "edició". Els formularis llargs són
  una pantalla pròpia amb ruta (`/x/nou`, `/x/:id`); els curts (inquilins), un modal que es munta només mentre és obert. Els camps de text buits es desen com a `NULL` (`buitANull`).
- **ESLint `react-hooks/set-state-in-effect`**: no es pot cridar dins d'un `useEffect` una funció que fa `setState`. Es llegeix amb `.then()` dins mateix de l'efecte, amb un
  indicador `cancelat`, i es recarrega amb un comptador (`versio`) a les dependències.
- **Pantalles noves: cap botó a sota.** Les accions van a la capçalera, al costat del títol (si la llista o el formulari és gran, els botons de sota es perden). Pendent d'unificar
  aquest criteri a la resta (vegeu "Pendents").
- **Icones**: `@tabler/icons-react`. Editar i eliminar a Inquilins i als documents d'un contracte, icona sola amb `Tooltip` i `aria-label` traduïts, **una columna per icona**;
  la resta d'accions, un **menú d'accions** d'una sola icona amb icona i text. Les accions principals (Afegir) són botons amb icona. Els avisos es mostren apilats (`Stack`).
- **Components i utilitats compartits** (a `src/renderer/src/`): `CampData` (data amb entrada manual, `DD/MM/AAAA`, que arregla un error que girava el dia i el mes),
  `CampNumeric` (`NumberInput` amb punt de milers, coma decimal i unitat `€` o `m²` segons l'idioma actiu), `CanvisSenseDesar`, `AccionsContracte`, `AvisosContracte`;
  `utils/`: `adreca`, `dates` (`formatData`), `formats` (`formatM2`), `formulari` (`buitANull`, `aNumero`, `aNumeroForm`), `inquilins` (`nomInquili`), `caducitat`,
  `avisosContracte`, `avisosImmoble`, `teclat`, `useEditarContracte`, `resultat`.
- **Quant a**: icona, versió (la del `package.json`, via el Main), descripció, autor, llicència i repositori, tecnologies i la menció a Claude, amb enllaços que s'obren al navegador
  del sistema. L'obertura passa pel Main (`app:obrirEnllac`), que **només accepta `https`**; el `setWindowOpenHandler` de la finestra també.
- **Icona de l'aplicació**: `build/icon.png` (paquet), `resources/icon.png` (finestra) i `src/renderer/src/assets/icon.png` (Quant a) han de ser **iguals**. `build/icon.icns` i
  `build/icon.ico` són encara els de la plantilla (només es fan servir a macOS i Windows).
- `App.tsx` només tria entre pantalles (`ProvesMantine` o `lloguers.tsx`); no s'hi escriu lògica. La pantalla principal és `src/renderer/src/lloguers.tsx`.

## Llibreria d'UI

- **Mantine 9.7.1** (decisió definitiva, escollida per davant de Fluent UI v9 i MUI: formularis, dates, modals i notificacions integrats i gratuïts, i bon tipat TypeScript).
  Paquets: `core`, `hooks`, `form`, `dates` (amb `dayjs`), `notifications` i `modals`, **tots a la mateixa versió**. Complements: `react-router-dom` (amb **`HashRouter`**:
  l'app empaquetada es carrega des de `file://`) i `@tabler/icons-react`.
- Seguir sempre la documentació de la **versió instal·lada** (les versions majors han canviat coses; evitar tutorials antics). La documentació consultable arriba fins a la v8:
  cal vigilar el `typecheck` en cada component nou.
- **Dates**: a la BD, text ISO `AAAA-MM-DD`; `DatePickerInput` i `DateInput` treballen directament amb aquest text, així que **no cal convertir** entre `Date` i text. Mai usar
  `toISOString()` (passa per UTC i pot desplaçar el dia); per a "avui" o càlculs, dayjs en hora local: `dayjs().format('YYYY-MM-DD')`. `minDate` accepta text ISO.
- **Números**: els formularis fan servir `CampNumeric` (el valor és un número, o `''` si és buit) i `aNumeroForm` per llegir-lo. Es desen amb punt decimal i `NULL` si són buits.
- **Menú de l'esquerra**: Immobles, Últims contractes, Inquilins, Configuració i Quant a. Contractes no té entrada pròpia: s'hi entra des d'Immobles.
- **Tecles**: a Contractes, Ctrl+S desa i Escape torna (amb protecció de canvis); a Immobles, Intro desa i Escape torna (vegeu "Pendents").

## Multiidioma (i18n)

La interfície és en català i castellà, i es poden afegir més idiomes sense tocar la lògica. L'idioma es tria el primer cop que s'obre l'app i es guarda a `~/Lloguers/config.json`.

### Principis

- **Només es tradueix la interfície**, no la BD. Taules i columnes es queden en català.
- **Idioma de referència**: català (`ca`). `ca.json` dona el tipat de les claus; `es.json` ha de tenir les mateixes.
- **Llibreria**: `i18next` + `react-i18next`, només al Renderer. El Main no té traduccions.
- **Llista d'idiomes**: una sola constant, `IDIOMES`, a `src/shared/tipus.ts` (`['ca', 'es'] as const`); el tipus `Idioma` se'n deriva, i tant el Main (per validar) com el Renderer
  (per als selectors) la fan servir.
- **Nom de cada idioma**: cada JSON porta `idiomaNom` amb el nom de l'idioma **en el seu propi idioma** ("Català", "Castellano"); els selectors el llegeixen del recurs de cada idioma
  (`i18n.getFixedT(codi)('idiomaNom')`), no de l'idioma actiu.
- **Valors enumerats de la BD** (tipus de document, motius de fi): són **claus internes**; a la pantalla es mostren amb `t('documents.tipus.<tipus>')`,
  `t('documentsImmoble.tipus.<tipus>')` o `t('contractes.motiusFi.<motiu>')`.

### Afegir un text nou

Sempre en tres passos: (1) la clau a `ca.json`, (2) la mateixa clau a `es.json`, (3) `t('camí.de.la.clau')` al component. Mai escriure textos a mà dins d'un component. Només `ca.json`
es valida: si falta una clau a `es.json`, no hi ha error i es veu el text en català. Comprovació de claus iguals (necessita `jq`; **sense `jq` diu `claus iguals` sempre**), des de
`src/renderer/src/i18n/`:

```bash
diff <(jq -r 'paths(scalars) | join(".")' ca.json | sort) <(jq -r 'paths(scalars) | join(".")' es.json | sort) && echo "claus iguals"
```

Les claus dels errors (`errors.<CODI>`) han de coincidir amb els valors de `CodiError`.

### Afegir un idioma nou

1. Crear el JSON (copiant `ca.json`, amb `idiomaNom` i tots els textos traduïts). 2. Afegir-lo als `resources` d'`i18n/index.ts`. 3. Afegir el codi a `IDIOMES`.
4. Afegir el locale de dayjs a `main.tsx` (`import 'dayjs/locale/xx'`), per als calendaris.

### Idioma triat i primer arrencament

**On es guarda**: `~/Lloguers/config.json`, a la carpeta de la BD (així entra a les còpies de seguretat). Format `{ "idioma": "ca" }`. Només el **Main** el llegeix i l'escriu, per IPC
(`config:obtenir`, `config:desar`); valida l'idioma amb `IDIOMES` abans d'escriure.

**Què fa l'app en arrencar**, abans de pintar res:

1. El Renderer (a `main.tsx`) demana la configuració amb `config:obtenir`.
2. El Main respon `{ idioma, confirmat }`: si `config.json` existeix i és vàlid, `confirmat = true` i l'idioma del fitxer; si no, `confirmat = false` i l'idioma per defecte
   (la part d'idioma de `app.getLocale()`, p. ex. `es-ES` → `es`, si és a `IDIOMES`; si no, `ca`). **El Main no escriu res.**
3. Si `confirmat = false`, el Renderer mostra la **pantalla de selecció d'idioma**: una llista de botons, cadascun amb el seu `idiomaNom`, amb el per defecte preseleccionat; el títol i
   el botó de confirmar surten en l'idioma ressaltat (canvia en memòria; no es desa res fins a confirmar). Només en confirmar es crida `config:desar`.
4. Amb l'idioma definitiu, el Renderer fa `i18n.changeLanguage` i pinta l'app.

**Registre a la consola** (mentre es depura): el Main escriu a la terminal l'idioma que detecta, si l'app el té, si `config.json` existia i era vàlid, i el resultat; el Renderer, a les
DevTools, si mostra la pantalla i què tria l'usuari. **Per provar-ho**: esborrar `config.json` a mà reprodueix el primer arrencament (la detecció de l'idioma del sistema no es pot
provar canviant el SO).

### Dates i números, textos del Main

A la BD, ISO `AAAA-MM-DD`; es formaten només a la interfície segons el locale actiu (dayjs o `Intl`); `DatesAmbIdioma` (embolcalla `DatesProvider`) segueix l'idioma actiu. Els diàlegs
natius (`dialog.showOpenDialog`) reben els títols **ja traduïts** del Renderer.

## Distribució

- `electron-builder.yml`: `appId: com.lmoreso.lloguers`, `productName: Lloguers`, `linux.target` = `AppImage` + `deb` (`snap` fora: necessita `snapcraft`), `npmRebuild: false` i
  **`asarUnpack: '{resources/**,node_modules/better-sqlite3/**}'`, que ha de ser un sol text** (la validació rebutja una llista). No hi ha bloc `publish` (no hi ha actualitzacions automàtiques).
- `better-sqlite3` 13 porta els binaris a `prebuilds/<plataforma>.node`; només ens cal `linux-x64` (excloure la resta és opcional, per reduir la mida).
- `chrome-sandbox` necessita `chown root:root` i `chmod 4755` (a `node_modules/electron/dist/` i, en proves amb `build:unpack`, a `dist/linux-unpacked/`).
- L'app empaquetada i `npm run dev` **comparteixen `~/Lloguers/`**. Les proves d'empaquetat amb dades reals es fan a l'amfitrió, **amb una còpia de seguretat de la BD abans**
  (les migracions s'apliquen soles en la primera arrencada). Les proves amb un `HOME` fals (`HOME=/tmp/provahome ./dist/linux-unpacked/lloguers`) simulen una instal·lació des de zero.
- La versió és la del `package.json` (`app.getVersion()`).

## Diferències amb la guia

1. La guia desa la BD a `app.getPath('userData')`; aquí s'usa `~/Lloguers/`.
2. La guia crea les taules amb `db.exec` dins de `database.ts`; aquí s'apliquen migracions SQL.
3. La guia només té una taula `clients` d'exemple; l'esquema real és el descrit a dalt.
4. Error a l'`App.tsx` de la guia: `</tr</thead>` ha de ser `</tr></thead>`.
5. La guia declara `window.api` a un `electron.d.ts` a l'arrel; aquí es declara a `src/preload/index.d.ts`, que la plantilla ja inclou a `tsconfig.web.json`.
6. La guia és antiga: Electron **39** (diu 33), Vite **7** (diu 5), i la configuració de distribució no va a `package.json` sinó a `electron-builder.yml`.

## Estat

**Fet**: base (projecte, BD amb migracions, tipus compartits); backend de tots els blocs (immobles, inquilins, configuració, contractes, documents i documents d'immoble); base de la UI
(Mantine, i18n, router, utilitats); Inquilins; Immobles (llista, edició en pestanyes, avisos, camps nous, documents únics i pantalla de documents); Contractes (formulari reorganitzat amb
fiança INCASOL i devolució, documents amb clips i pantalla pròpia, avisos, "Últims contractes"); idioma al primer arrencament; primera versió empaquetada (`.deb`, icona, Quant a).

**Pendents** (decidits, no fets):

- **Revisar la UI**: la navegació entre pantalles, el botó "Descartar" del diàleg de canvis sense desar (resulta confús) i el criteri "cap botó a sota" als formularis que encara en tenen
  (Inquilins, en modal).
- **Immobles**: unificar l'Escape amb `hiHaCapaOberta` i fer servir Ctrl+S (ara fa servir un `querySelector` directe i Intro).
- **`CampData`**: el `dateParser` construeix la data amb `new Date(any, mes - 1, dia)`, i JavaScript desplaça les dates inexistents (`30/02/2025` passa a ser el 2 de març); cal comprovar
  que el dia i el mes resultants coincideixen amb els escrits.
- **Fase 3 de contractes** (no analitzada en detall; convé un resum funcional abans de programar): corregir l'immoble d'un contracte mal assignat (entrada al menú d'accions, amb desplegable;
  els documents no es mouen perquè van per `id_contracte`; el trigger de solapament ja valida el nou immoble), historial de revisions de lloguer i canvi de signants (annex; ara només s'edita
  `id_inquili` / `id_inquili_2` i no es guarda qui hi havia abans).
- **Configuració i Quant a**: Configuració només té el selector d'idioma. Pantalla de tipus de documents: ja no cal (són fixos al codi).
- **Empaquetat**: el `.deb` s'ha provat a l'amfitrió amb dades reals, però els passos posteriors (migracions 003 a 005, edició d'immoble, documents únics i fiança) encara no s'han
  empaquetat; la 005 reconstrueix `documents_contracte`, així que cal una còpia de seguretat abans d'instal·lar-hi.
- `traduirError` fa `console.error('Error de BD no reconegut:')` també per a errors que no són de BD (validacions del Main). Només cosmètic.

**Idees per a més endavant** (no decidides; l'usuari les demana si les vol):

- **Propietaris**: taula o camps als immobles (fins a 4, amb el seu % que ha de sumar 100), dades personals com a inquilins, amb IBAN.
- **Inquilins**: columna `Id` a la llista; camp IBAN; no deixar marcar WhatsApp o Bizum sense telèfon; documents de l'inquilí (DNI, vida laboral, nòmina...), de moment només com a tipus
  de document del contracte.
- **Llista de contractes**: columna `Id`; poder navegar entre immobles des de la capçalera. **Llista d'immobles**: acció per editar directament l'últim contracte.
- **Últims contractes**: immobles sense contracte al final, ordenats per adreça; que *Tornar* des d'un immoble porti a "Últims contractes".
- **Generals**: menú contextual (botó dret) als camps de dades (copiar, enganxar...); barra superior amb el nom de la pantalla; menú Sortir; submenús d'Immobles al menú lateral (Editar,
  Documents, Contractes).
- **Configuració**: ruta i nom de la BD a escollir (fitxer de configuració a una carpeta estàndard del SO), poder treballar amb diverses BD i carregar sempre l'última; mantenir l'idioma a la carpeta de la BD.
- **Empaquetat**: suport per a Windows (i icones de macOS i Windows).
