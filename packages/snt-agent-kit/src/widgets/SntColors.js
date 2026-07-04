/**
 * Sensolus Color Constants — official brand palette
 * Use these when you need colors in JavaScript code
 */
export const SntColors = {
  // Blue
  blueDarkest: '#212851',
  blueDarker: '#005B81',
  blue: '#0071A1',
  blueLight: '#A0C3D8',
  blueLighter: '#C2D7E4',
  blueLightest: '#DAE5EC',

  // Black / Grey
  black: '#1D283C',
  greyDarker: '#424B59',
  grey: '#535E6F',
  greyLight: '#B8BFCA',
  greyLighter: '#D5D9E0',
  greyLightest: '#DEE4E6',

  // Backgrounds / White / Purple
  bgDarkgrey: '#E7E7E1',
  bgLightgrey: '#EAEEF1',
  bgLightblue: '#EFF3F4',
  bgZebra: '#F9FAFA',
  white: '#FFFFFF',
  purple: '#834CAE',
  purpleLight: '#680282',

  // Yellow / Greens / Pink / Brown
  yellow: '#FFCC66',
  darkGreen: '#009D9D',
  uiGreen: '#62CC86',
  green: '#39CB99',
  pink: '#F57DFF',
  brown: '#543200',

  // Red / Orange Tones
  red: '#E00000',
  persimmon: '#E86124',
  salmon: '#F68483',
  blush: '#F0D5CA',
  orange: '#FFA858',
  terracotta: '#950000',

  // UI / Menu / Map
  blueMenu: '#4E5471',
  blueMenuSelected: '#707B96',
  uiSelected: '#00A6ED',
  emerald: '#006565',
  pinkDark: '#A900D5',
  geozoneGreen: '#37A857',
}

/**
 * Badge variant → base brand colour. This is the `--snt-badge-color` anchor
 * each SntBadge variant sets; the rendered badge derives its text, soft-tint
 * background and border from it via color-mix (see .snt-badge in snt-theme.css).
 */
export const SntBadgeColors = {
  primary: SntColors.blueDarkest,
  secondary: SntColors.grey,
  success: SntColors.green,
  warning: SntColors.yellow,
  danger: SntColors.red,
  info: SntColors.uiSelected,
  light: SntColors.greyLight,
  dark: SntColors.black,
  orange: SntColors.orange,
  salmon: SntColors.salmon,
  purple: SntColors.purple,
  emerald: SntColors.emerald,
}

export const SNT_PALETTE_GROUPS = [
  {
    name: 'Blue',
    colors: [
      { name: 'Sensolus_Blue_Darkest', hex: '#212851' },
      { name: 'Sensolus_Blue_Darker', hex: '#005B81' },
      { name: 'Sensolus_Blue', hex: '#0071A1' },
      { name: 'Sensolus_Blue_light', hex: '#A0C3D8' },
      { name: 'Sensolus_Blue_lighter', hex: '#C2D7E4' },
      { name: 'Sensolus_Blue_lightest', hex: '#DAE5EC' },
    ],
  },
  {
    name: 'Black / Grey',
    colors: [
      { name: 'Sensolus_Black', hex: '#1D283C' },
      { name: 'Sensolus_Grey_Darker', hex: '#424B59' },
      { name: 'Sensolus_Grey', hex: '#535E6F' },
      { name: 'Sensolus_Grey_Light', hex: '#B8BFCA' },
      { name: 'Sensolus_Grey_Lighter', hex: '#D5D9E0' },
      { name: 'Sensolus_Grey_Lightest', hex: '#DEE4E6' },
    ],
  },
  {
    name: 'Backgrounds / White / Purple',
    colors: [
      { name: 'Sensolus_BG_Darkgrey', hex: '#E7E7E1' },
      { name: 'Sensolus_BG_Lightgrey', hex: '#EAEEF1' },
      { name: 'Sensolus_BG_Lightblue', hex: '#EFF3F4' },
      { name: 'Sensolus_BG_Zebra', hex: '#F9FAFA' },
      { name: 'Sensolus_White', hex: '#FFFFFF' },
      { name: 'Sensolus_Purple', hex: '#834CAE' },
      { name: 'Sensolus_Purple_Light', hex: '#680282' },
    ],
  },
  {
    name: 'Yellow / Greens / Pink / Brown',
    colors: [
      { name: 'Sensolus_Yellow', hex: '#FFCC66' },
      { name: 'Sensolus_Dark_Green', hex: '#009D9D' },
      { name: 'Sensolus_UI_Green', hex: '#62CC86' },
      { name: 'Sensolus_Green', hex: '#39CB99' },
      { name: 'Sensolus_Pink', hex: '#F57DFF' },
      { name: 'Sensolus_Brown', hex: '#543200' },
    ],
  },
  {
    name: 'Red / Orange Tones',
    colors: [
      { name: 'Sensolus_Red', hex: '#E00000' },
      { name: 'Sensolus_Persimmon', hex: '#E86124' },
      { name: 'Sensolus_Salmon', hex: '#F68483' },
      { name: 'Sensolus_Blush', hex: '#F0D5CA' },
      { name: 'Sensolus_Orange', hex: '#FFA858' },
      { name: 'Sensolus_Terracotta', hex: '#950000' },
    ],
  },
  {
    name: 'UI / Menu / Map',
    colors: [
      { name: 'Sensolus_Blue_Menu', hex: '#4E5471' },
      { name: 'Sensolus_Blue_Menu_Selected', hex: '#707B96' },
      { name: 'Sensolus_UI_Selected', hex: '#00A6ED' },
      { name: 'Sensolus_Emerald', hex: '#006565' },
      { name: 'Sensolus_Pink_Dark', hex: '#A900D5' },
      { name: 'Sensolus_Geozone_Green', hex: '#37A857' },
    ],
  },
  {
    name: 'Badge variants',
    colors: [
      { name: 'primary', hex: '#212851' },
      { name: 'secondary', hex: '#535E6F' },
      { name: 'success', hex: '#39CB99' },
      { name: 'warning', hex: '#FFCC66' },
      { name: 'danger', hex: '#E00000' },
      { name: 'info', hex: '#00A6ED' },
      { name: 'light', hex: '#B8BFCA' },
      { name: 'dark', hex: '#1D283C' },
      { name: 'orange', hex: '#FFA858' },
      { name: 'salmon', hex: '#F68483' },
      { name: 'purple', hex: '#834CAE' },
      { name: 'emerald', hex: '#006565' },
    ],
  },
]
