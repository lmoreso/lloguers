## Revisions del lloguer i cartes: resum per pantalles

Tres idees expliquen tot el que ve a continuació:

- Una **revisió** és cada vegada que puges (o baixes) el lloguer d'un contracte. Queda desada a l'historial del contracte.
- El **lloguer actual** del contracte només el canvien les revisions: no es pot escriure a mà al formulari.
- Una **carta és pendent** quan la revisió no té data d'enviament i l'increment és diferent de 0 €. Amb la data d'enviament informada, la carta es considera enviada.


### 1. Formulari del contracte

- A la dreta de *Lloguer actual* i *Última revisió* hi ha el botó **Revisions de lloguer**. Només hi és en un contracte ja desat, i porta a la pantalla de revisions d'aquell contracte. Si hi ha canvis sense desar, l'aplicació ho pregunta abans de sortir.
- *Lloguer actual* i *Última revisió* són de només lectura: es mouen quan es fa una revisió.
- Si el contracte té una carta pendent, la barra taronja de dalt ho avisa amb una línia.


### 2. Revisions d'un contracte (editable)

Aquesta pantalla té a dalt el lloguer actual, a sota el formulari de la revisió i, més avall, l'historial.

**El formulari**
- Escrius el **% aplicat** i l'aplicació calcula l'**increment calculat** (desactivat).
- L'**increment aplicat** surt igual al calculat, però el pots canviar a mà (per exemple, 22 € en lloc de 21,48 €). El % que has escrit es conserva. Si tornes a canviar el %, l'increment es recalcula.
- El **lloguer nou** és el lloguer anterior més l'increment aplicat (desactivat).
- El **dia d'efecte** no pot ser anterior a l'última revisió. La **data d'enviament** i el **comentari** són opcionals.

**Els botons**
- **Desar**, **Nova revisió**, **Eliminar** i **Tornar**. *Nova revisió* i *Eliminar* només hi són quan edites una revisió ja desada.
- `Ctrl+S` desa i `Escape` torna. `Intro` no desa.

**Quina revisió s'obre**
- Si l'última carta és pendent, s'obre aquella, perquè la completis o la corregeixis.
- Si l'última ja s'ha enviat (o no n'hi ha cap), s'obre una revisió nova.

**Regles que convé recordar**
- No es pot crear una revisió nova mentre l'última carta sigui pendent, ni en un contracte tancat.
- Només es pot modificar o eliminar l'última revisió. Les anteriors són historial.
- Eliminar una revisió restaura el lloguer i la data d'última revisió que el contracte tenia abans.
- Desar no toca la data d'enviament: la poses o l'esborres tu.
- Un increment de 0 € (lloguer congelat) es desa, però no porta carta i no bloqueja la revisió següent.
- Un increment negatiu és una baixada de lloguer; el lloguer nou no pot quedar negatiu.

**Adjuntar la carta (clip)**
- Al costat de la *Data d'enviament* hi ha un clip per guardar-hi la còpia de la carta. Només s'activa quan la revisió ja està desada i té una data d'enviament desada.
- *Afegir* obre el diàleg del sistema (un sol fitxer). Un cop adjuntada, el menú ofereix *Visualitzar* i *Eliminar*.
- La carta es lliga a la revisió per la data d'enviament. Si la canvies i deses, la carta la segueix. Si la buides, la carta es queda com a document del contracte, sense lligam. Dues revisions del mateix contracte amb la mateixa data d'enviament comparteixen la carta.

**L'historial**
- Surt l'última revisió primer, amb una columna *Carta* que mostra la data d'enviament, l'etiqueta *Pendent* o un guionet (increments de 0 €).
- Té una alçada màxima i barra de desplaçament. Només l'última té el llapis per carregar-la al formulari.

**Contracte tancat**
- La pantalla és de consulta: no es poden crear revisions noves, però es pot modificar o eliminar l'última.


### 3. Revisions de lloguer (la llista global, la de les cartes)

Es troba al menú de l'esquerra. És **només de consulta**: no s'hi modifica res.

- L'interruptor **Només pendents** (activat per defecte) mostra les cartes pendents d'enviar. Desactivat, mostra totes les revisions, també les enviades i les de 0 €. Al costat hi ha el recompte de cartes pendents.
- Les files van ordenades pel dia d'efecte i, dins del mateix dia, pels cognoms i el nom del primer inquilí.
- A la columna del % surt el que has escrit; si no n'hi ha cap, surt el percentatge efectiu, en gris.
- La icona de la primera columna obre les revisions d'aquell contracte, que és on es modifica.

**Preparar les cartes amb el LibreOffice**
- Les dades de les cartes estan en una vista de la base de dades, `v_cartes_pendents`, que el LibreOffice llegeix directament. Conté les cartes pendents, amb les dades de la revisió, dels dos inquilins i de l'immoble.
- Cada dada hi surt en dues versions: la **crua** (per ordenar o calcular) i una de **text**, que acaba en `_text`, ja amb el format de la carta (dates com `05/03/2025` i imports com `1.095,48`, sense el símbol de l'euro). Per a la carta, el més còmode és fer servir les versions `_text`.
- Hi ha també un camp amb els noms dels inquilins ja units (per exemple, «Anna Puig i Joan Mas»).
- La vista és només de lectura. Marcar una carta com a enviada es fa sempre a l'aplicació, i en fer-ho desapareix de la vista.
- La connexió del LibreOffice és directa i demana un controlador ODBC o JDBC per a SQLite, que s'ha de configurar al LibreOffice.


### 4. Documents del contracte

- Les cartes adjuntades surten a la llista de documents del contracte, amb el comentari «Carta de la revisió del…» i la data d'enviament a la columna de la data.
- Només s'hi poden visualitzar i eliminar. S'afegeixen des del clip de la revisió, no des d'aquí.


### 5. Llistes i avisos

- L'etiqueta **Carta pendent** surt a la llista de contractes d'un immoble i a *Últims contractes*. També hi ha una línia a la barra taronja de l'edició del contracte, i compta per a l'etiqueta *Contractes amb avisos* de la llista d'Immobles.
- Surt també als contractes tancats. Desapareix quan la revisió té data d'enviament o quan s'elimina.


### El circuit, en cinc passos

1. L'avís de revisió t'indica que toca revisar el lloguer d'un contracte.
2. Obres el contracte, prems **Revisions de lloguer**, escrius el % (o l'increment) i deses. La carta queda pendent.
3. Consultes les cartes pendents a la llista global i prepares la carta amb el LibreOffice.
4. Envies la carta.
5. Tornes a la revisió, hi poses la data d'enviament i deses. Si vols, hi adjuntes la còpia amb el clip.