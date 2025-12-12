export interface Offer {
  id: string;
  title: string;
  price: number;
  currency?: string;
  url: string;
  image?: string;
  provider?: string;
  description?: string;
}

const OFFERS_API_URL = process.env.OFFERS_API_URL || 'https://example.com/offers.json';

const sampleOffers: Offer[] = [
  {
    id: '1',
    title: 'Oferta: Copantl Hotel - 30% descuento',
    price: 59,
    currency: 'USD',
    url: 'https://www.booking.com/searchresults.html?ss=Copantl+Hotel',
    image: 'https://via.placeholder.com/800x450.png?text=Copantl+Hotel',
    provider: 'Booking',
    description: 'Descuento especial por tiempo limitado en Copantl Hotel & Convention Center.'
  },
  {
    id: '2',
    title: 'Oferta: Resort Playa Bonita - Promo fin de semana',
    price: 89,
    currency: 'USD',
    url: 'https://www.expedia.com/Hotel-Search',
    image: 'https://via.placeholder.com/800x450.png?text=Resort+Playa+Bonita',
    provider: 'Expedia',
    description: 'Paquete con desayuno y acceso a piscina.'
  },
  {
    id: '3',
    title: 'Oferta: Hotel Central - Reserva anticipada',
    price: 45,
    currency: 'USD',
    url: 'https://www.hotels.com/',
    image: 'https://via.placeholder.com/800x450.png?text=Hotel+Central',
    provider: 'Hotels.com',
    description: 'Reserva anticipada con cancelación gratis.'
  }
];

export async function fetchPublicOffers(): Promise<Offer[]> {
  try {
    const resp = await fetch(OFFERS_API_URL, { method: 'GET' });
    if (!resp.ok) {
      console.warn(`Offers API responded with status ${resp.status}. Using sample offers.`);
      return sampleOffers;
    }
    const data = await resp.json();
    if (!Array.isArray(data)) {
      console.warn('Offers API did not return an array. Using sample offers.');
      return sampleOffers;
    }
    // Validar y mapear a Offer
    const offers: Offer[] = data.map((o: any, idx: number) => ({
      id: String(o.id ?? o.place_id ?? idx),
      title: o.title ?? o.name ?? 'Oferta',
      price: Number(o.price ?? o.cost ?? 0),
      currency: o.currency ?? 'USD',
      url: o.url ?? o.link ?? '#',
      image: o.image ?? o.photo ?? undefined,
      provider: o.provider ?? o.source ?? undefined,
      description: o.description ?? o.desc ?? undefined,
    }));
    return offers;
  } catch (err) {
    console.warn('Error fetching offers, returning sample offers.', err);
    return sampleOffers;
  }
}

/**
 * Try to find an external offer matching a given hotel name.
 * It fetches public offers (or falls back to samples) and matches loosely by title.
 */
export async function findOfferForHotelByName(hotelName: string): Promise<Offer | undefined> {
  try {
    const offers = await fetchPublicOffers();
    const normalize = (s: string) => s
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .trim();

    const target = normalize(hotelName);
    // Prefer strong contains match
    const exact = offers.find(o => normalize(o.title).includes(target));
    if (exact) return exact;
    // Fallback: some token overlap
    const tokens = target.split(/\s+/).filter(Boolean);
    return offers.find(o => {
      const t = normalize(o.title);
      return tokens.some(tok => t.includes(tok));
    });
  } catch {
    return undefined;
  }
}