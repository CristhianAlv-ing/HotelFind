import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface HotelState {
  selectedHotel: string | null;
}

const initialState: HotelState = {
  selectedHotel: null,
};

const hotelSlice = createSlice({
  name: 'hotel',
  initialState,
  reducers: {
    selectHotel(state, action: PayloadAction<string>) {
      state.selectedHotel = action.payload;
    },
  },
});

export const { selectHotel } = hotelSlice.actions;
export default hotelSlice.reducer;
