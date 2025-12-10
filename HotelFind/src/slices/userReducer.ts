import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface FavoriteHotel {
  id?: string;
  place_id?: string;
  name: string;
  description?: string;
  image?: string;
  photos?: string[];
  price?: number;
  rating?: number;
  phone?: string;
  website?: string;
  lat?: number;
  lng?: number;
}

export interface FavoriteOffer {
  id: string;
  title: string;
  price: number;
  currency?: string;
  url: string;
  image?: string;
  provider?: string;
  description?: string;
}

interface UserState {
  name: string;
  email: string;
  favoriteHotels: FavoriteHotel[];
  favoriteOffers: FavoriteOffer[];
}

const initialState: UserState = {
  name: '',
  email: '',
  favoriteHotels: [],
  favoriteOffers: [],
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<{ name: string; email: string }>) {
      state.name = action.payload.name;
      state.email = action.payload.email;
    },
    addFavoriteHotel(state, action: PayloadAction<FavoriteHotel>) {
      const h = action.payload;
      const exists = state.favoriteHotels.some(f => (f.place_id && h.place_id && f.place_id === h.place_id) || (f.name === h.name && f.lat === h.lat && f.lng === h.lng));
      if (!exists) {
        state.favoriteHotels.push(h);
      }
    },
    removeFavoriteHotel(state, action: PayloadAction<{ place_id?: string; id?: string; name?: string }>) {
      const { place_id, id, name } = action.payload;
      state.favoriteHotels = state.favoriteHotels.filter(f => {
        if (place_id && f.place_id) return f.place_id !== place_id;
        if (id && f.id) return f.id !== id;
        if (name) return f.name !== name;
        return true;
      });
    },
    addFavoriteOffer(state, action: PayloadAction<FavoriteOffer>) {
      const o = action.payload;
      const exists = state.favoriteOffers.some(f => f.id === o.id || (f.url && o.url && f.url === o.url));
      if (!exists) {
        state.favoriteOffers.push(o);
      }
    },
    removeFavoriteOffer(state, action: PayloadAction<{ id?: string; url?: string }>) {
      const { id, url } = action.payload;
      state.favoriteOffers = state.favoriteOffers.filter(f => {
        if (id) return f.id !== id;
        if (url) return f.url !== url;
        return true;
      });
    },
    clearFavorites(state) {
      state.favoriteHotels = [];
      state.favoriteOffers = [];
    }
  },
});

export const {
  setUser,
  addFavoriteHotel,
  removeFavoriteHotel,
  addFavoriteOffer,
  removeFavoriteOffer,
  clearFavorites,
} = userSlice.actions;

export default userSlice.reducer;