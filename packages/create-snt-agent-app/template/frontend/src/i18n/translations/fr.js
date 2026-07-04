export default {
  // Home / tabs
  'home.tab.overview': 'Vue d\'ensemble',
  'home.tab.explore': 'Explorer',
  'home.tab.showcase': 'Widgets',

  // Overview
  'overview.title': 'Vue d\'ensemble',
  'overview.empty': 'Aucun instantané collecté pour l\'instant. L\'instantané quotidien remplira ce graphique.',
  'overview.chart.title': 'Totaux journaliers par organisation',
  'overview.series.orgs': 'Organisations',
  'overview.series.trackers': 'Traceurs',
  'overview.series.users': 'Utilisateurs',
  'overview.table.title': 'Historique des instantanés quotidiens',
  'overview.table.date': 'Date',

  // Common

  // Table widget

  // CheckboxList widget

  // Sidepanel

  // DateRangePicker presets

  // OrganisationList page
  'orgList.title': 'Organisations',
  'orgList.apiKeyPlaceholder': 'Clé API...',
  'orgList.searchPlaceholder': 'Rechercher par nom...',
  'orgList.enterApiKey': 'Veuillez entrer une clé API',
  'orgList.fetchFailed': 'Échec du chargement des organisations',
  'orgList.loadingOrgs': 'Chargement des organisations...',
  'orgList.showing': (shown, total) => `${shown} sur ${total} organisations`,
  'orgList.noOrgsFound': 'Aucune organisation trouvée',
  'orgList.noOrgsMatch': 'Aucune organisation ne correspond aux filtres actuels.',
  'orgList.activeSubscriptions': 'Abonnements actifs',
  'orgList.onlyActive': 'Uniquement avec abonnements actifs',
  'orgList.minSubscriptions': (n) => `Min. abonnements : ${n}`,
  'orgList.organisationType': 'Type d\'organisation',
  'orgList.favourites': 'Favoris',
  'orgList.onlyFavourites': 'Uniquement les favoris',
  'orgList.addFavourite': 'Ajouter aux favoris',
  'orgList.removeFavourite': 'Retirer des favoris',
  'orgList.summary.favourites': 'Favoris',
  'orgList.summary.organisations': 'Organisations',
  'orgList.summary.totalTrackers': 'Total trackers',
  'orgList.summary.activeSubscriptions': 'Abonnements actifs',
  'orgList.summary.totalUsers': 'Total utilisateurs',
  'orgList.summary.avgOnlineRatio': 'Ratio en ligne moy.',
  'orgList.col.name': 'Nom',
  'orgList.col.id': 'ID',
  'orgList.col.type': 'Type',
  'orgList.col.trackers': 'Trackers',
  'orgList.col.activeSubs': 'Abon. actifs',
  'orgList.col.users': 'Utilisateurs',
  'orgList.col.online': 'En ligne',
  'orgList.stat.id': 'ID',
  'orgList.stat.trackers': 'Trackers',
  'orgList.stat.activeSubscriptions': 'Abonnements actifs',
  'orgList.stat.users': 'Utilisateurs',
  'orgList.stat.online': 'En ligne',

  // OrganisationDetail page
  'orgDetail.notFound': 'Organisation non trouvée',
  'orgDetail.notAvailable': 'Données de l\'organisation non disponibles',
  'orgDetail.goBackPrompt': 'Veuillez retourner à la liste et sélectionner une organisation.',
  'orgDetail.basicInfo': 'Informations générales',
  'orgDetail.metrics': 'Métriques',
  'orgDetail.statistics': 'Statistiques',
  'orgDetail.otherDetails': 'Autres détails',
  'orgDetail.locked': 'Verrouillé',
  'orgDetail.active': 'Actif',
}
