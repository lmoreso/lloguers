## Manual: revisiones del alquiler y cartas

Este manual explica cómo revisar el alquiler de un contrato, cómo hacer el seguimiento de las cartas de revisión que hay que enviar a los inquilinos y cómo prepararlas con LibreOffice.

### 1. Conceptos básicos

| Concepto | Qué significa |
|---|---|
| **Revisión** | Cada vez que subes (o bajas) el alquiler de un contrato. Se guarda en el historial del contrato. |
| **Día de efecto** | El día a partir del cual se aplica el nuevo alquiler. |
| **Alquiler actual** | El alquiler vigente del contrato. **Solo lo modifican las revisiones**: no se puede escribir manualmente en el formulario del contrato. |
| **Carta pendiente** | Una revisión que **no tiene fecha de envío** y cuyo incremento es distinto de 0 €. |
| **Carta enviada** | Una revisión que tiene informada la **fecha de envío**. |
| **Alquiler congelado** | Una revisión con un incremento de 0 €. Se puede registrar, pero **no lleva carta** y no se considera pendiente. |

---

### 2. Dónde se encuentra cada cosa

| Qué quiero hacer | Dónde lo encuentro |
|---|---|
| Hacer o consultar las revisiones de **un contrato** | Formulario del contrato → botón **Revisiones de alquiler**, a la derecha de *Alquiler actual* y *Última revisión* (solo en un contrato ya guardado). |
| Ver **todas** las cartas pendientes de enviar | Menú de la izquierda → **Revisiones de alquiler**. |
| Ver el aviso de que hay una carta pendiente | Etiqueta **Carta pendiente** en la lista de contratos y en *Últimos contratos*; línea en la barra naranja de edición del contrato; y etiqueta *Contratos con avisos* en la lista de Inmuebles. |

---

### 3. Hacer una revisión del alquiler, paso a paso

1. **Sabes que toca revisarlo** por los avisos: el aviso de revisión aparece cuando se acerca el aniversario de la última revisión (por defecto, 30 días antes) y continúa después de que haya pasado.
2. Abre el contrato y pulsa **Revisiones de alquiler**.
3. En la pantalla, escribe el **% aplicado** (por ejemplo, `2`). La aplicación calcula el incremento y el nuevo alquiler.
4. Si quieres otro importe, **cambia el _Incremento aplicado_** (por ejemplo, 22 € en lugar de los 21,48 € calculados). El porcentaje que has escrito se conserva.
5. Revisa el **Día de efecto** (aparece, por defecto, el aniversario de la última revisión) y, si es necesario, escribe un **Comentario**.
6. Pulsa **Guardar** (o `Ctrl+S`). El contrato pasa al nuevo alquiler y la carta **queda pendiente**.
7. Genera la carta (véase el apartado 5.6) y envíala.
8. Vuelve a la revisión, introduce la **Fecha de envío** y guarda. La carta deja de estar pendiente.

---

### 4. La pantalla de revisiones de un contrato

#### 4.1. Qué se muestra

En la parte superior: el título, la dirección y la fecha de inicio del contrato, y una línea con el **alquiler actual** y desde cuándo está vigente. Si la última carta está pendiente, también aparece un aviso naranja.

#### 4.2. Los campos

| Campo | ¿Se puede editar? | Qué hace |
|---|---|---|
| **Alquiler anterior** | No | El alquiler del que parte la revisión. |
| **% aplicado** | Sí | El porcentaje que escribes. Puede ser negativo (una bajada). Puede quedar vacío. |
| **Incremento calculado** | No | Alquiler anterior × % (redondeado a céntimos). |
| **Incremento aplicado** | Sí | El que se aplica realmente. Al escribir el %, se iguala al calculado; después puedes cambiarlo. |
| **Nuevo alquiler** | No | Alquiler anterior + incremento aplicado. |
| **Día de efecto** | Sí | No puede ser anterior a la última revisión. |
| **Fecha de envío de la carta** | Sí | Vacía = carta pendiente. Tiene un clip para adjuntar la carta (véase 5.3). |
| **Comentario** | Sí | Texto libre. |

Dos reglas de cálculo que conviene conocer:

- Si escribes un % y **después** cambias el incremento manualmente, el % **no se recalcula**: se guarda el que has escrito.
- Si vuelves a cambiar el %, el incremento aplicado **se recalcula** y pierdes el importe que habías introducido manualmente.

#### 4.3. Los botones

| Botón | Cuándo aparece | Qué hace |
|---|---|---|
| **Guardar** | Siempre | Guarda la revisión. Si falta algún dato, muestra el error en el campo correspondiente. |
| **Nueva revisión** | Cuando editas una revisión ya guardada | Abre el formulario para una nueva revisión. **Desactivado** si la última carta está pendiente o si el contrato está cerrado. |
| **Eliminar** | Cuando editas una revisión ya guardada | Elimina la revisión (véase 4.5). |
| **Volver** | Siempre | Vuelve a la pantalla desde la que has llegado. |

#### 4.4. Qué revisión se abre al entrar

- Si **la última revisión está pendiente**, se abre **esa misma**, para poder completarla (introducir la fecha de envío) o corregirla. No puedes crear una nueva hasta que se haya enviado la carta.
- Si **la última está enviada**, o todavía no hay ninguna, se abre una **revisión nueva**.

#### 4.5. Modificar y eliminar

- **Solo se puede modificar o eliminar la última revisión** de un contrato. Las anteriores forman parte del historial y solo se pueden consultar. El lápiz de la tabla carga la última revisión en el formulario.
- Se puede modificar **aunque ya se haya enviado**. El contrato sigue el nuevo importe y el nuevo día de efecto.
- **Guardar no modifica la fecha de envío**: la introduces o la borras tú cuando te convenga.
- **Eliminar** restaura el contrato: recupera el **alquiler** y la **fecha de la última revisión** que tenía antes de esa revisión. La confirmación indica qué valores se restaurarán.

#### 4.6. El historial

Debajo del formulario están todas las revisiones, **la última primero**. La columna *Carta* muestra la fecha de envío, la etiqueta **Pendiente** o un guion (`—`, para los incrementos de 0 €). Si hay muchas, la tabla tiene una altura máxima y aparece una barra de desplazamiento, con los encabezados de las columnas fijos.

#### 4.7. Contrato cerrado

Con el contrato cerrado **no se pueden crear nuevas revisiones**. Se puede consultar el historial y modificar o eliminar la última.

#### 4.8. Atajos de teclado

| Tecla | Efecto |
|---|---|
| `Ctrl+S` | Guarda. |
| `Escape` | Vuelve (si hay cambios sin guardar, pregunta antes). |
| `Intro` | **No guarda.** |

Ninguno de los atajos funciona si hay una ventana o un desplegable abierto.

---

### 5. Las cartas

#### 5.1. Estado de una carta

| Estado | Condición | Dónde aparece |
|---|---|---|
| **Pendiente** | Sin fecha de envío e incremento ≠ 0 | Etiqueta *Pendiente*, avisos y vista para LibreOffice. |
| **Enviada** | Con fecha de envío | La fecha en la columna *Carta*. |
| **No lleva carta** | Incremento de 0 € | Un guion (`—`). |

Un alquiler congelado **no bloquea** la siguiente revisión.

#### 5.2. Marcar una carta como enviada

Abre la revisión (en la pantalla del contrato), escribe la **Fecha de envío de la carta** y pulsa **Guardar**. Para volver a dejarla como pendiente, borra la fecha (la cruz del campo) y guarda.

#### 5.3. Adjuntar una copia de la carta

Junto al título de la *Fecha de envío* hay un **clip**. Sirve para guardar la carta (el PDF o el documento) con el contrato.

- El clip **solo se activa cuando la revisión ya está guardada y tiene una fecha de envío guardada**. Mientras no sea así, al pasar el ratón por encima muestra: *«Guarda primero la revisión con la fecha de envío para poder adjuntar la carta.»*
- **Añadir** abre directamente el diálogo del sistema; eliges **un solo archivo**.
- Cuando hay una carta, el clip se vuelve azul. El menú muestra el nombre del archivo y las opciones **Visualizar** y **Eliminar**. No hay opción *Editar*: para cambiarla, se elimina y se vuelve a adjuntar otra.
- Se guarda con el comentario automático *«Carta de la revisión del dd/mm/aaaa»*.

**Cómo se sabe qué carta corresponde a cada revisión:** por la fecha. La carta se guarda con la fecha del documento igual a la fecha de envío. Por eso:

- Si **cambias la fecha de envío** y guardas, la carta **la sigue** automáticamente.
- Si **borras** la fecha de envío, la carta permanece en el contrato, en la pantalla de *Documentos*, pero **ya no queda vinculada** a la revisión.
- Si **dos revisiones del mismo contrato** tienen la misma fecha de envío, **comparten la carta**. Si ocurre, introduce fechas diferentes.
- Si **eliminas la revisión**, la carta permanece en el contrato como documento (no se borra ningún archivo).

Las cartas también aparecen en la pantalla **Documentos** del contrato, únicamente con las opciones *Visualizar* y *Eliminar*.

#### 5.4. Los avisos

El aviso **Carta pendiente** aparece en:

- la lista de contratos de un inmueble y en *Últimos contratos* (etiqueta);
- la barra naranja de edición del contrato (una línea);
- la lista de Inmuebles, dentro de la etiqueta *Contratos con avisos*.

Aparece **también en los contratos cerrados**, porque una carta sin enviar es una tarea pendiente aunque el contrato haya terminado. Desaparece cuando la revisión tiene fecha de envío o cuando la eliminas.

#### 5.5. La pantalla «Revisiones de alquiler» (global)

Menú de la izquierda → **Revisiones de alquiler**. Es **solo de consulta**: no se modifica nada desde esta pantalla.

- **Interruptor _Solo pendientes_** (activado por defecto): muestra únicamente las cartas pendientes de enviar. Desactivado, se muestran **todas** las revisiones, también las enviadas y los incrementos de 0 €.
- Al lado aparece el **recuento** de cartas pendientes.
- **Orden:** por día de efecto y, dentro del mismo día, por apellidos y nombre del primer inquilino (alfabéticamente, teniendo en cuenta los acentos).
- **Columnas:** día de efecto, inquilinos (el segundo debajo), inmueble, alquiler anterior, %, incremento, nuevo alquiler, carta y comentario. En la columna del %, se muestra lo que has escrito; si no hay ninguno, se muestra el **efectivo** (incremento ÷ alquiler anterior) en gris.
- **El icono de la primera columna** lleva a las revisiones de ese contrato, que es donde se modifica.

#### 5.6. Generar la carta con LibreOffice

La aplicación prepara los datos de las cartas en una **vista de la base de datos** que LibreOffice puede leer directamente. No es necesario exportar nada.

| Vista | Qué contiene |
|---|---|
| `v_cartes_pendents` | Las cartas **pendientes**: sin fecha de envío y sin incrementos de 0 €. Es la que se utiliza para la combinación de correspondencia. |
| `v_revisions_lloguer` | **Todas** las revisiones, enviadas o no. |

> La conexión de LibreOffice a la base de datos (`~/Lloguers/lloguers.sqlite`) es directa y requiere un controlador ODBC o JDBC para SQLite, que debe configurarse en LibreOffice. Este manual no detalla su configuración.

**Cada dato aparece en dos versiones:** la **cruda** (para ordenar o calcular) y otra de **texto** (termina en `_text`), ya con el formato de la carta: las fechas como `05/03/2025` y los importes como `1.095,48`, **sin** el símbolo del euro. Para la carta, lo más cómodo es utilizar las versiones `_text`.

| Grupo | Campos principales |
|---|---|
| **Revisión** | `data_efecte_text`, `lloguer_anterior_text`, `lloguer_nou_text`, `increment_text`, `percentatge_text` (el que has escrito), `percentatge_efectiu_text`, `data_enviament_text`, `comentari`, `contracte_data_inici_text` |
| **Inquilinos** | `inquilins_noms` («Anna Puig y Joan Mas»), `inquili_nom_complet`, `inquili_nif`, `inquili_telefon`, `inquili2_nom_complet`, `inquili2_nif`, `inquili2_telefon` (el segundo queda vacío si no existe) |
| **Inmueble** | `immoble_adreca`, `immoble_via`, `immoble_num_via`, `immoble_pis`, `immoble_porta`, `immoble_codi_postal`, `immoble_localitat`, `immoble_provincia`, `immoble_ref_catastral` |

Tres aspectos que conviene tener en cuenta:

- **El orden de la vista no es realmente alfabético** (los acentos y las mayúsculas no se ordenan correctamente): si necesitas un orden correcto, ordénalo desde LibreOffice.
- **Es de solo lectura.** Marcar una carta como enviada siempre se hace desde la aplicación (apartado 5.2).
- **Las cartas enviadas desaparecen de `v_cartes_pendents`** cuando introduces la fecha de envío. Para recuperar una carta ya enviada, utiliza `v_revisions_lloguer`.

---

### 6. Casos especiales

**Alquiler congelado.** Escribe un % de `0` (o un incremento de `0`). Se guarda como revisión, pero no aparece entre las cartas pendientes ni bloquea la siguiente.

**Bajada del alquiler.** Escribe un porcentaje negativo o un incremento negativo. Es válido mientras el nuevo alquiler no sea negativo.

**Querer un importe que no resulta del porcentaje.** Escribe el porcentaje que te sirva de referencia y cambia el *Incremento aplicado*. En la carta puedes poner el porcentaje que has escrito (`percentatge_text`) o el efectivo (`percentatge_efectiu_text`).

**Revisiones de contratos antiguos.** Los contratos revisados antes de que la aplicación tuviera historial tienen **una fila consolidada** con el comentario *«Revisión anterior al historial (consolidada)»*. Resume todo el cambio desde el importe inicial hasta el actual, sin porcentaje, y **no aparece como carta pendiente**.

Si quieres el detalle de un contrato, elimina esa fila (el contrato vuelve al alquiler y a la fecha iniciales) e introduce las revisiones una a una, **cronológicamente**. En cada una, introduce una fecha de envío, porque una carta pendiente bloquea la creación de la siguiente.

**Corregir una revisión equivocada.** Si es la última, modifícala o elimínala. Si ya hay una posterior, no se puede tocar: elimina primero las posteriores, empezando por la última y retrocediendo.

---

### 7. Si no te deja hacer algo

| Qué ocurre | Por qué | Qué hacer |
|---|---|---|
| **Nueva revisión** está desactivado | La última carta está pendiente o el contrato está cerrado. | Introduce la fecha de envío de la última carta o vuelve a abrir el contrato (borrando su fecha de fin). |
| «El día de efecto no puede ser anterior a…» | El día es anterior a la última revisión. | Introduce un día posterior. |
| «El nuevo alquiler no puede ser negativo» | El incremento negativo supera el alquiler anterior. | Reduce la bajada. |
| El clip no se activa | La revisión no está guardada o no tiene guardada la fecha de envío. | Guarda la revisión con la fecha de envío y vuelve a intentarlo. |
| No puedo modificar una revisión antigua | Solo se puede modificar la última. | Consulta «Corregir una revisión equivocada». |
| No encuentro una carta pendiente en la pantalla global | El interruptor *Solo pendientes* oculta las enviadas y los incrementos de 0 €. | Desactiva el interruptor para verlo todo. |
| El contrato no permite crear revisiones anteriores a la última | Las revisiones se encadenan cronológicamente. | Consulta «Revisiones de contratos antiguos». |

---

### 8. Resumen de reglas

- El **alquiler actual** solo cambia mediante las revisiones.
- Una **carta está pendiente** si no tiene fecha de envío y el incremento no es 0.
- **No se puede crear** una revisión si la última carta está pendiente ni en un contrato cerrado.
- Solo se puede **modificar o eliminar la última** revisión de un contrato.
- **Eliminar** una revisión restaura el alquiler y la fecha anteriores.
- **Guardar** no modifica la fecha de envío.
- La **carta** queda vinculada a la revisión por la fecha de envío.
- Un **incremento de 0 €** no lleva carta y no bloquea nada.