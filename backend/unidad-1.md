¿Cuál es la función principal del backend en una aplicación web?
*
Diseñar la interfaz gráfica y los estilos para el usuario.
Procesar solicitudes, aplicar reglas de negocio y comunicarse con la base de datos.
Almacenar imágenes y archivos estáticos exclusivamente en el navegador.
Proporcionar una conexión a internet para el dispositivo cliente.
En un proceso de inscripción a una materia, ¿cuál de las siguientes acciones pertenece a la responsabilidad del backend?
*
Renderizar el botón 'Inscribirme' y capturar el clic del usuario.
Mostrar una notificación emergente de éxito en la pantalla.
Verificar cupo, correlatividades y registrar la inscripción en la base de datos.
Validar el diseño responsive de la página de inscripciones.
¿Qué diferencia existe entre un backend y una base de datos?
*
El backend almacena datos permanentemente; la base de datos decide qué operaciones son permitidas.
El backend ejecuta la lógica de negocio y autoriza operaciones; la base de datos almacena y recupera información.
No hay diferencia; son exactamente el mismo componente de software.
La base de datos atiende directamente los clics del usuario en el navegador.
¿Qué es una API en el contexto del desarrollo backend?
*
Un lenguaje de programación utilizado únicamente para bases de datos.
Un contrato que define cómo interactúan y se comunican distintos sistemas.
Un servidor físico ubicado en un centro de datos.
Una herramienta para diseñar prototipos visuales.
¿Por qué se dice que HTTP es un protocolo 'sin estado' (stateless)?
*
Porque no permite el envío de datos en el cuerpo de la respuesta.
Porque cada solicitud es independiente y el servidor no guarda memoria de interacciones previas por sí mismo.
Porque únicamente funciona si el servidor está apagado.
Porque requiere que el cliente vuelva a instalar el navegador en cada petición.
¿Cuál es el rol de 'localhost' durante el desarrollo de una aplicación?
*
Representa la dirección IP pública del servidor de producción en la nube.
Representa a la propia computadora local donde se ejecuta la aplicación.
Es un servicio pagado para alojar bases de datos en internet.
Es un comando de Git para subir cambios al repositorio.
En la URL 'https://api.universidad.edu:443/estudiantes/42?detalle=completo', ¿qué representa ':443'?
*
El código de estado devuelto por el servidor.
El puerto por el cual el servicio escucha las conexiones.
La versión del protocolo HTTP utilizada.
El identificador único del estudiante.
¿Qué valor aporta HTTPS en comparación con HTTP tradicional?
*
Corrige automáticamente los errores de código y bugs del backend.
Añade protección mediante TLS, proporcionando confidencialidad, integridad y autenticación.
Garantiza que la base de datos nunca se quede sin espacio de almacenamiento.
Elimina la necesidad de utilizar contraseñas en las aplicaciones.
¿Qué componentes forman parte de la estructura de una solicitud (request) HTTP?
*
Método, ruta, versión del protocolo, encabezados y cuerpo opcional.
Código de estado, texto descriptivo y base de datos.
Solamente la URL y el nombre del desarrollador.
Consulta SQL, tablas e índices.
¿Qué método HTTP debe utilizarse para CREAR un nuevo recurso en el servidor?
*
GET
POST
DELETE
HEAD
¿Cuál es la diferencia de uso entre los métodos PUT y PATCH?
*
PUT elimina un recurso y PATCH lo crea.
PUT reemplaza completamente un recurso; PATCH modifica parcialmente sus campos.
PUT solo se usa en navegadores móviles y PATCH en computadoras de escritorio.
No existe diferencia; ambos métodos hacen exactamente lo mismo.
¿A qué familia de códigos de estado HTTP pertenecen los errores provocados por la solicitud del cliente?
*
1xx
2xx
4xx
5xx
Si una consulta a un recurso en la API se realiza con éxito y devuelve datos, ¿qué código de estado se debe responder?
*
200 OK
201 Created
204 No Content
500 Internal Server Error
¿Qué código de estado HTTP es el apropiado tras crear exitosamente un nuevo estudiante en el sistema?
*
200 OK
201 Created
301 Moved Permanently
404 Not Found
¿Qué indica el código de estado 401 Unauthorized?
*
El servidor sufrió una falla catastrófica e inesperada.
Falta autenticación válida para acceder al recurso.
El usuario está autenticado pero no tiene permisos para esa operación específica.
El recurso fue movido permanentemente a otra URL.
¿Cuál es la diferencia entre los códigos HTTP 401 Unauthorized y 403 Forbidden?
*
401 significa error del servidor y 403 error de la base de datos.
401 indica que falta autenticación; 403 indica que el usuario está autenticado pero no tiene permisos.
401 es para métodos GET y 403 es para métodos POST.
Son idénticos y se pueden intercambiar libremente.
¿Cuándo se debe retornar un código de estado 404 Not Found?
*
Cuando los datos enviados en el cuerpo tienen un error de sintaxis.
Cuando el recurso solicitado no existe en el servidor.
Cuando el servidor se queda sin memoria RAM.
Cuando el cliente envía un token expirado.
¿Qué significa el código de estado HTTP 500 Internal Server Error?
*
Que el cliente envió una URL mal formulada.
Que el servidor encontró una condición inesperada que le impidió concretar la solicitud.
Que la cuenta del usuario fue suspendida.
Que el recurso se creó correctamente en la base de datos.
¿Qué función cumple el encabezado HTTP 'Content-Type'?
*
Indica la IP origen desde la cual proviene la petición.
Especifica el formato del cuerpo enviado en el mensaje (ej. application/json).
Define el límite de tiempo de espera antes de cancelar la conexión.
Almacena las contraseñas de los usuarios cifradas.
En una API RESTful, ¿cuándo es adecuado usar un parámetro de ruta (Path Parameter) como '/estudiantes/42'?
*
Para realizar búsquedas con múltiples filtros complejos y opcionales.
Para identificar de forma directa un recurso específico por su id.
Para enviar tokens de autenticación extensos.
Para configurar las credenciales de la base de datos.
¿Cuál de las siguientes características corresponde al formato JSON?
*
Admite comentarios multilinea utilizando /* comment */.
Las claves de los objetos y las cadenas deben utilizar comillas dobles (").
Permite el uso de funciones y tipos de datos undefined de JavaScript.
Requiere obligatoriamente poner comas al final del último elemento de una lista.
¿Cómo se envían normalmente las fechas en un documento JSON?
*
Como objetos de tipo Date nativos de JavaScript.
Como cadenas de texto, preferentemente en formato ISO 8601.
Como números enteros representando la cantidad de horas del día.
JSON no permite enviar ningún tipo de fecha.
¿Qué ocurre durante el proceso de 'serialización' en el manejo de datos JSON?
*
Se convierte una cadena JSON recibida en un objeto ejecutable en memoria.
Se convierte un objeto del programa en una cadena de texto transmisible.
Se verifica si la base de datos está encendida.
Se eliminan los archivos duplicados del disco rígido.
¿Qué método de JavaScript se utiliza para deserializar una cadena de texto en formato JSON?
*
JSON.stringify()
JSON.parse()
JSON.toObject()
JSON.decode()
¿Qué beneficio principal aporta el uso de TypeScript en el desarrollo backend?
*
Garantiza que la base de datos responda de forma instantánea.
Incorpora un sistema de tipos para detectar errores durante el desarrollo antes de ejecutar el programa.
Reemplaza por completo la necesidad de escribir pruebas unitarias o de integración.
Valida automáticamente todos los datos que llegan por solicitudes HTTP en tiempo de ejecución.
¿Qué es Node.js y para qué se utiliza en el backend?
*
Un navegador web que compite contra Google Chrome y Firefox.
Un entorno de ejecución que permite ejecutar JavaScript fuera del navegador.
Un motor de base de datos relacional basado en SQL.
Una librería exclusiva para maquetación HTML y CSS.
En un proyecto Node.js, ¿cuál es el propósito del archivo 'package.json'?
*
Almacenar las contraseñas y claves privadas de la aplicación.
Contener la descripción del proyecto, sus configuraciones, dependencias y scripts de ejecución.
Guardar el código fuente traducido automáticamente a código máquina.
Configurar exclusivamente las reglas visuales del frontend.
¿Para qué sirve el archivo '.gitignore' en un repositorio de proyectos?
*
Para listar los comandos que Git debe ejecutar al iniciar el servidor.
Para especificar qué archivos y carpetas (como node_modules o .env) Git NO debe registrar.
Para corregir automáticamente los errores de sintaxis del código.
Para comprimir el proyecto antes de enviarlo a producción.
¿Por qué NUNCA se deben incluir archivos con datos sensibles o claves (como '.env') en un repositorio público de Git?
*
Porque ocupa demasiado espacio en el disco duro del servidor.
Porque compromete la seguridad exponiendo contraseñas, tokens y credenciales a terceros.
Porque provoca que el compilador de TypeScript falle inmediatamente.
Porque Git no permite subir archivos que comiencen con un punto.
Al construir un servidor HTTP nativo con Node.js usando 'createServer', ¿qué parámetro se invoca para finalizar y enviar la respuesta al cliente?
*
respuesta.writeHead()
respuesta.setHeader()
respuesta.end()
respuesta.listen()