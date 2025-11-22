export type Hotel = {
  id: string;
  name: string;
  location: string;
  rating: number;
  price: number;
  imageUrl: string;
};

export type User = {
  id: string;
  username: string;
  email: string;
  password: string;
};

export type Booking = {
  id: string;
  userId: string;
  hotelId: string;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
};