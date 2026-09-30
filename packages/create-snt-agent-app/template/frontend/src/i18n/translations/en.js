export default {
  // Home / tabs
  'home.tab.helloworld': 'Hello world',
  'home.tab.showcase': 'Widgets',
  'home.tab.devices': 'Device browser',

  // Auth dialog
  'auth.dialog.title': 'Sensolus API key required',
  'auth.dialog.description':
    'No active session was found. Enter a Sensolus API key to load data. The key is stored for this browser session and shared across all tabs.',
  'auth.dialog.failed': 'Failed to save API key',
  'auth.apiKeyPlaceholder': 'API key...',
  'auth.changeApiKey': 'Change API key',

  // Helloworld page
  'helloworld.title': (name) => (name ? `Hello, ${name}` : 'Hello'),
  'helloworld.intro':
    'This is what the Sensolus platform tells this app about you. A customer-specific app starts here: the organisation below is the one it is built for.',
  'helloworld.fetchFailed': 'Failed to load your login information',
  'helloworld.user': 'User',
  'helloworld.email': 'Email',
  'helloworld.signedInWith': 'Signed in with',
  'helloworld.organisation': 'Organisation',
  'helloworld.organisationType': 'Organisation type',
  'helloworld.partner': 'Partner',
  'helloworld.language': 'Language',
  'helloworld.timezone': 'Time zone',
  'helloworld.notNormal':
    'This app is built for a customer organisation (orgType: normal in sensolus-app.yaml). Only a customer organisation can add it; you are looking at it from another kind of organisation.',

  // Device browser page
  'devices.searchPlaceholder': 'Serial or name...',
  'devices.favourites': 'Favourites',
  'devices.onlyFavourites': 'Only favourites',
  'devices.addFavourite': 'Add to favourites',
  'devices.removeFavourite': 'Remove from favourites',
  'devices.loading': 'Loading devices...',
  'devices.fetchFailed': 'Failed to fetch devices',
  'devices.showing': (shown, total) => `Showing ${shown} of ${total} devices`,
  'devices.noneFound': 'No devices found',
  'devices.noneMatch': 'No devices match your current filters.',
  'devices.serial': 'Serial',
  'devices.product': 'Product',
  'devices.status': 'Status',
  'devices.lastSeen': 'Last seen',
  'devices.lastPosition': 'Last position',
  'devices.lastAddress': 'Last address',
  'devices.noPosition': 'This device has not reported a position yet.',
  'devices.pickOne': 'Pick a device to see its details and last position.',
}
