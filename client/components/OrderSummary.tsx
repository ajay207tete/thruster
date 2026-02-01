import React from 'react';
import { View, Text, Image, FlatList } from 'react-native';
import { OrderItem } from '../services/orderService';

interface OrderSummaryProps {
  cartItems: OrderItem[];
  totalAmount: number;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ cartItems, totalAmount }) => {
  const renderCartItem = ({ item }: { item: OrderItem }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, padding: 10, backgroundColor: '#111', borderRadius: 8 }}>
      {item.image ? (
        <Image source={{ uri: item.image }} style={{ width: 50, height: 50, borderRadius: 4, marginRight: 10 }} />
      ) : (
        <View style={{ width: 50, height: 50, backgroundColor: '#333', borderRadius: 4, marginRight: 10, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 20 }}>📦</Text>
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#00ff00', fontSize: 16, fontWeight: 'bold' }}>{item.name}</Text>
        <Text style={{ color: '#fff', fontSize: 14 }}>Quantity: {item.quantity}</Text>
        <Text style={{ color: '#00ff00', fontSize: 14 }}>${item.price.toFixed(2)} each</Text>
      </View>
      <Text style={{ color: '#00ff00', fontSize: 16, fontWeight: 'bold' }}>${(item.price * item.quantity).toFixed(2)}</Text>
    </View>
  );

  return (
    <View style={{ marginTop: 20 }}>
      <Text style={{ color: '#00ff00', fontSize: 18, fontWeight: 'bold', marginBottom: 15 }}>Order Summary</Text>
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.productId}
        renderItem={renderCartItem}
        scrollEnabled={false}
      />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#00ff00' }}>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>Subtotal:</Text>
        <Text style={{ color: '#00ff00', fontSize: 18, fontWeight: 'bold' }}>${totalAmount.toFixed(2)}</Text>
      </View>
    </View>
  );
};
