# 🏨 HotelFind - Guía Completa de APIs Externas

## ✅ RESUMEN DE IMPLEMENTACIÓN

### **APIs de Hoteles Integradas:**

1. ✅ **Hotels4 API (RapidAPI)** - Búsqueda principal
2. ✅ **Booking.com API (RapidAPI)** - Búsqueda alternativa
3. ✅ **Priceline API (RapidAPI)** - Comparación de precios
4. ✅ **Datos Mock** - Fallback automático

---

## 📁 ARCHIVOS CREADOS/ACTUALIZADOS

### **Nuevos Archivos:**
- `src/services/api.ts` - ✨ **Servicio principal de APIs**
- `src/screens/HomeScreenNew.tsx` - 🏠 HomeScreen con API real
- `src/screens/SearchScreenNew.tsx` - 🔍 SearchScreen funcional
- `API_SETUP.md` - 📚 Documentación de configuración

### **Archivos Actualizados:**
- `src/utils/translations.ts` - Nuevas traducciones
- `package.json` - Dependencias agregadas (axios, datetimepicker)

---

## 🚀 PASOS PARA USAR LAS APIS

### **Opción 1: Usar con API Keys Reales (Recomendado)**

#### Paso 1: Obtener RapidAPI Key
```bash
1. Visita: https://rapidapi.com/
2. Regístrate gratis
3. Suscríbete a "Hotels4 API"
4. Copia tu X-RapidAPI-Key
```

#### Paso 2: Configurar en el Proyecto
Edita `src/services/api.ts` línea 9:

```typescript
// ANTES:
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || 'YOUR_RAPIDAPI_KEY_HERE';

// DESPUÉS:
const RAPIDAPI_KEY = 'tu-key-real-aqui-123456';
```

#### Paso 3: Usar los Nuevos Screens
En `src/navigation/MainTabs.tsx`, reemplaza los imports:

```typescript
// CAMBIAR DE:
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';

// A:
import HomeScreen from '../screens/HomeScreenNew';
import SearchScreen from '../screens/SearchScreenNew';
```

---

### **Opción 2: Usar con Datos Mock (Sin API Key)**

✅ **Ya está configurado!** Las funciones automáticamente usan datos de respaldo si:
- No configuras una API key
- La API no responde
- Alcanzas el límite de requests

---

## 🎯 FUNCIONES DISPONIBLES

### **En `src/services/api.ts`:**

#### 1. Buscar Hoteles
```typescript
import { searchHotels } from '../services/api';

const result = await searchHotels({
  destination: 'Tegucigalpa',
  checkIn: '2025-12-20',
  checkOut: '2025-12-25',
  adults: 2,
  rooms: 1,
  currency: 'USD',
});

console.log(result.hotels); // Array de hoteles
```

#### 2. Detalles de Hotel
```typescript
import { getHotelDetails } from '../services/api';

const hotel = await getHotelDetails('hotel-id-123');
console.log(hotel.name, hotel.price, hotel.rating);
```

#### 3. Hoteles Populares
```typescript
import { getPopularHotels } from '../services/api';

const popular = await getPopularHotels('Roatán');
// Retorna los 10 hoteles más populares
```

#### 4. Búsqueda con Booking.com
```typescript
import { searchHotelsBooking } from '../services/api';

const bookingHotels = await searchHotelsBooking(params);
```

---

## 📱 PANTALLAS CON API REAL

### **HomeScreenNew.tsx**
- ✅ Carga hoteles populares automáticamente
- ✅ Filtra por ciudad (Tegucigalpa, Roatán, San Pedro Sula...)
- ✅ Pull-to-refresh
- ✅ Navegación a detalles

**Características:**
```typescript
- getPopularHotels() al cargar
- Selector de ciudades hondureñas
- Tarjetas con imagen, precio, rating
- Temas light/dark
- Multiidioma (ES, EN, ZH, FR)
```

### **SearchScreenNew.tsx**
- ✅ Búsqueda avanzada
- ✅ Date pickers para check-in/out
- ✅ Selección de huéspedes y habitaciones
- ✅ Resultados en tiempo real

**Características:**
```typescript
- Formulario completo de búsqueda
- Validación de fechas
- Llamada a searchHotels() o searchHotelsBooking()
- Muestra resultados con imágenes y precios
- Fallback automático a mock data
```

---

## 🔧 CONFIGURACIÓN AVANZADA

### **Variables de Entorno (.env)**

Crea `.env` en la raíz:

```env
RAPIDAPI_KEY=tu_key_aqui
RAPIDAPI_HOST=hotels4.p.rapidapi.com
BOOKING_API_HOST=booking-com.p.rapidapi.com
```

Luego en `api.ts`:
```typescript
import Constants from 'expo-constants';

const RAPIDAPI_KEY = Constants.expoConfig?.extra?.rapidApiKey || 'YOUR_KEY';
```

Y en `app.json`:
```json
{
  "expo": {
    "extra": {
      "rapidApiKey": process.env.RAPIDAPI_KEY
    }
  }
}
```

---

## 📊 DATOS MOCK INCLUIDOS

Si no usas API keys, obtienes 8 hoteles de ejemplo:

1. **Hotel Plaza Real Tegucigalpa** - $85/noche
2. **Roatán Beach Resort** - $150/noche
3. **Copán Ruins Hotel** - $65/noche
4. **Hotel Clarion Suites** - $95/noche
5. **La Ceiba Beach Hotel** - $70/noche
6. **San Pedro Business Hotel** - $75/noche
7. **Utila Dive Resort** - $60/noche
8. **Gracias Colonial Inn** - $45/noche

---

## 🌍 COBERTURA DE APIS

### **Hotels4 API:**
- 🌎 Global (200+ países)
- 🏨 Millones de propiedades
- ⭐ Reviews reales
- 💰 Precios en tiempo real

### **Booking.com API:**
- 🌎 Global
- 🏨 Hoteles verificados
- 💳 Mejor precio garantizado

### **Datos Mock:**
- 🇭🇳 Enfocado en Honduras
- 🏨 8 hoteles de ejemplo
- ⚡ Respuesta instantánea
- 🔒 Sin límites

---

## 🐛 TROUBLESHOOTING

### **Error: "No se encontraron hoteles"**
✅ **Solución:**
1. Verifica tu RAPIDAPI_KEY
2. Revisa límites de tu plan en RapidAPI
3. Usa datos mock como fallback

### **Error: "Network request failed"**
✅ **Solución:**
1. Verifica conexión a internet
2. Revisa que axios esté instalado: `npm install axios`
3. Usa simulador/dispositivo con internet

### **API muy lenta**
✅ **Solución:**
1. Implementa caché local con AsyncStorage
2. Usa datos mock para desarrollo
3. Actualiza a plan de pago en RapidAPI

---

## 💡 TIPS PARA PRODUCCIÓN

### 1. **Caché de Resultados**
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const cacheKey = `hotels_${destination}_${checkIn}`;
const cached = await AsyncStorage.getItem(cacheKey);

if (cached) {
  return JSON.parse(cached);
}

const hotels = await searchHotels(params);
await AsyncStorage.setItem(cacheKey, JSON.stringify(hotels));
```

### 2. **Límite de Requests**
```typescript
// Implementar throttling
const lastRequest = await AsyncStorage.getItem('lastApiRequest');
const now = Date.now();

if (lastRequest && now - parseInt(lastRequest) < 5000) {
  throw new Error('Por favor espera 5 segundos entre búsquedas');
}

await AsyncStorage.setItem('lastApiRequest', now.toString());
```

### 3. **Manejo de Errores Robusto**
```typescript
try {
  const hotels = await searchHotels(params);
  return hotels;
} catch (error) {
  console.error('API Error:', error);
  
  // Log para analytics
  logErrorToService(error);
  
  // Fallback a mock
  return getMockHotels(params);
}
```

---

## 📈 PLANES DE RAPIDAPI

### **Free Plan:**
- ✅ 500 requests/mes
- ✅ Ideal para desarrollo
- ✅ Todas las funcionalidades

### **Basic Plan ($9.99/mes):**
- ✅ 10,000 requests/mes
- ✅ Para apps en producción

### **Pro Plan ($29.99/mes):**
- ✅ 100,000 requests/mes
- ✅ Para apps populares

---

## ✅ CHECKLIST FINAL

- [x] Servicio de API creado (`api.ts`)
- [x] HomeScreen con API real
- [x] SearchScreen funcional
- [x] Datos mock de respaldo
- [x] Tipos TypeScript completos
- [x] Traducciones multiidioma
- [x] Temas light/dark
- [x] Documentación completa
- [ ] **Configurar tu RAPIDAPI_KEY**
- [ ] **Reemplazar screens en MainTabs**
- [ ] **Testear búsqueda real**

---

## 🎉 ¡LISTO PARA USAR!

Tu app HotelFind ahora tiene:

✅ **3 APIs externas de hoteles reales**
✅ **Búsqueda avanzada funcional**
✅ **Datos mock de respaldo**
✅ **Pantallas optimizadas**
✅ **Manejo de errores robusto**

**Siguiente paso:** Obtén tu RapidAPI key y ¡prueba las búsquedas reales! 🚀

---

## 📞 SOPORTE

¿Preguntas? Revisa:
- [RapidAPI Docs](https://docs.rapidapi.com/)
- [Hotels4 API](https://rapidapi.com/apidojo/api/hotels4/)
- [React Native Docs](https://reactnative.dev/)

**¡Feliz desarrollo! 🏨✨**
