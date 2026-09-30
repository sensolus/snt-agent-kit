export default {
  // Home / tabs
  'home.tab.helloworld': 'Hallo Welt',
  'home.tab.showcase': 'Widgets',
  'home.tab.devices': 'Geräte',

  // Auth dialog
  'auth.dialog.title': 'Sensolus-API-Schlüssel erforderlich',
  'auth.dialog.description':
    'Es wurde keine aktive Sitzung gefunden. Geben Sie einen Sensolus-API-Schlüssel ein, um Daten zu laden. Der Schlüssel wird für diese Browsersitzung gespeichert und von allen Tabs gemeinsam genutzt.',
  'auth.dialog.failed': 'API-Schlüssel konnte nicht gespeichert werden',
  'auth.apiKeyPlaceholder': 'API-Schlüssel...',
  'auth.changeApiKey': 'API-Schlüssel ändern',

  // Helloworld page
  'helloworld.title': (name) => (name ? `Hallo, ${name}` : 'Hallo'),
  'helloworld.intro':
    'Das teilt die Sensolus-Plattform dieser App über Sie mit. Eine kundenspezifische App beginnt hier: Die Organisation unten ist die, für die sie gebaut ist.',
  'helloworld.fetchFailed': 'Ihre Anmeldeinformationen konnten nicht geladen werden',
  'helloworld.user': 'Benutzer',
  'helloworld.email': 'E-Mail',
  'helloworld.signedInWith': 'Angemeldet mit',
  'helloworld.organisation': 'Organisation',
  'helloworld.organisationType': 'Organisationstyp',
  'helloworld.partner': 'Partner',
  'helloworld.language': 'Sprache',
  'helloworld.timezone': 'Zeitzone',
  'helloworld.notNormal':
    'Diese App ist für eine Kundenorganisation gebaut (orgType: normal in sensolus-app.yaml). Nur eine Kundenorganisation kann sie hinzufügen; Sie sehen sie aus einer anderen Art von Organisation.',

  // Device browser page
  'devices.searchPlaceholder': 'Seriennummer oder Name...',
  'devices.favourites': 'Favoriten',
  'devices.onlyFavourites': 'Nur Favoriten',
  'devices.addFavourite': 'Zu Favoriten hinzufügen',
  'devices.removeFavourite': 'Aus Favoriten entfernen',
  'devices.loading': 'Geräte werden geladen...',
  'devices.fetchFailed': 'Geräte konnten nicht geladen werden',
  'devices.showing': (shown, total) => `${shown} von ${total} Geräten`,
  'devices.noneFound': 'Keine Geräte gefunden',
  'devices.noneMatch': 'Keine Geräte entsprechen Ihren aktuellen Filtern.',
  'devices.serial': 'Seriennummer',
  'devices.product': 'Produkt',
  'devices.status': 'Status',
  'devices.lastSeen': 'Zuletzt gesehen',
  'devices.lastPosition': 'Letzte Position',
  'devices.lastAddress': 'Letzte Adresse',
  'devices.noPosition': 'Dieses Gerät hat noch keine Position gemeldet.',
  'devices.pickOne': 'Wählen Sie ein Gerät, um seine Details und seine letzte Position zu sehen.',
}
