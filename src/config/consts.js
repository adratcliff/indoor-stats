export const STAT_COLUMNS = [
  { name: 'Player',                abbreviation: '',    key: 'Player',   type: 'string', align: 'start', sortable: true },
  { name: 'Team',                  abbreviation: '',    key: 'Team',     type: 'string', align: 'start', groupable: true },
  { name: 'Division',              abbreviation: '',    key: 'Division', type: 'string', align: 'start', groupable: true },
  { name: 'Games',                 abbreviation: 'G',   key: 'G',        type: 'number', align: 'end' },
  { name: 'Runs',                  abbreviation: 'R',   key: 'R',        type: 'number', align: 'end' },
  { name: 'Runs Average',          abbreviation: 'RA',  key: 'RA',       type: 'number', align: 'end' },
  { name: 'Strike Rate',           abbreviation: 'SR',  key: 'SR',       type: 'number', align: 'end' },
  { name: 'Times Out',             abbreviation: 'TO',  key: 'TO',       type: 'number', align: 'end' },
  { name: 'Overs Bowled',          abbreviation: 'OB',  key: 'OB',       type: 'number', align: 'end' },
  { name: 'Wickets',               abbreviation: 'W',   key: 'W',        type: 'number', align: 'end' },
  { name: 'Wickets Average',       abbreviation: 'WA',  key: 'WA',       type: 'number', align: 'end' },
  { name: 'Runs Conceded',         abbreviation: 'RC',  key: 'RC',       type: 'number', align: 'end' },
  { name: 'Runs Conceded Average', abbreviation: 'RCA', key: 'RCA',      type: 'number', align: 'end' },
  { name: 'Contribution',          abbreviation: 'C',   key: 'C',        type: 'number', align: 'end' },
  { name: 'Contribution Average',  abbreviation: 'CA',  key: 'CA',       type: 'number', align: 'end' },
];

export const OPERATORS = [
  { value: '==', title: 'Equals' },
  { value: '!=', title: 'Not Equals' },
  { value: '>',  title: 'Greater Than' },
  { value: '>=', title: 'Greater or Equal Than' },
  { value: '<',  title: 'Less Than' },
  { value: '<=', title: 'Less or Equal Than' },
];
