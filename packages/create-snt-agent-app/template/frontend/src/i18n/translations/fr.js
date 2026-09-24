export default {
  // Home / tabs
  'home.tab.helloworld': 'Bonjour le monde',
  'home.tab.showcase': 'Widgets',
  'home.tab.devices': 'Appareils',

  // Auth dialog
  'auth.dialog.title': 'Clé API Sensolus requise',
  'auth.dialog.description':
    'Aucune session active n’a été trouvée. Saisissez une clé API Sensolus pour charger les données. La clé est conservée pour cette session du navigateur et partagée entre tous les onglets.',
  'auth.dialog.failed': 'Échec de l’enregistrement de la clé API',
  'auth.apiKeyPlaceholder': 'Clé API...',
  'auth.changeApiKey': 'Changer la clé API',

  // Helloworld page
  'helloworld.title': (name) => (name ? `Bonjour, ${name}` : 'Bonjour'),
  'helloworld.intro':
    'Voici ce que la plateforme Sensolus communique à cette application à votre sujet. Une application spécifique à un client commence ici : l’organisation ci-dessous est celle pour laquelle elle est conçue.',
  'helloworld.fetchFailed': 'Impossible de charger vos informations de connexion',
  'helloworld.user': 'Utilisateur',
  'helloworld.email': 'E-mail',
  'helloworld.signedInWith': 'Connecté avec',
  'helloworld.organisation': 'Organisation',
  'helloworld.organisationType': 'Type d’organisation',
  'helloworld.partner': 'Partenaire',
  'helloworld.language': 'Langue',
  'helloworld.timezone': 'Fuseau horaire',
  'helloworld.notNormal':
    'Cette application est conçue pour une organisation cliente (orgType: normal dans sensolus-app.yaml). Seule une organisation cliente peut l’ajouter ; vous la consultez depuis un autre type d’organisation.',

  // Device browser page
  'devices.searchPlaceholder': 'Numéro de série ou nom...',
  'devices.favourites': 'Favoris',
  'devices.onlyFavourites': 'Favoris uniquement',
  'devices.addFavourite': 'Ajouter aux favoris',
  'devices.removeFavourite': 'Retirer des favoris',
  'devices.loading': 'Chargement des appareils...',
  'devices.fetchFailed': 'Échec du chargement des appareils',
  'devices.showing': (shown, total) => `${shown} sur ${total} appareils`,
  'devices.noneFound': 'Aucun appareil trouvé',
  'devices.noneMatch': 'Aucun appareil ne correspond à vos filtres.',
  'devices.serial': 'Numéro de série',
  'devices.product': 'Produit',
  'devices.status': 'Statut',
  'devices.lastSeen': 'Vu pour la dernière fois',
  'devices.lastPosition': 'Dernière position',
  'devices.lastAddress': 'Dernière adresse',
  'devices.noPosition': 'Cet appareil n’a pas encore transmis de position.',
  'devices.pickOne': 'Choisissez un appareil pour voir ses détails et sa dernière position.',
}
