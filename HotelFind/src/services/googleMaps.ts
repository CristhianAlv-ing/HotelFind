export interface HotelPlace {
  id: string;
  name: string;
  address?: string;
  lat: number;
  lng: number;
  rating?: number;
  place_id?: string;
}

export interface PlacePrediction {
  description: string;
  place_id: string;
  structured_formatting?: {
    main_text?: string;
    secondary_text?: string;
  };
}

export interface PlaceDetails {
  place_id: string;
  name: string;
  address?: string;
  phone?: string;
  website?: string;
  rating?: number;
  lat?: number;
  lng?: number;
  photoUrl?: string;
  photoUrls?: string[];
}

/**
 * IMPORTANTE:
 * Reemplaza '<TU_GOOGLE_MAPS_API_KEY>' por tu clave real.
 * En producción usa variables de entorno / secrets.
 */
const GOOGLE_MAPS_API_KEY = 'AIzaSyCe3PTO532RHp0HLqSYD9W91dTUTRNmf3E';

function buildTextSearchUrl(query: string, location?: { lat: number; lng: number }, radius = 5000) {
  const base = 'https://maps.googleapis.com/maps/api/place/textsearch/json';
  const q = encodeURIComponent(query);
  const locationParam = location ? `&location=${location.lat},${location.lng}&radius=${radius}` : '';
  return `${base}?query=${q}${locationParam}&key=${GOOGLE_MAPS_API_KEY}`;
}

export async function searchHotels(query: string, location?: { lat: number; lng: number }): Promise<HotelPlace[]> {
  if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY.includes('<TU_GOOGLE_MAPS')) {
    console.warn('Google Maps API key no configurada en GOOGLE_MAPS_API_KEY.');
    return [];
  }

  try {
    const url = buildTextSearchUrl(query || 'hotels', location);
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Google Places API responded with status ${res.status}`);
    }
    const data = await res.json();
    const results = (data.results || []) as any[];

    return results
      .map(r => ({
        id: r.place_id || `${r.geometry?.location?.lat}_${r.geometry?.location?.lng}`,
        place_id: r.place_id,
        name: r.name,
        address: r.formatted_address || r.vicinity,
        lat: r.geometry?.location?.lat,
        lng: r.geometry?.location?.lng,
        rating: r.rating,
      }))
      .filter(h => typeof h.lat === 'number' && typeof h.lng === 'number');
  } catch (err) {
    console.error('Error buscando hoteles en Google Places:', err);
    return [];
  }
}

/**
 * Autocomplete (Places Autocomplete API)
 */
export async function autocompletePlaces(input: string, location?: { lat: number; lng: number }, radius = 50000): Promise<PlacePrediction[]> {
  if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY.includes('<TU_GOOGLE_MAPS')) {
    console.warn('Google Maps API key no configurada en GOOGLE_MAPS_API_KEY.');
    return [];
  }
  if (!input || input.trim().length === 0) return [];

  try {
    const base = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';
    const q = encodeURIComponent(input);
    let locationParam = '';
    if (location) {
      locationParam = `&location=${location.lat},${location.lng}&radius=${radius}`;
    }
    // types=establishment ayuda a obtener lugares (luego filtramos por hoteles)
    const url = `${base}?input=${q}${locationParam}&types=establishment&key=${GOOGLE_MAPS_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Places Autocomplete responded with status ${res.status}`);
    }
    const data = await res.json();
    const preds = (data.predictions || []) as any[];

    return preds.map(p => ({
      description: p.description,
      place_id: p.place_id,
      structured_formatting: p.structured_formatting,
    }));
  } catch (err) {
    console.error('Error en autocompletePlaces:', err);
    return [];
  }
}

/**
 * Place Details (solo campos ligeros; NO devolvemos 'raw' completo)
 */
export async function getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
  if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY.includes('<TU_GOOGLE_MAPS')) {
    console.warn('Google Maps API key no configurada en GOOGLE_MAPS_API_KEY.');
    return null;
  }

  try {
    const fields = [
      'place_id',
      'name',
      'formatted_address',
      'formatted_phone_number',
      'geometry',
      'rating',
      'website',
      'photos'
    ].join(',');

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=${fields}&key=${GOOGLE_MAPS_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Place Details responded with status ${res.status}`);
    const data = await res.json();

    if (data.status && data.status !== 'OK') {
      console.warn('Place Details API status:', data.status, data.error_message);
    }

    const result = data.result;
    if (!result) return null;

    const photoRefs = Array.isArray(result.photos) ? result.photos.map((p: any) => p.photo_reference).filter(Boolean) : [];
    const photoUrls: string[] = photoRefs.map((ref: string) =>
      `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photoreference=${encodeURIComponent(ref)}&key=${GOOGLE_MAPS_API_KEY}`
    );

    const photoUrl = photoUrls.length > 0 ? photoUrls[0] : undefined;

    const pd: PlaceDetails = {
      place_id: result.place_id,
      name: result.name,
      address: result.formatted_address,
      phone: result.formatted_phone_number,
      website: result.website,
      rating: result.rating,
      lat: result.geometry?.location?.lat,
      lng: result.geometry?.location?.lng,
      photoUrl,
      photoUrls,
    };

    return pd;
  } catch (err) {
    console.error('Error obteniendo Place Details:', err);
    return null;
  }
}