## Funcionalidades de la versión 1.0.xx

### Gestión de inmuebles
- Crea y edita inmuebles.
- Introduce los datos catastrales, los datos del certificado energético y de la cédula de habitabilidad.
  La aplicación te avisará cuando el certificado o la cédula estén a punto de caducar o ya hayan caducado.
- Adjunta documentos como la ficha catastral, el certificado energético o la cédula de habitabilidad.
  La aplicación te avisará si tienes pendiente adjuntar el certificado o la cédula.
- Adjunta todo tipo de documentos y visualízalos desde la propia aplicación.

### Gestión de inquilinos
- Crea y edita inquilinos.
- Introduce los datos necesarios para los contratos de alquiler.
- Informa del teléfono y de si disponen de WhatsApp y Bizum.

### Gestión de contratos
- Crea y edita contratos, relacionando un inmueble con uno o dos inquilinos.
- La aplicación te avisará cuando un contrato esté a punto de caducar o ya haya caducado, o cuando corresponda revisar el alquiler.
- Adjunta el documento del contrato y visualízalo desde la aplicación.

#### Gestión de las fianzas del INCASÒL
- Introduce los datos del ingreso de la fianza en el INCASÒL y adjunta el documento correspondiente (en este caso, el modelo 2).
- Indica la fecha de pago y adjunta el justificante bancario.
- Registra la notificación del ingreso que envía la Generalitat y adjunta el documento correspondiente.
- Introduce los datos para la devolución de la fianza y adjunta el documento correspondiente (en este caso, el modelo 3).

#### Gestión de otros documentos relacionados con el contrato
- Fotografías.
- Anexos.
- Documentos del inquilino necesarios para el primer contrato (DNI, vida laboral, nómina, etc.).

## Características de la aplicación

### Aplicación multiplataforma
- Disponible para Linux, Windows y macOS.
- Actualmente solo se ha probado en Linux (Ubuntu, Ubuntu Cinnamon y Linux Mint).

### Uso individual
- Aplicación diseñada para un único usuario y un solo ordenador.
- No permite el uso simultáneo desde varios ordenadores ni compartir los datos entre usuarios.
- No dispone de sincronización automática entre dispositivos.

### Almacenamiento de los datos
- Los datos se guardan localmente en el ordenador, en una base de datos SQLite.
- El archivo de base de datos, el de configuración y las carpetas que contienen los documentos adjuntos se guardan dentro de la carpeta **Lloguers**, situada en la carpeta personal del usuario.
- Esta organización facilita la realización de copias de seguridad, ya que todos los archivos necesarios se encuentran agrupados en una misma ubicación.
- No necesita conexión a Internet para su funcionamiento habitual.
- El usuario es responsable de mantener copias de seguridad actualizadas de los datos.

## Funcionalidades previstas para futuras versiones
- Generar un listado con todos los avisos de los inmuebles y de los contratos.
- Generar un archivo CSV o una hoja de cálculo con todos los datos necesarios para redactar un contrato. Estos datos se podrán combinar con una plantilla de documento para generar el contrato.
- Añadir plantillas de contratos que permitan generar directamente el contrato desde la aplicación.
- Gestionar dinámicamente las cláusulas y los apartados de los contratos.
- Generar, instalar y probar las versiones para Windows y macOS.
