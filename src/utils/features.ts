// 特性配置数组 - 存储每个特性的文本、背景颜色和字体颜色
export const featureConfig = [
  { text: 'BENNY', bgColor: '#CC5555', textColor: '#FFFFFF' },
  { text: 'IMANI', bgColor: '#A93226', textColor: '#FFFFFF' },
  { text: 'HAO', bgColor: '#3499B2', textColor: '#FFFFFF' },
  { text: 'POLICE', bgColor: '#229954', textColor: '#FFFFFF' },
  { text: 'ARENA', bgColor: '#7D4693', textColor: '#FFFFFF' },
  { text: 'PEGASUS', bgColor: '#D35400', textColor: '#FFFFFF' },
  { text: 'DRIFT', bgColor: '#C0392B', textColor: '#FFFFFF' },
  { text: 'WEAPONIZED', bgColor: '#3f6d99ff', textColor: '#FFFFFF' },
  { text: 'NIGHTCLUB', bgColor: '#703688', textColor: '#FFFFFF' },
  { text: 'BUNKER', bgColor: '#6C7A7D', textColor: '#FFFFFF' },
  { text: 'WAREHOUSE', bgColor: '#A93226', textColor: '#FFFFFF' },
  { text: 'FACILITY', bgColor: '#138D75', textColor: '#FFFFFF' },
  { text: 'HANGAR', bgColor: '#6d2299ff', textColor: '#FFFFFF' },
  { text: 'SALVAGE YARDS', bgColor: '#228799ff', textColor: '#FFFFFF' },
  { text: 'FREAKSHOP', bgColor: '#999722ff', textColor: '#FFFFFF' },
  { text: 'KOSATKA', bgColor: '#99227fff', textColor: '#FFFFFF' },
  { text: 'ELECTRIC', bgColor: '#91a82cff', textColor: '#FFFFFF' },
  { text: 'ARMED', bgColor: '#99227fff', textColor: '#FFFFFF' },
  { text: 'ARMORED', bgColor: '#91a82cff', textColor: '#FFFFFF' },
];

// 创建特性映射以快速查找配置
export const featureConfigMap = Object.fromEntries(
  featureConfig.map((feature) => [feature.text, feature])
);
