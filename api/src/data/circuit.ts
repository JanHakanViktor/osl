export type Circuit = {
  trackId: string;
  grandPrix: string;
  circuit: string;
  image: string;
  timesPlayed?: number;
};

const CircuitLibrary: Circuit[] = [
  {
    trackId: '0',
    grandPrix: 'Australia',
    circuit: 'Albert Park Circuit',
    image: '/circuits/australianCircuit.png',
  },
  {
    trackId: '1',
    grandPrix: 'Japan',
    circuit: 'Suzuka International Racing Course',
    image: '/circuits/japaneseCircuit.png',
  },
  {
    trackId: '2',
    grandPrix: 'China',
    circuit: 'Shanghai International Circuit',
    image: '/circuits/chineseCircuit.png',
  },
  {
    trackId: '3',
    grandPrix: 'Miami',
    circuit: 'Miami International Autodrome',
    image: '/circuits/miamiCircuit.png',
  },
  {
    trackId: '4',
    grandPrix: 'Emilia Romagna',
    circuit: 'Imola Circuit',
    image: '/circuits/italianCircuit.png',
  },
  {
    trackId: '5',
    grandPrix: 'Monaco',
    circuit: 'Circuit de Monaco',
    image: '/circuits/monacoCircuit.png',
  },
  {
    trackId: '6',
    grandPrix: 'Canada',
    circuit: 'Circuit Gilles Villeneuve',
    image: '/circuits/canadianCircuit.png',
  },
  {
    trackId: '7',
    grandPrix: 'Spain',
    circuit: 'Circuit de Barcelona-Catalunya',
    image: '/circuits/spanishCircuit.png',
  },
  {
    trackId: '8',
    grandPrix: 'Austria',
    circuit: 'Red Bull Ring',
    image: '/circuits/austrianCircuit.png',
  },
  {
    trackId: '9',
    grandPrix: 'Great Britain',
    circuit: 'Silverstone Circuit',
    image: '/circuits/britishCircuit.png',
  },
  {
    trackId: '10',
    grandPrix: 'Hungary',
    circuit: 'Hungaroring',
    image: '/circuits/hungarianCircuit.png',
  },
  {
    trackId: '11',
    grandPrix: 'Belgium',
    circuit: 'Circuit de Spa-Francorchamps',
    image: '/circuits/belgianCircuit.png',
  },
  {
    trackId: '12',
    grandPrix: 'Netherlands',
    circuit: 'Circuit Zandvoort',
    image: '/circuits/dutchCircuit.png',
  },
  {
    trackId: '13',
    grandPrix: 'Italy',
    circuit: 'Monza Circuit',
    image: '/circuits/italianCircuit.png',
  },
  {
    trackId: '14',
    grandPrix: 'Azerbaijan',
    circuit: 'Baku City Circuit',
    image: '/circuits/azerbaijanCircuit.png',
  },
  {
    trackId: '15',
    grandPrix: 'Singapore',
    circuit: 'Marina Bay Street Circuit',
    image: '/circuits/singaporeCircuit.png',
  },
  {
    trackId: '16',
    grandPrix: 'United States',
    circuit: 'Circuit of the Americas',
    image: '/circuits/usaCircuit.png',
  },
  {
    trackId: '17',
    grandPrix: 'Mexico',
    circuit: 'Autódromo Hermanos Rodríguez',
    image: '/circuits/mexicanCircuit.png',
  },
  {
    trackId: '18',
    grandPrix: 'Brazil',
    circuit: 'Interlagos Circuit',
    image: '/circuits/brazilianCircuit.png',
  },
  {
    trackId: '19',
    grandPrix: 'Las Vegas',
    circuit: 'Las Vegas Strip Circuit',
    image: '/circuits/lasVegasCircuit.png',
  },
  {
    trackId: '20',
    grandPrix: 'Qatar',
    circuit: 'Lusail International Circuit',
    image: '/circuits/qatarCircuit.png',
  },
  {
    trackId: '21',
    grandPrix: 'Abu Dhabi',
    circuit: 'Yas Marina Circuit',
    image: '/circuits/abuDhabiCircuit.png',
  },
  {
    trackId: '22',
    grandPrix: 'Bahrain',
    circuit: 'Bahrain International Circuit',
    image: '/circuits/bahrainCircuit.png',
  },
  {
    trackId: '23',
    grandPrix: 'Saudi Arabia',
    circuit: 'Jeddah Corniche Circuit',
    image: '/circuits/saudiCircuit.png',
  },
];

export default CircuitLibrary;
