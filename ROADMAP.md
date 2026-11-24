# Trip Planner roadmap

## Phase 1 (live)
Mock data. Form, 3 plan tiers, route timeline, day-by-day itinerary, share link in the URL. Static site on GitHub Pages.

## Phase 2: real data
Rule: start with free, easy and safe APIs. Keep flights and hotels on mock data until Vercel functions can hold keys.

| Step | Where it runs | APIs | Gives us |
|---|---|---|---|
| 2a | Browser, no key | Frankfurter | Currency rates |
| | | OpenFreeMap + MapLibre | Map |
| | | Wikivoyage / Wikidata | City guides and sights. Send a descriptive client name. Credit CC BY-SA |
| | | World Bank `PA.NUS.PPPC.RF` | Country price level, to scale costs |
| | | Nager.Date | Public holidays |
| 2b | Vercel function | Geoapify Places, Geocoding, Routing | Free key, 3,000 calls/day, paid use allowed with credit |
| | | Open-Meteo | Best season. Demo only: free plan bans paid use |
| 2c | Vercel function | Travelpayouts Aviasales Data API | Cached flight prices. Needs token and affiliate account |
| | | Duffel (later) | Live flight booking |
| | | Navitia | Train and bus, 5,000 calls/month |
| | | Xotelo or LiteAPI | Hotel prices |

Also in phase 2: map view, budget chart, Vercel hosting, user accounts and stored plans.

### Do not use
Amadeus Self-Service (reported shut down 2026-07-17), Kiwi Tequila, Skyscanner, Booking.com Demand, Rome2Rio, REST Countries v3.1.

### Free plans that ban paid use
Open-Meteo, OpenTripMap, Transitous, Aviationstack.

### Proxy and cache
Route Nominatim, OSRM and Overpass through Vercel functions, with caching.

### Still unconfirmed
Travelpayouts limits, Navitia pricing, Xotelo license, Nager.Date commercial terms.
