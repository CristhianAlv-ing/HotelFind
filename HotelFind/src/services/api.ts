import axios from 'axios';

// ============================================
// CONFIGURACIÓN DE APIS EXTERNAS DE HOTELES
// ============================================

// 1. RAPIDAPI - Hotels API (https://rapidapi.com/apidojo/api/hotels4/)
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || 'YOUR_RAPIDAPI_KEY_HERE';
const RAPIDAPI_HOST = 'hotels4.p.rapidapi.com';

// 2. BOOKING.COM API (via RapidAPI)
const BOOKING_API_HOST = 'booking-com.p.rapidapi.com';

// 3. PRICELINE API (via RapidAPI)
const PRICELINE_API_HOST = 'priceline-com-provider.p.rapidapi.com';

// Headers comunes para RapidAPI
const rapidApiHeaders = {
  'X-RapidAPI-Key': RAPIDAPI_KEY,
  'X-RapidAPI-Host': RAPIDAPI_HOST,
};

// ============================================
// INTERFACES DE DATOS
// ============================================

export interface Hotel {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  price?: number;
  currency?: string;
  images?: string[];
  description?: string;
  amenities?: string[];
  reviewScore?: number;
  reviewCount?: number;
}

export interface SearchParams {
  destination: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  rooms?: number;
  currency?: string;
}

export interface HotelSearchResponse {
  hotels: Hotel[];
  total: number;
  page: number;
}

// ============================================
// FUNCIONES DE API - HOTELS4 (RAPIDAPI)
// ============================================

/**
 * Buscar hoteles por ubicación
 */
export const searchHotels = async (params: SearchParams): Promise<HotelSearchResponse> => {
  try {
    // Primero buscar destino ID
    const locationResponse = await axios.get(
      `https://${RAPIDAPI_HOST}/locations/v3/search`,
      {
        headers: rapidApiHeaders,
        params: {
          q: params.destination,
          locale: 'es_ES',
          langid: '1033',
        },
      }
    );

    const destinationId = locationResponse.data?.sr?.[0]?.gaiaId || 
                          locationResponse.data?.sr?.[0]?.hotelId;

    if (!destinationId) {
      console.warn('No se encontró destino, usando datos mock');
      return getMockHotels(params);
    }

    // Buscar hoteles en el destino
    const searchResponse = await axios.get(
      `https://${RAPIDAPI_HOST}/properties/v2/list`,
      {
        headers: rapidApiHeaders,
        params: {
          destination: { regionId: destinationId },
          checkInDate: {
            day: parseInt(params.checkIn.split('-')[2]),
            month: parseInt(params.checkIn.split('-')[1]),
            year: parseInt(params.checkIn.split('-')[0]),
          },
          checkOutDate: {
            day: parseInt(params.checkOut.split('-')[2]),
            month: parseInt(params.checkOut.split('-')[1]),
            year: parseInt(params.checkOut.split('-')[0]),
          },
          rooms: [{ adults: params.adults }],
          resultsStartingIndex: 0,
          resultsSize: 20,
          sort: 'PRICE_LOW_TO_HIGH',
          currency: params.currency || 'USD',
          locale: 'es_ES',
        },
      }
    );

    const hotels = searchResponse.data?.data?.propertySearch?.properties?.map((prop: any) => ({
      id: prop.id || Math.random().toString(),
      name: prop.name || 'Hotel',
      address: prop.mapMarker?.label || '',
      city: params.destination,
      country: 'Honduras',
      latitude: prop.mapMarker?.latLong?.latitude,
      longitude: prop.mapMarker?.latLong?.longitude,
      rating: prop.reviews?.score || 0,
      price: prop.price?.lead?.amount || 0,
      currency: prop.price?.lead?.currencyInfo?.code || 'USD',
      images: prop.propertyImage?.image?.url ? [prop.propertyImage.image.url] : [],
      description: prop.propertyImage?.image?.description || '',
      reviewScore: prop.reviews?.score || 0,
      reviewCount: prop.reviews?.total || 0,
    })) || [];

    return {
      hotels,
      total: hotels.length,
      page: 1,
    };
  } catch (error) {
    console.error('Error buscando hoteles:', error);
    // Fallback a datos mock si la API falla
    return getMockHotels(params);
  }
};

/**
 * Obtener detalles de un hotel específico
 */
export const getHotelDetails = async (hotelId: string): Promise<Hotel | null> => {
  try {
    const response = await axios.get(
      `https://${RAPIDAPI_HOST}/properties/v2/detail`,
      {
        headers: rapidApiHeaders,
        params: {
          propertyId: hotelId,
          locale: 'es_ES',
          currency: 'USD',
        },
      }
    );

    const data = response.data?.data?.propertyInfo;

    return {
      id: hotelId,
      name: data?.summary?.name || 'Hotel',
      address: data?.summary?.location?.address?.addressLine || '',
      city: data?.summary?.location?.address?.city || '',
      country: data?.summary?.location?.address?.country || '',
      latitude: data?.summary?.location?.coordinates?.latitude,
      longitude: data?.summary?.location?.coordinates?.longitude,
      rating: data?.summary?.overview?.propertyRating?.rating || 0,
      price: data?.propertyGallery?.images?.[0]?.image?.url || 0,
      currency: 'USD',
      images: data?.propertyGallery?.images?.map((img: any) => img.image.url) || [],
      description: data?.summary?.overview?.description || '',
      amenities: data?.summary?.amenities?.topAmenities?.items?.map((a: any) => a.text) || [],
      reviewScore: data?.reviewInfo?.summary?.overallScoreWithDescriptionA11y?.value || 0,
      reviewCount: data?.reviewInfo?.summary?.totalCount || 0,
    };
  } catch (error) {
    console.error('Error obteniendo detalles del hotel:', error);
    return null;
  }
};

/**
 * Buscar hoteles usando Booking.com API (alternativa)
 */
export const searchHotelsBooking = async (params: SearchParams): Promise<HotelSearchResponse> => {
  try {
    const response = await axios.get(
      `https://${BOOKING_API_HOST}/v1/hotels/search`,
      {
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': BOOKING_API_HOST,
        },
        params: {
          dest_id: '-2092174', // Honduras
          dest_type: 'country',
          arrival_date: params.checkIn,
          departure_date: params.checkOut,
          adults_number: params.adults,
          room_number: params.rooms || 1,
          units: 'metric',
          locale: 'es',
        },
      }
    );

    const hotels = response.data?.result?.map((hotel: any) => ({
      id: hotel.hotel_id?.toString() || Math.random().toString(),
      name: hotel.hotel_name || 'Hotel',
      address: hotel.address || '',
      city: hotel.city || params.destination,
      country: hotel.country_trans || 'Honduras',
      latitude: hotel.latitude,
      longitude: hotel.longitude,
      rating: hotel.class || 0,
      price: hotel.min_total_price || 0,
      currency: hotel.currency_code || 'USD',
      images: hotel.main_photo_url ? [hotel.main_photo_url] : [],
      description: hotel.hotel_name_trans || '',
      reviewScore: hotel.review_score || 0,
      reviewCount: hotel.review_nr || 0,
    })) || [];

    return {
      hotels,
      total: hotels.length,
      page: 1,
    };
  } catch (error) {
    console.error('Error buscando hoteles en Booking:', error);
    return getMockHotels(params);
  }
};

/**
 * Obtener hoteles populares por ciudad
 */
export const getPopularHotels = async (city: string = 'Tegucigalpa'): Promise<Hotel[]> => {
  try {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const checkIn = today.toISOString().split('T')[0];
    const checkOut = tomorrow.toISOString().split('T')[0];

    const result = await searchHotels({
      destination: city,
      checkIn,
      checkOut,
      adults: 2,
      rooms: 1,
      currency: 'USD',
    });

    return result.hotels.slice(0, 10);
  } catch (error) {
    console.error('Error obteniendo hoteles populares:', error);
    return getMockHotelsData();
  }
};

// ============================================
// DATOS MOCK (FALLBACK)
// ============================================

const getMockHotels = (params: SearchParams): HotelSearchResponse => {
  return {
    hotels: getMockHotelsData(),
    total: 8,
    page: 1,
  };
};

const getMockHotelsData = (): Hotel[] => [
  {
    id: '1',
    name: 'Hotel Plaza Real Tegucigalpa',
    address: 'Boulevard Suyapa, Tegucigalpa',
    city: 'Tegucigalpa',
    country: 'Honduras',
    latitude: 14.0723,
    longitude: -87.1921,
    rating: 4.5,
    price: 85,
    currency: 'USD',
    images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945'],
    description: 'Hotel de lujo en el corazón de Tegucigalpa con todas las comodidades modernas.',
    amenities: ['WiFi gratis', 'Piscina', 'Restaurante', 'Gym', 'Estacionamiento'],
    reviewScore: 8.5,
    reviewCount: 245,
  },
  {
    id: '2',
    name: 'Roatán Beach Resort',
    address: 'West Bay Beach, Roatán',
    city: 'Roatán',
    country: 'Honduras',
    latitude: 16.3167,
    longitude: -86.5833,
    rating: 5,
    price: 150,
    currency: 'USD',
    images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4'],
    description: 'Resort todo incluido frente al mar Caribe con playa privada.',
    amenities: ['Todo incluido', 'Playa privada', 'Snorkel', 'WiFi', 'Spa'],
    reviewScore: 9.2,
    reviewCount: 567,
  },
  {
    id: '3',
    name: 'Copán Ruins Hotel',
    address: 'Copán Ruinas Town Center',
    city: 'Copán Ruinas',
    country: 'Honduras',
    rating: 4,
    price: 65,
    currency: 'USD',
    images: ['https://images.unsplash.com/photo-1551882547-ff40c63fe5fa'],
    description: 'Hotel colonial cerca de las ruinas mayas con jardines hermosos.',
    amenities: ['WiFi', 'Restaurante', 'Tours', 'Jardín', 'Bar'],
    reviewScore: 8.0,
    reviewCount: 189,
  },
  {
    id: '4',
    name: 'Hotel Clarion Suites',
    address: 'Col. Lomas del Guijarro, Tegucigalpa',
    city: 'Tegucigalpa',
    country: 'Honduras',
    rating: 4.5,
    price: 95,
    currency: 'USD',
    images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b'],
    description: 'Hotel ejecutivo moderno con excelentes servicios para negocios.',
    amenities: ['WiFi', 'Centro de negocios', 'Gym', 'Restaurante', 'Piscina'],
    reviewScore: 8.7,
    reviewCount: 312,
  },
  {
    id: '5',
    name: 'La Ceiba Beach Hotel',
    address: 'Zona Viva, La Ceiba',
    city: 'La Ceiba',
    country: 'Honduras',
    rating: 4,
    price: 70,
    currency: 'USD',
    images: ['https://images.unsplash.com/photo-1564501049412-61c2a3083791'],
    description: 'Hotel playero ideal para explorar la costa norte de Honduras.',
    amenities: ['WiFi', 'Playa', 'Restaurante', 'Bar', 'Estacionamiento'],
    reviewScore: 7.8,
    reviewCount: 156,
  },
  {
    id: '6',
    name: 'San Pedro Business Hotel',
    address: 'Centro, San Pedro Sula',
    city: 'San Pedro Sula',
    country: 'Honduras',
    rating: 4,
    price: 75,
    currency: 'USD',
    images: ['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb'],
    description: 'Hotel céntrico perfecto para viajes de negocios.',
    amenities: ['WiFi', 'Centro de negocios', 'Restaurante', 'Gym', 'Salas de reuniones'],
    reviewScore: 8.3,
    reviewCount: 278,
  },
  {
    id: '7',
    name: 'Utila Dive Resort',
    address: 'Utila Island',
    city: 'Utila',
    country: 'Honduras',
    rating: 4,
    price: 60,
    currency: 'USD',
    images: ['https://images.unsplash.com/photo-1571896349842-33c89424de2d'],
    description: 'Resort de buceo en la hermosa isla de Utila.',
    amenities: ['Diving center', 'WiFi', 'Restaurant', 'Bar', 'Beach access'],
    reviewScore: 9.0,
    reviewCount: 423,
  },
  {
    id: '8',
    name: 'Gracias Colonial Inn',
    address: 'Centro Histórico, Gracias',
    city: 'Gracias',
    country: 'Honduras',
    rating: 3.5,
    price: 45,
    currency: 'USD',
    images: ['https://images.unsplash.com/photo-1587985064135-0366536eab42'],
    description: 'Posada colonial con encanto histórico y atención personalizada.',
    amenities: ['WiFi', 'Desayuno incluido', 'Jardín', 'Tours', 'Estacionamiento'],
    reviewScore: 8.5,
    reviewCount: 98,
  },
];

export default {
  searchHotels,
  getHotelDetails,
  searchHotelsBooking,
  getPopularHotels,
};
