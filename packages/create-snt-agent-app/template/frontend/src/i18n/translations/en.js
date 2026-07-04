export default {
  // Home / tabs
  'home.tab.overview': 'Overview',
  'home.tab.explore': 'Explore',
  'home.tab.showcase': 'Widgets',

  // Overview
  'overview.title': 'Overview',
  'overview.empty': 'No snapshots collected yet. The daily snapshot will populate this chart.',
  'overview.chart.title': 'Daily totals across organisations',
  'overview.series.orgs': 'Organisations',
  'overview.series.trackers': 'Trackers',
  'overview.series.users': 'Users',
  'overview.table.title': 'Daily snapshot history',
  'overview.table.date': 'Date',

  // Common

  // Table widget

  // CheckboxList widget

  // Sidepanel

  // DateRangePicker presets

  // Auth dialog
  'auth.dialog.title': 'Sensolus API key required',
  'auth.dialog.description':
    'No active session was found. Enter a Sensolus API key to load data. The key is stored for this browser session and shared across all tabs.',
  'auth.dialog.failed': 'Failed to save API key',

  // OrganisationList page
  'orgList.title': 'Organisations',
  'orgList.apiKeyPlaceholder': 'API key...',
  'orgList.changeApiKey': 'Change API key',
  'orgList.searchPlaceholder': 'Search by name...',
  'orgList.enterApiKey': 'Please enter an API key',
  'orgList.fetchFailed': 'Failed to fetch organisations',
  'orgList.loadingOrgs': 'Loading organisations...',
  'orgList.showing': (shown, total) => `Showing ${shown} of ${total} organisations`,
  'orgList.noOrgsFound': 'No organisations found',
  'orgList.noOrgsMatch': 'No organisations match your current filters.',
  'orgList.activeSubscriptions': 'Active Subscriptions',
  'orgList.onlyActive': 'Only with active subscriptions',
  'orgList.minSubscriptions': (n) => `Min. Subscriptions: ${n}`,
  'orgList.organisationType': 'Organisation Type',
  'orgList.favourites': 'Favourites',
  'orgList.onlyFavourites': 'Only favourites',
  'orgList.addFavourite': 'Add to favourites',
  'orgList.removeFavourite': 'Remove from favourites',
  'orgList.summary.favourites': 'Favourites',
  'orgList.summary.organisations': 'Organisations',
  'orgList.summary.totalTrackers': 'Total Trackers',
  'orgList.summary.activeSubscriptions': 'Active Subscriptions',
  'orgList.summary.totalUsers': 'Total Users',
  'orgList.summary.avgOnlineRatio': 'Avg Online Ratio',
  'orgList.col.name': 'Name',
  'orgList.col.id': 'ID',
  'orgList.col.type': 'Type',
  'orgList.col.trackers': 'Trackers',
  'orgList.col.activeSubs': 'Active Subs',
  'orgList.col.users': 'Users',
  'orgList.col.online': 'Online',
  'orgList.stat.id': 'ID',
  'orgList.stat.trackers': 'Trackers',
  'orgList.stat.activeSubscriptions': 'Active Subscriptions',
  'orgList.stat.users': 'Users',
  'orgList.stat.online': 'Online',

  // OrganisationDetail page
  'orgDetail.notFound': 'Organisation Not Found',
  'orgDetail.notAvailable': 'Organisation data not available',
  'orgDetail.goBackPrompt': 'Please go back to the list and select an organisation.',
  'orgDetail.basicInfo': 'Basic Information',
  'orgDetail.metrics': 'Metrics',
  'orgDetail.statistics': 'Statistics',
  'orgDetail.otherDetails': 'Other Details',
  'orgDetail.locked': 'Locked',
  'orgDetail.active': 'Active',
}
