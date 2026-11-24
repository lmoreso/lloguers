## Manual: revisions del lloguer i cartes

Aquest manual explica com revisar el lloguer d'un contracte, com seguir les cartes de revisió que cal enviar als inquilins i com preparar-les amb el LibreOffice.

### 2. On es troba tot

| Què vull fer | On ho trobo |
|---|---|
| Fer o consultar les revisions d'**un contracte** | Formulari del contracte → botó **Revisions de lloguer**, a la dreta de *Lloguer actual* i *Última revisió* (només en un contracte ja desat). |
| Veure **totes** les cartes pendents d'enviar | Menú de l'esquerra → **Revisions de lloguer**. |
| Veure l'avís de que hi ha una carta pendent | Etiqueta **Carta pendent** a la llista de contractes i a *Últims contractes*, línia a la barra taronja de l'edició del contracte, i etiqueta *Contractes amb avisos* a la llista d'Immobles. |

### 3. Fer una revisió del lloguer, pas a pas

1. **Saps que toca revisar-lo** pels avisos: l'avís de revisió surt quan s'acosta l'aniversari de l'última revisió (per defecte, 30 dies abans) i continua després que hagi passat.
2. Obre el contracte i prem **Revisions de lloguer**.
3. A la pantalla, escriu el **% aplicat** (per exemple, `2`). L'aplicació calcula l'increment i el lloguer nou.
4. Si vols un altre import, **canvia l'*Increment aplicat*** (per exemple, 22 € en lloc dels 21,48 € calculats). El % que has escrit es conserva.
5. Revisa el **Dia d'efecte** (surt, per defecte, l'aniversari de l'última revisió) i, si cal, escriu un **Comentari**.
6. Prem **Desar** (o `Ctrl+S`). El contracte passa al lloguer nou, i la carta **queda pendent**.
7. Genera la carta (vegeu l'apartat 5.6) i envia-la.
8. Torna a la revisió, posa-hi la **Data d'enviament** i desa. La carta deixa de ser pendent.

---

### 4. La pantalla de revisions d'un contracte

#### 4.1 Què hi veus

A dalt: el títol, l'adreça i la data d'inici del contracte, i una línia amb el **lloguer actual** i des de quan és vigent. Si l'última carta és pendent, també hi surt un avís taronja.

#### 4.2 Els camps

| Camp | Es pot editar? | Què fa |
|---|---|---|
| **Lloguer anterior** | No | El lloguer del qual parteix la revisió. |
| **% aplicat** | Sí | El percentatge que escrius. Pot ser negatiu (una baixada). Pot quedar buit. |
| **Increment calculat** | No | Lloguer anterior × % (arrodonit a cèntims). |
| **Increment aplicat** | Sí | El que s'aplica de debò. En escriure el %, es posa igual al calculat; després el pots canviar. |
| **Lloguer nou** | No | Lloguer anterior + increment aplicat. |
| **Dia d'efecte** | Sí | No pot ser anterior a l'última revisió. |
| **Data d'enviament de la carta** | Sí | Buida = carta pendent. Té un clip per adjuntar-hi la carta (vegeu 5.3). |
| **Comentari** | Sí | Text lliure. |

Dues regles de càlcul que convé saber:

- Si escrius un % i **després** canvies l'increment a mà, el % **no es recalcula**: es desa el que has escrit.
- Si tornes a canviar el %, l'increment aplicat **es recalcula** i perds l'import que havies posat a mà.

#### 4.3 Els botons

| Botó | Quan hi és | Què fa |
|---|---|---|
| **Desar** | Sempre | Desa la revisió. Si falta alguna dada, mostra l'error al camp. |
| **Nova revisió** | Quan edites una revisió ja desada | Obre el formulari per a una revisió nova. **Desactivat** si l'última carta és pendent, o si el contracte és tancat. |
| **Eliminar** | Quan edites una revisió ja desada | Elimina la revisió (vegeu 4.5). |
| **Tornar** | Sempre | Torna a la pantalla d'on venies. |

#### 4.4 Quina revisió s'obre en entrar

- Si **l'última revisió és pendent**, s'obre **aquella**, per poder-la completar (posar-hi la data d'enviament) o corregir. No pots crear-ne una de nova fins que s'enviï.
- Si **l'última està enviada**, o encara no n'hi ha cap, s'obre una **revisió nova**.

#### 4.5 Modificar i eliminar

- **Només es pot modificar o eliminar l'última revisió** d'un contracte. Les anteriors són historial i només es poden consultar. El llapis de la taula carrega l'última al formulari.
- Es pot modificar **encara que ja s'hagi enviat**. El contracte segueix el nou import i el nou dia d'efecte.
- **Desar no toca la data d'enviament**: la poses o l'esborres tu quan et convingui.
- **Eliminar** restaura el contracte: recupera el **lloguer** i la **data d'última revisió** que tenia abans d'aquella revisió. La confirmació et diu quins valors es restauraran.

#### 4.6 L'historial

A sota del formulari hi ha totes les revisions, **l'última primer**. La columna *Carta* mostra la data d'enviament, l'etiqueta **Pendent** o un guionet (`—`, per als increments de 0 €). Si n'hi ha moltes, la taula té una alçada màxima i apareix una barra de desplaçament, amb els títols de les columnes fixos.

#### 4.7 Contracte tancat

Amb el contracte tancat **no es poden crear revisions noves**. Es pot consultar l'historial i modificar o eliminar l'última.

#### 4.8 Dreceres de teclat

| Tecla | Efecte |
|---|---|
| `Ctrl+S` | Desa. |
| `Escape` | Torna (si hi ha canvis sense desar, pregunta abans). |
| `Intro` | **No desa.** |

Cap de les dreceres actua si hi ha una finestra o un desplegable obert.

---

### 5. Les cartes

#### 5.1 Estat d'una carta

| Estat | Condició | On surt |
|---|---|---|
| **Pendent** | Sense data d'enviament i increment ≠ 0 | Etiqueta *Pendent*, avisos, vista per al LibreOffice |
| **Enviada** | Amb data d'enviament | La data a la columna *Carta* |
| **No porta carta** | Increment de 0 € | Un guionet (`—`) |

Un lloguer congelat **no bloqueja** la revisió següent.

#### 5.2 Marcar una carta com a enviada

Obre la revisió (a la pantalla del contracte), escriu la **Data d'enviament de la carta** i prem **Desar**. Per tornar-la a deixar com a pendent, esborra la data (la creu del camp) i desa.

#### 5.3 Adjuntar la còpia de la carta

Al costat del títol de la *Data d'enviament* hi ha un **clip**. Serveix per guardar la carta (el PDF o el document) amb el contracte.

- El clip **només s'activa quan la revisió ja està desada i té una data d'enviament desada**. Mentre no hi sigui, al passar-hi el ratolí diu: *«Desa primer la revisió amb la data d'enviament per poder adjuntar-hi la carta.»*
- **Afegir** obre directament el diàleg del sistema; tries **un sol fitxer**.
- Quan hi ha una carta, el clip es torna blau. El menú mostra el nom del fitxer i **Visualitzar** i **Eliminar**. No hi ha *Editar*: per canviar-la, s'elimina i se'n torna a adjuntar una.
- Es desa amb el comentari automàtic *«Carta de la revisió del dd/mm/aaaa»*.

**Com se sap quina carta és de quina revisió:** per la data. La carta es desa amb la data del document igual a la data d'enviament. Per això:

- Si **canvies la data d'enviament** i deses, la carta **la segueix** automàticament.
- Si **buides** la data d'enviament, la carta es queda al contracte, a la pantalla de *Documents*, però **ja no queda lligada** a la revisió.
- Si **dues revisions del mateix contracte** tenen la mateixa data d'enviament, **comparteixen la carta**. Si t'hi trobes, posa dates diferents.
- Si **elimines la revisió**, la carta es queda al contracte com a document (no s'esborra cap fitxer).

Les cartes també surten a la pantalla **Documents** del contracte, només amb *Visualitzar* i *Eliminar*.

#### 5.4 Els avisos

L'avís **Carta pendent** surt a:

- la llista de contractes d'un immoble i a *Últims contractes* (etiqueta);
- la barra taronja de l'edició del contracte (una línia);
- la llista d'Immobles, dins l'etiqueta *Contractes amb avisos*.

Surt **també als contractes tancats**, perquè una carta sense enviar és feina pendent encara que el contracte hagi acabat. Desapareix quan la revisió té data d'enviament, o quan l'elimines.

#### 5.5 La pantalla «Revisions de lloguer» (global)

Menú de l'esquerra → **Revisions de lloguer**. És **només de consulta**: no s'hi modifica res.

- **Interruptor *Només pendents*** (activat per defecte): amb ell, es veuen només les cartes pendents d'enviar. Desactivat, es veuen **totes** les revisions, també les enviades i els increments de 0 €.
- Al costat hi ha el **recompte** de cartes pendents.
- **Ordre:** per dia d'efecte i, dins del mateix dia, per cognoms i nom del primer inquilí (alfabètic, tenint en compte els accents).
- **Columnes:** dia d'efecte, inquilins (el segon a sota), immoble, lloguer anterior, %, increment, lloguer nou, carta i comentari. A la columna del %, es mostra el que has escrit; si no n'hi ha cap, es mostra l'**efectiu** (increment ÷ lloguer anterior) en gris.
- **La icona de la primera columna** porta a les revisions d'aquell contracte, que és on es modifica.

#### 5.6 Generar la carta amb el LibreOffice

L'aplicació prepara les dades de les cartes en una **vista de la base de dades** que el LibreOffice pot llegir directament. No cal exportar res.

| Vista | Què conté |
|---|---|
| `v_cartes_pendents` | Les cartes **pendents**: sense data d'enviament i sense increments de 0 €. És la que s'usa per a la combinació de correspondència. |
| `v_revisions_lloguer` | **Totes** les revisions, enviades o no. |

> La connexió del LibreOffice a la base de dades (`~/Lloguers/lloguers.sqlite`) és directa i demana un controlador ODBC o JDBC per a SQLite, que s'ha de configurar al LibreOffice. Aquest manual no en detalla la configuració.

**Cada dada surt en dues versions:** la **crua** (per ordenar o calcular) i una de **text** (acaba en `_text`), ja amb el format de la carta: les dates com `05/03/2025` i els imports com `1.095,48`, **sense** el símbol de l'euro. Per a la carta, el més còmode és fer servir les versions `_text`.

| Grup | Camps principals |
|---|---|
| **Revisió** | `data_efecte_text`, `lloguer_anterior_text`, `lloguer_nou_text`, `increment_text`, `percentatge_text` (el que has escrit), `percentatge_efectiu_text`, `data_enviament_text`, `comentari`, `contracte_data_inici_text` |
| **Inquilins** | `inquilins_noms` («Anna Puig i Joan Mas»), `inquili_nom_complet`, `inquili_nif`, `inquili_telefon`, `inquili2_nom_complet`, `inquili2_nif`, `inquili2_telefon` (el segon és buit si no n'hi ha) |
| **Immoble** | `immoble_adreca`, `immoble_via`, `immoble_num_via`, `immoble_pis`, `immoble_porta`, `immoble_codi_postal`, `immoble_localitat`, `immoble_provincia`, `immoble_ref_catastral` |

Tres coses a tenir en compte:

- **L'ordre de la vista no és alfabètic de debò** (els accents i les majúscules no s'ordenen bé): si en vols un de bo, ordena des del LibreOffice.
- **És només de lectura.** Marcar una carta com a enviada es fa sempre a l'aplicació (apartat 5.2).
- **Les cartes enviades desapareixen de `v_cartes_pendents`** quan hi poses la data d'enviament. Per recuperar una carta ja enviada, fes servir `v_revisions_lloguer`.

---

### 6. Casos especials

**Lloguer congelat.** Escriu un % de `0` (o un increment de `0`). Es desa com a revisió, però no surt a les cartes pendents ni bloqueja la següent.

**Baixada de lloguer.** Escriu un % negatiu o un increment negatiu. És vàlid mentre el lloguer nou no sigui negatiu.

**Voler un import que no surt del %.** Escriu el % que et serveixi de referència i canvia l'*Increment aplicat*. A la carta pots posar el % que has escrit (`percentatge_text`) o l'efectiu (`percentatge_efectiu_text`).

**Revisions de contractes antics.** Els contractes revisats abans que l'aplicació tingués historial tenen **una fila consolidada** amb el comentari *«Revisió anterior a l'historial (consolidada)»*. Resumeix tot el salt de l'import inicial a l'actual, sense percentatge, i **no surt com a carta pendent**.
Si vols el detall d'un contracte, elimina aquella fila (el contracte torna al lloguer i a la data inicials) i introdueix les revisions una a una, **cronològicament**. A cada una, posa-hi una data d'enviament, perquè una carta pendent bloqueja la creació de la següent.

**Corregir una revisió equivocada.** Si és l'última, modifica-la o elimina-la. Si ja n'hi ha una de posterior, no es pot tocar: elimina primer les posteriors, de la darrera cap enrere.

---

### 7. Si no et deixa fer alguna cosa

| El que passa | Per què | Què fer |
|---|---|---|
| **Nova revisió** està desactivat | L'última carta és pendent, o el contracte és tancat | Posa la data d'enviament a l'última, o reobre el contracte (esborrant-ne la data de fi). |
| «El dia d'efecte no pot ser anterior a…» | El dia és anterior a l'última revisió | Posa un dia posterior. |
| «El lloguer nou no pot ser negatiu» | L'increment negatiu supera el lloguer anterior | Redueix la baixada. |
| El clip no s'activa | La revisió no està desada, o no té data d'enviament desada | Desa la revisió amb la data d'enviament i torna-ho a provar. |
| No puc modificar una revisió antiga | Només es pot tocar l'última | Vegeu «Corregir una revisió equivocada». |
| No trobo una carta pendent a la pantalla global | L'interruptor *Només pendents* amaga les enviades i els increments de 0 € | Desactiva l'interruptor per veure-ho tot. |
| El contracte no deixa crear revisions anteriors a l'última | Les revisions s'encadenen cronològicament | Vegeu «Revisions de contractes antics». |

---

### 8. Resum de regles

- El **lloguer actual** només el canvien les revisions.
- Una **carta és pendent** si no té data d'enviament i l'increment no és 0.
- **No es pot crear** una revisió si l'última carta és pendent, ni en un contracte tancat.
- Només es pot **modificar o eliminar l'última** revisió d'un contracte.
- **Eliminar** una revisió restaura el lloguer i la data anteriors.
- **Desar** no toca la data d'enviament.
- La **carta** es lliga a la revisió per la data d'enviament.
- Un **increment de 0 €** no porta carta i no bloqueja res.


