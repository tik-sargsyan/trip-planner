// Mock catalog for phase 1. Prices are rough USD estimates, not live data.

export const ACTIVITIES = [
  'culture', 'food', 'beach', 'nature', 'hiking',
  'nightlife', 'shopping', 'family', 'adventure', 'wellness',
] as const
export type Activity = (typeof ACTIVITIES)[number]

export const ACTIVITY_LABEL: Record<Activity, string> = {
  culture: 'Culture', food: 'Food & wine', beach: 'Beach', nature: 'Nature',
  hiking: 'Hiking', nightlife: 'Nightlife', shopping: 'Shopping',
  family: 'Family', adventure: 'Adventure', wellness: 'Wellness',
}

export type Tier = 0 | 1 | 2 // budget, balanced, comfort
export const TIER_NAMES = ['Budget', 'Balanced', 'Comfort'] as const

export interface Site {
  name: string
  tags: Activity[]
  hours: number
  cost: number // per person, USD
}

export interface City {
  id: string
  name: string
  country: string
  lat: number
  lon: number
  airport?: string // IATA code if the city has a usable airport
  major?: boolean // big airport with many direct routes
  island?: boolean
  stay: [number, number, number] // per room per night, by tier
  food: [number, number, number] // per person per day, by tier
  bestMonths: number[] // 1..12
  blurb: string
  sites: Site[]
}

export interface Country {
  id: string
  name: string
  flag: string
  rail: boolean // good intercity rail
  hub: string // city id used as the gateway when no picked city has an airport
}

export interface Origin {
  id: string
  name: string
  country: string
  airport: string
  lat: number
  lon: number
  major: boolean
}

export const ORIGINS: Origin[] = [
  { id: 'yerevan', name: 'Yerevan', country: 'armenia', airport: 'EVN', lat: 40.15, lon: 44.4, major: false },
  { id: 'london', name: 'London', country: 'uk', airport: 'LHR', lat: 51.47, lon: -0.45, major: true },
  { id: 'dubai', name: 'Dubai', country: 'uae', airport: 'DXB', lat: 25.25, lon: 55.36, major: true },
  { id: 'newyork', name: 'New York', country: 'usa', airport: 'JFK', lat: 40.64, lon: -73.78, major: true },
  { id: 'paris', name: 'Paris', country: 'france', airport: 'CDG', lat: 49.0, lon: 2.55, major: true },
  { id: 'moscow', name: 'Moscow', country: 'russia', airport: 'SVO', lat: 55.97, lon: 37.41, major: true },
]

export const COUNTRIES: Country[] = [
  { id: 'italy', name: 'Italy', flag: '🇮🇹', rail: true, hub: 'rome' },
  { id: 'france', name: 'France', flag: '🇫🇷', rail: true, hub: 'paris-c' },
  { id: 'spain', name: 'Spain', flag: '🇪🇸', rail: true, hub: 'madrid' },
  { id: 'georgia', name: 'Georgia', flag: '🇬🇪', rail: false, hub: 'tbilisi' },
  { id: 'japan', name: 'Japan', flag: '🇯🇵', rail: true, hub: 'tokyo' },
  { id: 'uae', name: 'UAE', flag: '🇦🇪', rail: false, hub: 'dubai-c' },
]

const s = (name: string, tags: Activity[], hours: number, cost: number): Site => ({ name, tags, hours, cost })

export const CITIES: City[] = [
  // Italy
  {
    id: 'rome', name: 'Rome', country: 'italy', lat: 41.9, lon: 12.5, airport: 'FCO', major: true,
    stay: [70, 150, 330], food: [35, 60, 120], bestMonths: [4, 5, 6, 9, 10],
    blurb: 'Ancient history on every corner, plus some of Italy’s best trattorias.',
    sites: [
      s('Colosseum and Roman Forum', ['culture', 'family'], 3, 25),
      s('Vatican Museums and Sistine Chapel', ['culture'], 3.5, 30),
      s('Trastevere food walk', ['food', 'nightlife'], 3, 45),
      s('Pantheon and Piazza Navona', ['culture'], 1.5, 5),
      s('Villa Borghese park and gallery', ['nature', 'family', 'culture'], 2.5, 20),
      s('Pasta-making class', ['food', 'family'], 3, 70),
      s('Via del Corso shopping', ['shopping'], 2, 0),
    ],
  },
  {
    id: 'florence', name: 'Florence', country: 'italy', lat: 43.77, lon: 11.25, airport: 'FLR',
    stay: [65, 140, 300], food: [32, 55, 110], bestMonths: [4, 5, 6, 9, 10],
    blurb: 'Renaissance art, Tuscan wine and leather markets.',
    sites: [
      s('Uffizi Gallery', ['culture'], 3, 30),
      s('Duomo and Brunelleschi’s dome climb', ['culture', 'adventure'], 2, 35),
      s('Chianti wine tasting day trip', ['food', 'nature'], 5, 95),
      s('Piazzale Michelangelo sunset', ['nature'], 1.5, 0),
      s('San Lorenzo leather market', ['shopping'], 2, 0),
      s('Mercato Centrale tasting', ['food'], 1.5, 25),
    ],
  },
  {
    id: 'venice', name: 'Venice', country: 'italy', lat: 45.44, lon: 12.33, airport: 'VCE',
    stay: [90, 190, 420], food: [40, 70, 140], bestMonths: [4, 5, 9, 10],
    blurb: 'Canals, glass-blowing islands and quiet back streets.',
    sites: [
      s('St Mark’s Basilica and Doge’s Palace', ['culture'], 3, 35),
      s('Gondola ride', ['family', 'culture'], 1, 45),
      s('Murano and Burano islands', ['culture', 'shopping'], 4, 25),
      s('Cicchetti bar crawl', ['food', 'nightlife'], 2.5, 40),
      s('Lido beach afternoon', ['beach', 'wellness'], 3, 15),
    ],
  },
  {
    id: 'amalfi', name: 'Amalfi Coast', country: 'italy', lat: 40.63, lon: 14.6,
    stay: [95, 210, 480], food: [40, 70, 140], bestMonths: [5, 6, 7, 8, 9],
    blurb: 'Cliffside villages, lemon groves and swimming coves.',
    sites: [
      s('Path of the Gods hike', ['hiking', 'nature', 'adventure'], 4, 0),
      s('Positano beach day', ['beach', 'wellness'], 4, 30),
      s('Boat tour to Capri', ['beach', 'adventure', 'nature'], 6, 110),
      s('Ravello gardens', ['culture', 'nature'], 2, 15),
      s('Limoncello tasting', ['food'], 1.5, 20),
    ],
  },
  // France
  {
    id: 'paris-c', name: 'Paris', country: 'france', lat: 48.86, lon: 2.35, airport: 'CDG', major: true,
    stay: [85, 180, 420], food: [40, 70, 150], bestMonths: [4, 5, 6, 9, 10],
    blurb: 'Museums, cafés and the best-known skyline in Europe.',
    sites: [
      s('Louvre Museum', ['culture'], 3.5, 25),
      s('Eiffel Tower summit', ['culture', 'family'], 2.5, 40),
      s('Montmartre and Sacré-Cœur', ['culture', 'food'], 2.5, 0),
      s('Seine evening cruise', ['family', 'nightlife'], 1.5, 20),
      s('Le Marais food tour', ['food', 'shopping'], 3, 85),
      s('Disneyland Paris', ['family', 'adventure'], 8, 110),
      s('Galeries Lafayette', ['shopping'], 2, 0),
    ],
  },
  {
    id: 'nice', name: 'Nice', country: 'france', lat: 43.7, lon: 7.27, airport: 'NCE',
    stay: [80, 170, 380], food: [38, 65, 130], bestMonths: [5, 6, 7, 8, 9],
    blurb: 'Riviera beaches with Monaco and Èze a short ride away.',
    sites: [
      s('Promenade des Anglais and beach', ['beach', 'wellness'], 3, 0),
      s('Old Town and Cours Saleya market', ['food', 'culture', 'shopping'], 2.5, 10),
      s('Èze village and coastal trail', ['hiking', 'nature'], 4, 5),
      s('Monaco evening', ['nightlife', 'shopping'], 4, 30),
      s('Matisse Museum', ['culture'], 1.5, 12),
    ],
  },
  {
    id: 'lyon', name: 'Lyon', country: 'france', lat: 45.76, lon: 4.84, airport: 'LYS',
    stay: [65, 130, 270], food: [35, 60, 130], bestMonths: [4, 5, 6, 9, 10],
    blurb: 'France’s food capital, with Roman ruins and traboules.',
    sites: [
      s('Les Halles Paul Bocuse tasting', ['food'], 2, 40),
      s('Vieux Lyon traboules walk', ['culture'], 2.5, 0),
      s('Fourvière Basilica and Roman theatre', ['culture'], 2, 0),
      s('Bouchon dinner', ['food', 'nightlife'], 2.5, 55),
      s('Parc de la Tête d’Or', ['nature', 'family'], 2, 0),
    ],
  },
  {
    id: 'bordeaux', name: 'Bordeaux', country: 'france', lat: 44.84, lon: -0.58, airport: 'BOD',
    stay: [70, 140, 290], food: [35, 60, 125], bestMonths: [5, 6, 9, 10],
    blurb: 'Wine country, river quays and Atlantic surf nearby.',
    sites: [
      s('Saint-Émilion vineyard tour', ['food', 'nature'], 6, 110),
      s('La Cité du Vin', ['culture', 'food'], 2.5, 25),
      s('Miroir d’Eau and quays', ['family'], 1, 0),
      s('Dune du Pilat climb', ['adventure', 'nature', 'beach'], 5, 15),
      s('Rue Sainte-Catherine shopping', ['shopping'], 2, 0),
    ],
  },
  // Spain
  {
    id: 'madrid', name: 'Madrid', country: 'spain', lat: 40.42, lon: -3.7, airport: 'MAD', major: true,
    stay: [65, 130, 290], food: [30, 55, 110], bestMonths: [4, 5, 6, 9, 10],
    blurb: 'World-class art, late dinners and lively plazas.',
    sites: [
      s('Prado Museum', ['culture'], 3, 18),
      s('Royal Palace', ['culture', 'family'], 2, 15),
      s('Retiro Park', ['nature', 'family', 'wellness'], 2, 0),
      s('Tapas crawl in La Latina', ['food', 'nightlife'], 3, 45),
      s('Toledo day trip', ['culture'], 7, 40),
      s('Gran Vía shopping', ['shopping'], 2, 0),
    ],
  },
  {
    id: 'barcelona', name: 'Barcelona', country: 'spain', lat: 41.39, lon: 2.17, airport: 'BCN', major: true,
    stay: [75, 150, 330], food: [35, 60, 120], bestMonths: [5, 6, 7, 8, 9],
    blurb: 'Gaudí, city beaches and a strong nightlife scene.',
    sites: [
      s('Sagrada Família', ['culture'], 2, 35),
      s('Park Güell', ['culture', 'family', 'nature'], 2, 15),
      s('Barceloneta beach', ['beach', 'wellness'], 3, 0),
      s('La Boqueria and Gothic Quarter', ['food', 'culture'], 3, 20),
      s('Montjuïc cable car and castle', ['adventure', 'family'], 2.5, 20),
      s('El Born bars night out', ['nightlife'], 3, 40),
    ],
  },
  {
    id: 'seville', name: 'Seville', country: 'spain', lat: 37.39, lon: -5.98, airport: 'SVQ',
    stay: [60, 120, 260], food: [28, 50, 100], bestMonths: [3, 4, 5, 10, 11],
    blurb: 'Moorish palaces, flamenco and orange-scented squares.',
    sites: [
      s('Real Alcázar', ['culture'], 2.5, 18),
      s('Seville Cathedral and Giralda', ['culture'], 2, 15),
      s('Flamenco show', ['culture', 'nightlife'], 1.5, 35),
      s('Plaza de España', ['family', 'culture'], 1.5, 0),
      s('Triana tapas and market', ['food'], 2.5, 30),
    ],
  },
  {
    id: 'mallorca', name: 'Mallorca', country: 'spain', lat: 39.57, lon: 2.65, airport: 'PMI', island: true,
    stay: [80, 170, 380], food: [35, 60, 120], bestMonths: [5, 6, 7, 8, 9],
    blurb: 'Island coves, mountain villages and boat days.',
    sites: [
      s('Caló des Moro cove', ['beach', 'nature'], 4, 0),
      s('Serra de Tramuntana hike', ['hiking', 'nature', 'adventure'], 5, 0),
      s('Palma Cathedral and old town', ['culture', 'shopping'], 2.5, 10),
      s('Sailing trip', ['adventure', 'beach'], 5, 90),
      s('Spa afternoon', ['wellness'], 3, 80),
    ],
  },
  // Georgia
  {
    id: 'tbilisi', name: 'Tbilisi', country: 'georgia', lat: 41.72, lon: 44.79, airport: 'TBS', major: true,
    stay: [35, 75, 180], food: [18, 32, 70], bestMonths: [5, 6, 9, 10],
    blurb: 'Sulphur baths, wine bars and a mix of old and Soviet-era streets.',
    sites: [
      s('Old Town and Narikala Fortress', ['culture', 'adventure'], 3, 5),
      s('Abanotubani sulphur baths', ['wellness'], 2, 30),
      s('Georgian supra dinner', ['food', 'nightlife'], 3, 35),
      s('Mtskheta day trip', ['culture', 'nature'], 5, 25),
      s('Dry Bridge market', ['shopping'], 1.5, 0),
      s('Fabrika courtyard bars', ['nightlife'], 3, 20),
    ],
  },
  {
    id: 'kazbegi', name: 'Kazbegi', country: 'georgia', lat: 42.66, lon: 44.64,
    stay: [30, 70, 160], food: [16, 28, 55], bestMonths: [6, 7, 8, 9],
    blurb: 'High Caucasus peaks and the Gergeti Trinity Church.',
    sites: [
      s('Gergeti Trinity Church hike', ['hiking', 'culture', 'nature'], 4, 0),
      s('Juta valley trek', ['hiking', 'nature', 'adventure'], 6, 10),
      s('Gudauri paragliding', ['adventure'], 2, 90),
      s('Ananuri fortress stop', ['culture'], 1, 0),
    ],
  },
  {
    id: 'batumi', name: 'Batumi', country: 'georgia', lat: 41.64, lon: 41.63, airport: 'BUS',
    stay: [35, 80, 170], food: [17, 30, 60], bestMonths: [6, 7, 8, 9],
    blurb: 'Black Sea resort with a long boulevard and botanical garden.',
    sites: [
      s('Batumi Boulevard and beach', ['beach', 'family'], 3, 0),
      s('Botanical Garden', ['nature', 'family'], 3, 8),
      s('Adjarian khachapuri tasting', ['food'], 1.5, 12),
      s('Mtirala National Park', ['hiking', 'nature'], 5, 10),
      s('Batumi nightlife strip', ['nightlife'], 3, 25),
    ],
  },
  {
    id: 'kutaisi', name: 'Kutaisi', country: 'georgia', lat: 42.27, lon: 42.7, airport: 'KUT',
    stay: [25, 55, 120], food: [14, 25, 50], bestMonths: [5, 6, 9, 10],
    blurb: 'Gateway to canyons, caves and monasteries in western Georgia.',
    sites: [
      s('Prometheus Cave', ['nature', 'family'], 2, 20),
      s('Martvili Canyon boat ride', ['nature', 'adventure'], 3, 15),
      s('Gelati Monastery', ['culture'], 1.5, 0),
      s('Imeretian wine cellar visit', ['food'], 2, 25),
    ],
  },
  // Japan
  {
    id: 'tokyo', name: 'Tokyo', country: 'japan', lat: 35.68, lon: 139.76, airport: 'HND', major: true,
    stay: [80, 170, 400], food: [30, 60, 140], bestMonths: [3, 4, 5, 10, 11],
    blurb: 'Neon districts, quiet shrines and the world’s best food city.',
    sites: [
      s('Senso-ji and Asakusa', ['culture'], 2, 0),
      s('Tsukiji outer market breakfast', ['food'], 2, 30),
      s('Shibuya and Harajuku', ['shopping', 'nightlife'], 3, 0),
      s('teamLab Planets', ['family', 'culture'], 2, 30),
      s('Golden Gai bars', ['nightlife'], 2.5, 40),
      s('Hakone onsen day trip', ['wellness', 'nature'], 8, 70),
    ],
  },
  {
    id: 'kyoto', name: 'Kyoto', country: 'japan', lat: 35.01, lon: 135.77,
    stay: [75, 160, 380], food: [28, 55, 130], bestMonths: [3, 4, 5, 10, 11],
    blurb: 'Temples, bamboo groves and traditional tea houses.',
    sites: [
      s('Fushimi Inari shrine hike', ['hiking', 'culture'], 3, 0),
      s('Arashiyama bamboo grove', ['nature'], 2, 0),
      s('Kinkaku-ji Golden Pavilion', ['culture'], 1.5, 5),
      s('Tea ceremony', ['culture', 'wellness'], 1.5, 40),
      s('Nishiki Market', ['food', 'shopping'], 2, 25),
      s('Gion evening walk', ['culture', 'nightlife'], 2, 0),
    ],
  },
  {
    id: 'osaka', name: 'Osaka', country: 'japan', lat: 34.69, lon: 135.5, airport: 'KIX', major: true,
    stay: [65, 140, 320], food: [25, 50, 120], bestMonths: [3, 4, 5, 10, 11],
    blurb: 'Street food, Universal Studios and easy day trips to Nara.',
    sites: [
      s('Dotonbori street food', ['food', 'nightlife'], 3, 30),
      s('Universal Studios Japan', ['family', 'adventure'], 8, 80),
      s('Osaka Castle', ['culture', 'family'], 2, 6),
      s('Nara deer park day trip', ['nature', 'family', 'culture'], 5, 15),
      s('Shinsaibashi shopping', ['shopping'], 2.5, 0),
    ],
  },
  {
    id: 'hiroshima', name: 'Hiroshima', country: 'japan', lat: 34.39, lon: 132.46, airport: 'HIJ',
    stay: [55, 120, 260], food: [22, 45, 100], bestMonths: [3, 4, 5, 10, 11],
    blurb: 'Peace Memorial and the floating torii of Miyajima.',
    sites: [
      s('Peace Memorial Park and Museum', ['culture'], 3, 5),
      s('Miyajima island and Itsukushima shrine', ['culture', 'nature'], 5, 15),
      s('Mount Misen hike', ['hiking', 'nature'], 3, 10),
      s('Okonomiyaki dinner', ['food'], 1.5, 15),
    ],
  },
  // UAE
  {
    id: 'dubai-c', name: 'Dubai', country: 'uae', lat: 25.2, lon: 55.27, airport: 'DXB', major: true,
    stay: [80, 180, 450], food: [35, 70, 160], bestMonths: [11, 12, 1, 2, 3],
    blurb: 'Skyscrapers, desert safaris and huge malls.',
    sites: [
      s('Burj Khalifa At the Top', ['culture', 'family'], 2, 45),
      s('Desert safari with dinner', ['adventure', 'food'], 6, 70),
      s('Dubai Mall and Fountain show', ['shopping', 'family'], 3, 0),
      s('Old Dubai souks and abra ride', ['culture', 'shopping'], 2.5, 5),
      s('JBR beach', ['beach', 'wellness'], 3, 0),
      s('Rooftop bar evening', ['nightlife'], 2.5, 60),
    ],
  },
  {
    id: 'abudhabi', name: 'Abu Dhabi', country: 'uae', lat: 24.45, lon: 54.38, airport: 'AUH', major: true,
    stay: [75, 170, 400], food: [32, 65, 150], bestMonths: [11, 12, 1, 2, 3],
    blurb: 'Grand mosque, Louvre Abu Dhabi and theme parks.',
    sites: [
      s('Sheikh Zayed Grand Mosque', ['culture'], 2, 0),
      s('Louvre Abu Dhabi', ['culture'], 2.5, 20),
      s('Ferrari World', ['family', 'adventure'], 5, 90),
      s('Saadiyat beach', ['beach', 'wellness'], 3, 15),
      s('Mangrove kayaking', ['nature', 'adventure'], 2, 45),
    ],
  },
  {
    id: 'rak', name: 'Ras Al Khaimah', country: 'uae', lat: 25.79, lon: 55.94, airport: 'RKT',
    stay: [70, 150, 350], food: [30, 55, 120], bestMonths: [11, 12, 1, 2, 3],
    blurb: 'Mountains, the world’s longest zipline and quiet resorts.',
    sites: [
      s('Jebel Jais zipline', ['adventure'], 3, 100),
      s('Jebel Jais hiking trail', ['hiking', 'nature'], 4, 0),
      s('Resort beach and spa day', ['beach', 'wellness'], 5, 60),
      s('Dhayah Fort', ['culture'], 1.5, 0),
    ],
  },
  {
    id: 'fujairah', name: 'Fujairah', country: 'uae', lat: 25.13, lon: 56.33, airport: 'FJR',
    stay: [60, 130, 300], food: [25, 50, 110], bestMonths: [11, 12, 1, 2, 3, 4],
    blurb: 'East-coast snorkelling, mountains and the oldest mosque in the UAE.',
    sites: [
      s('Snoopy Island snorkelling', ['beach', 'adventure', 'nature'], 4, 50),
      s('Al Badiyah Mosque', ['culture'], 1, 0),
      s('Wadi Wurayah hike', ['hiking', 'nature'], 4, 0),
      s('Fujairah Fort', ['culture', 'family'], 1.5, 0),
    ],
  },
]

export const cityById = (id: string) => CITIES.find((c) => c.id === id)!
export const countryById = (id: string) => COUNTRIES.find((c) => c.id === id)!
export const originById = (id: string) => ORIGINS.find((o) => o.id === id)!
