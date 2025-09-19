 const Amadeus = require('amadeus');

// Validate Amadeus environment variables
if (!process.env.AMADEUS_CLIENT_ID || !process.env.AMADEUS_CLIENT_SECRET) {
  console.error('Amadeus API credentials not found. Please set AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET environment variables.');
  throw new Error('Amadeus API credentials not configured');
}

const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_CLIENT_ID,
  clientSecret: process.env.AMADEUS_CLIENT_SECRET,
  baseUrl: 'https://test.api.amadeus.com'
});

class AmadeusService {
  async searchHotels(cityCode, checkInDate, checkOutDate, adults = 1) {
    try {
      const response = await amadeus.shopping.hotelOffers.get({
        cityCode: cityCode,
        checkInDate: checkInDate,
        checkOutDate: checkOutDate,
        adults: adults
      });
      return response.data;
    } catch (error) {
      console.error('Error searching hotels:', error);
      throw error;
    }
  }

  async getHotelDetails(hotelId, checkInDate, checkOutDate, adults = 1) {
    try {
      const response = await amadeus.shopping.hotelOffersByHotel.get({
        hotelId: hotelId,
        checkInDate: checkInDate,
        checkOutDate: checkOutDate,
        adults: adults
      });
      return response.data;
    } catch (error) {
      console.error('Error getting hotel details:', error);
      throw error;
    }
  }

  async bookHotel(offerId, guests) {
    try {
      const response = await amadeus.booking.hotelBookings.post({
        data: {
          offerId: offerId,
          guests: guests
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error booking hotel:', error);
      throw error;
    }
  }
}

module.exports = new AmadeusService();
