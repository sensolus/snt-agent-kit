export default {
  // Home / tabs
  'home.tab.helloworld': 'Hallo wereld',
  'home.tab.showcase': 'Widgets',
  'home.tab.devices': 'Apparaten',

  // Auth dialog
  'auth.dialog.title': 'Sensolus API-sleutel vereist',
  'auth.dialog.description':
    'Er is geen actieve sessie gevonden. Voer een Sensolus API-sleutel in om gegevens te laden. De sleutel wordt bewaard voor deze browsersessie en gedeeld tussen alle tabbladen.',
  'auth.dialog.failed': 'API-sleutel opslaan mislukt',
  'auth.apiKeyPlaceholder': 'API sleutel...',
  'auth.changeApiKey': 'API-sleutel wijzigen',

  // Helloworld page
  'helloworld.title': (name) => (name ? `Hallo, ${name}` : 'Hallo'),
  'helloworld.intro':
    'Dit is wat het Sensolus-platform deze app over u vertelt. Een klantspecifieke app begint hier: de organisatie hieronder is die waarvoor ze gebouwd is.',
  'helloworld.fetchFailed': 'Uw aanmeldgegevens konden niet worden geladen',
  'helloworld.user': 'Gebruiker',
  'helloworld.email': 'E-mail',
  'helloworld.signedInWith': 'Aangemeld met',
  'helloworld.organisation': 'Organisatie',
  'helloworld.organisationType': 'Type organisatie',
  'helloworld.partner': 'Partner',
  'helloworld.language': 'Taal',
  'helloworld.timezone': 'Tijdzone',
  'helloworld.notNormal':
    'Deze app is gebouwd voor een klantorganisatie (orgType: normal in sensolus-app.yaml). Alleen een klantorganisatie kan haar toevoegen; u bekijkt haar vanuit een ander soort organisatie.',

  // Device browser page
  'devices.searchPlaceholder': 'Serienummer of naam...',
  'devices.favourites': 'Favorieten',
  'devices.onlyFavourites': 'Alleen favorieten',
  'devices.addFavourite': 'Toevoegen aan favorieten',
  'devices.removeFavourite': 'Verwijderen uit favorieten',
  'devices.loading': 'Apparaten laden...',
  'devices.fetchFailed': 'Apparaten ophalen mislukt',
  'devices.showing': (shown, total) => `${shown} van ${total} apparaten`,
  'devices.noneFound': 'Geen apparaten gevonden',
  'devices.noneMatch': 'Geen apparaten voldoen aan uw huidige filters.',
  'devices.serial': 'Serienummer',
  'devices.product': 'Product',
  'devices.status': 'Status',
  'devices.lastSeen': 'Laatst gezien',
  'devices.lastPosition': 'Laatste positie',
  'devices.lastAddress': 'Laatste adres',
  'devices.noPosition': 'Dit apparaat heeft nog geen positie doorgegeven.',
  'devices.pickOne': 'Kies een apparaat om de details en de laatste positie te zien.',
}
