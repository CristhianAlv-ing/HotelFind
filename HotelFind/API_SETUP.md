# HotelFind - Integración de APIs de Hoteles

## 📡 APIs Implementadas

Este proyecto integra múltiples APIs externas de hoteles para búsqueda y detalles en tiempo real:

### 1. **Hotels4 API** (RapidAPI)
- **Proveedor**: RapidAPI - Hotels.com/Hotels4
- **URL**: https://rapidapi.com/apidojo/api/hotels4/
- **Funcionalidades**:
  - Búsqueda de hoteles por ubicación
  - Detalles completos de hoteles
  - Precios en tiempo real
  - Reviews y ratings

### 2. **Booking.com API** (RapidAPI)
- **Proveedor**: RapidAPI - Booking.com
- **URL**: https://rapidapi.com/DataCrawler/api/booking-com/
- **Funcionalidades**:
  - Búsqueda de hoteles
  - Información de disponibilidad
  - Precios competitivos

### 3. **Priceline API** (RapidAPI)
- **Proveedor**: RapidAPI - Priceline
- **URL**: https://rapidapi.com/tipsters/api/priceline-com-provider/
- **Funcionalidades**:
  - Comparación de precios
  - Ofertas especiales

---

## 🔑 Configuración de API Keys

### Paso 1: Obtener RapidAPI Key

1. Visita [RapidAPI](https://rapidapi.com/)
2. Crea una cuenta gratuita
3. Suscríbete a las siguientes APIs:
   - [Hotels4 API](https://rapidapi.com/apidojo/api/hotels4/)
   - [Booking.com API](https://rapidapi.com/DataCrawler/api/booking-com/)
4. Copia tu **X-RapidAPI-Key** desde el dashboard

### Paso 2: Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
RAPIDAPI_KEY=tu_rapidapi_key_aqui
```

O actualiza directamente en `src/services/api.ts`:

```typescript
const RAPIDAPI_KEY = 'tu_rapidapi_key_aqui';
```

---

## 📚 Uso de las APIs

### Búsqueda de Hoteles

```typescript
import { searchHotels } from './services/api';

const params = {
  destination: 'Tegucigalpa',
  checkIn: '2025-12-20',
  checkOut: '2025-12-25',
  adults: 2,
  rooms: 1,
  currency: 'USD',
};

const result = await searchHotels(params);
console.log(result.hotels);
```

### Obtener Detalles de Hotel

```typescript
import { getHotelDetails } from './services/api';

const hotelDetails = await getHotelDetails('hotel-id-123');
console.log(hotelDetails);
```

### Hoteles Populares

```typescript
import { getPopularHotels } from './services/api';

const popularHotels = await getPopularHotels('Roatán');
console.log(popularHotels);
```

---

## 🛡️ Manejo de Errores

Todas las funciones de API incluyen **fallback a datos mock** si la API falla:

```typescript
try {
  const hotels = await searchHotels(params);
  // Usa datos reales de la API
} catch (error) {
  console.error('API Error:', error);
  // Automáticamente usa datos mock de respaldo
}
```

---

## 📊 Estructura de Datos

### Hotel Interface

```typescript
interface Hotel {
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
```

---

## 🎯 Pantallas que Usan las APIs

### HomeScreen (src/screens/HomeScreenNew.tsx)
- Muestra hoteles populares usando `getPopularHotels()`
- Filtra por ciudades de Honduras
- Actualización en tiempo real

### SearchScreen (src/screens/SearchScreenNew.tsx)
- Búsqueda avanzada con parámetros
- Filtros por fechas, huéspedes, habitaciones
- Resultados en tiempo real de múltiples APIs

### HotelDetailsScreen (src/screens/HotelDetailsScreen.tsx)
- Detalles completos del hotel
- Información de contacto
- Reviews y ratings

---

## 🚀 Instalación de Dependencias

```bash
npm install axios
npm install @react-native-community/datetimepicker
```

O con yarn:

```bash
yarn add axios
yarn add @react-native-community/datetimepicker
```

---

## 📝 Notas Importantes

1. **Límites de API**: RapidAPI tier gratuito tiene límites de requests/mes
2. **Caché**: Considera implementar caché local para reducir llamadas
3. **Fallback**: Los datos mock garantizan que la app funcione sin API keys
4. **Testing**: Usa datos mock para desarrollo y testing

---

## 🔗 Recursos

- [RapidAPI Documentation](https://docs.rapidapi.com/)
- [Hotels4 API Docs](https://rapidapi.com/apidojo/api/hotels4/)
- [React Native Docs](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)

---

## ✅ Checklist de Implementación

- [x] Configurar servicio de API
- [x] Implementar búsqueda de hoteles
- [x] Integrar en HomeScreen
- [x] Integrar en SearchScreen
- [x] Manejo de errores y fallbacks
- [x] Datos mock de respaldo
- [x] Tipos TypeScript completos
- [ ] Configurar tu propia RAPIDAPI_KEY
- [ ] Testing con datos reales

---

**¡Disfruta construyendo HotelFind! 🏨✨**
