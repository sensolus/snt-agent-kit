export default {
  // Home / tabs
  'home.tab.helloworld': 'Hola mundo',
  'home.tab.showcase': 'Widgets',
  'home.tab.devices': 'Dispositivos',

  // Auth dialog
  'auth.dialog.title': 'Se requiere una clave API de Sensolus',
  'auth.dialog.description':
    'No se encontró ninguna sesión activa. Introduzca una clave API de Sensolus para cargar datos. La clave se guarda para esta sesión del navegador y se comparte entre todas las pestañas.',
  'auth.dialog.failed': 'No se pudo guardar la clave API',
  'auth.apiKeyPlaceholder': 'Clave API...',
  'auth.changeApiKey': 'Cambiar la clave API',

  // Helloworld page
  'helloworld.title': (name) => (name ? `Hola, ${name}` : 'Hola'),
  'helloworld.intro':
    'Esto es lo que la plataforma Sensolus le dice a esta aplicación sobre usted. Una aplicación específica para un cliente empieza aquí: la organización de abajo es aquella para la que está hecha.',
  'helloworld.fetchFailed': 'No se pudo cargar su información de inicio de sesión',
  'helloworld.user': 'Usuario',
  'helloworld.email': 'Correo electrónico',
  'helloworld.signedInWith': 'Sesión iniciada con',
  'helloworld.organisation': 'Organización',
  'helloworld.organisationType': 'Tipo de organización',
  'helloworld.partner': 'Socio',
  'helloworld.language': 'Idioma',
  'helloworld.timezone': 'Zona horaria',
  'helloworld.notNormal':
    'Esta aplicación está hecha para una organización cliente (orgType: normal en sensolus-app.yaml). Solo una organización cliente puede añadirla; la está viendo desde otro tipo de organización.',

  // Device browser page
  'devices.searchPlaceholder': 'Número de serie o nombre...',
  'devices.favourites': 'Favoritos',
  'devices.onlyFavourites': 'Solo favoritos',
  'devices.addFavourite': 'Añadir a favoritos',
  'devices.removeFavourite': 'Quitar de favoritos',
  'devices.loading': 'Cargando dispositivos...',
  'devices.fetchFailed': 'No se pudieron cargar los dispositivos',
  'devices.showing': (shown, total) => `${shown} de ${total} dispositivos`,
  'devices.noneFound': 'No se encontraron dispositivos',
  'devices.noneMatch': 'Ningún dispositivo coincide con sus filtros actuales.',
  'devices.serial': 'Número de serie',
  'devices.product': 'Producto',
  'devices.status': 'Estado',
  'devices.lastSeen': 'Visto por última vez',
  'devices.lastPosition': 'Última posición',
  'devices.lastAddress': 'Última dirección',
  'devices.noPosition': 'Este dispositivo todavía no ha informado una posición.',
  'devices.pickOne': 'Elija un dispositivo para ver sus detalles y su última posición.',
}
