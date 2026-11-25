## Revisiones del alquiler y cartas: resumen por pantallas

Tres ideas explican todo lo que viene a continuación:

- Una **revisión** es cada vez que subes (o bajas) el alquiler de un contrato. Queda guardada en el historial del contrato.
- El **alquiler actual** del contrato solo cambia mediante las revisiones: no se puede escribir manualmente en el formulario.
- Una **carta está pendiente** cuando la revisión no tiene fecha de envío y el incremento es distinto de 0 €. Cuando se informa la fecha de envío, la carta se considera enviada.

### 1. Formulario del contrato

- A la derecha de *Alquiler actual* y *Última revisión* está el botón **Revisiones del alquiler**. Solo aparece en un contrato ya guardado y lleva a la pantalla de revisiones de ese contrato. Si hay cambios sin guardar, la aplicación pregunta antes de salir.
- *Alquiler actual* y *Última revisión* son de solo lectura: cambian cuando se realiza una revisión.
- Si el contrato tiene una carta pendiente, la barra naranja superior lo indica mediante una línea.

### 2. Revisiones de un contrato (editable)

Esta pantalla muestra arriba el alquiler actual, debajo el formulario de la revisión y, más abajo, el historial.

**El formulario**

- Escribes el **% aplicado** y la aplicación calcula el **incremento calculado** (desactivado).
- El **incremento aplicado** aparece inicialmente con el mismo valor que el calculado, pero puedes cambiarlo manualmente (por ejemplo, 22 € en lugar de 21,48 €). Se conserva el porcentaje que has escrito. Si vuelves a cambiar el porcentaje, el incremento se recalcula.
- El **nuevo alquiler** es el alquiler anterior más el incremento aplicado (desactivado).
- El **día de efecto** no puede ser anterior a la última revisión. La **fecha de envío** y el **comentario** son opcionales.

**Los botones**

- **Guardar**, **Nueva revisión**, **Eliminar** y **Volver**. *Nueva revisión* y *Eliminar* solo aparecen cuando editas una revisión ya guardada.
- `Ctrl+S` guarda y `Escape` vuelve. `Intro` no guarda.

**Qué revisión se abre**

- Si la última carta está pendiente, se abre esa revisión para que puedas completarla o corregirla.
- Si la última ya se ha enviado (o no hay ninguna), se abre una revisión nueva.

**Reglas que conviene recordar**

- No se puede crear una revisión nueva mientras la última carta esté pendiente, ni en un contrato cerrado.
- Solo se puede modificar o eliminar la última revisión. Las anteriores forman parte del historial.
- Al eliminar una revisión, se restauran el alquiler y la fecha de última revisión que tenía el contrato anteriormente.
- Guardar no modifica la fecha de envío: tú decides si la introduces o la borras.
- Un incremento de 0 € (alquiler congelado) se guarda, pero no genera carta ni bloquea la siguiente revisión.
- Un incremento negativo supone una bajada del alquiler; el nuevo alquiler no puede ser negativo.

**Adjuntar la carta (clip)**

- Junto a la *Fecha de envío* hay un clip para guardar una copia de la carta. Solo se activa cuando la revisión ya está guardada y tiene una fecha de envío guardada.
- *Añadir* abre el diálogo del sistema (un solo archivo). Una vez adjuntada, el menú ofrece *Visualizar* y *Eliminar*.
- La carta queda vinculada a la revisión por la fecha de envío. Si cambias la fecha y guardas, la carta la sigue automáticamente. Si la dejas vacía, la carta permanece como documento del contrato, pero sin vinculación. Dos revisiones del mismo contrato con la misma fecha de envío comparten la carta.

**El historial**

- Muestra primero la última revisión, con una columna *Carta* que indica la fecha de envío, la etiqueta *Pendiente* o un guion (incrementos de 0 €).
- Tiene una altura máxima y una barra de desplazamiento. Solo la última revisión tiene el icono del lápiz para cargarla en el formulario.

**Contrato cerrado**

- La pantalla es de consulta: no se pueden crear revisiones nuevas, pero sí modificar o eliminar la última.

### 3. Revisiones del alquiler (lista global de cartas)

Se encuentra en el menú de la izquierda. Es **solo de consulta**: no se modifica nada desde aquí.

- El interruptor **Solo pendientes** (activado por defecto) muestra las cartas pendientes de envío. Desactivado, muestra todas las revisiones, incluidas las enviadas y las de 0 €. Al lado aparece el recuento de cartas pendientes.
- Las filas se ordenan por el día de efecto y, dentro del mismo día, por los apellidos y el nombre del primer inquilino.
- En la columna del porcentaje aparece el valor que has introducido; si no hay ninguno, aparece el porcentaje efectivo en gris.
- El icono de la primera columna abre las revisiones de ese contrato, que es donde se pueden modificar.

**Preparar las cartas con LibreOffice**

- Los datos de las cartas están disponibles en una vista de la base de datos, `v_cartes_pendents`, que LibreOffice puede leer directamente. Contiene las cartas pendientes y los datos de la revisión, de los dos inquilinos y del inmueble.
- Cada dato aparece en dos versiones: la **original** (para ordenar o calcular) y otra de **texto**, cuyo nombre termina en `_text`, ya con el formato de la carta (fechas como `05/03/2025` e importes como `1.095,48`, sin el símbolo del euro). Para la carta, lo más cómodo es utilizar las versiones `_text`.
- También hay un campo con los nombres de los inquilinos ya unidos (por ejemplo, «Anna Puig y Joan Mas»).
- La vista es de solo lectura. Marcar una carta como enviada se hace siempre desde la aplicación; al hacerlo, desaparece de esta vista.
- La conexión de LibreOffice es directa y requiere un controlador ODBC o JDBC para SQLite, que debe configurarse en LibreOffice.

### 4. Documentos del contrato

- Las cartas adjuntadas aparecen en la lista de documentos del contrato, con el comentario «Carta de la revisión del…» y la fecha de envío en la columna de fecha.
- Desde aquí solo se pueden visualizar y eliminar. Se añaden desde el clip de la revisión, no desde esta pantalla.

### 5. Listas y avisos

- La etiqueta **Carta pendiente** aparece en la lista de contratos de un inmueble y en *Últimos contratos*. También se muestra una línea en la barra naranja de edición del contrato y cuenta para la etiqueta *Contratos con avisos* de la lista de inmuebles.
- También aparece en los contratos cerrados. Desaparece cuando la revisión tiene fecha de envío o cuando se elimina.

### El proceso, en cinco pasos

1. El aviso de revisión te indica que toca revisar el alquiler de un contrato.
2. Abres el contrato, pulsas **Revisiones del alquiler**, introduces el porcentaje (o el incremento) y guardas. La carta queda pendiente.
3. Consultas las cartas pendientes en la lista global y preparas la carta con LibreOffice.
4. Envías la carta.
5. Vuelves a la revisión, introduces la fecha de envío y guardas. Si quieres, adjuntas una copia con el clip.