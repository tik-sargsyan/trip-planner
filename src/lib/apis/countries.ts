// ISO codes for the catalog country ids. Nager.Date needs ISO 2, World Bank needs ISO 3.

export const ISO: Record<string, { iso2: string; iso3: string }> = {
  italy: { iso2: 'IT', iso3: 'ITA' },
  france: { iso2: 'FR', iso3: 'FRA' },
  spain: { iso2: 'ES', iso3: 'ESP' },
  georgia: { iso2: 'GE', iso3: 'GEO' },
  japan: { iso2: 'JP', iso3: 'JPN' },
  uae: { iso2: 'AE', iso3: 'ARE' },
  armenia: { iso2: 'AM', iso3: 'ARM' },
  uk: { iso2: 'GB', iso3: 'GBR' },
  usa: { iso2: 'US', iso3: 'USA' },
  russia: { iso2: 'RU', iso3: 'RUS' },
}
