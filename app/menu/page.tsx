'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ShoppingCart } from 'lucide-react';

function MenuContent() {
  const searchParams = useSearchParams();
  const tableNumber = searchParams.get('table') || '1';

  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderPlaced, setOrderPlaced] = useState(false);

  useEffect(() => {
    async function fetchMenu() {
      const { data } = await supabase.from('menu_items').select('*').eq('is_available', true);
      if (data) setMenuItems(data);
      setLoading(false);
    }
    fetchMenu();
  }, []);

  const addToCart = (item: any) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) return prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const placeOrder = async () => {
    if (cart.length === 0) return alert('Cart is empty!');

    const { data: order, error } = await supabase
      .from('orders')
      .insert([{ table_number: parseInt(tableNumber), total_amount: cartTotal, status: 'New' }])
      .select()
      .single();

    if (error) return alert('Order error: ' + error.message);

    const orderItems = cart.map((item) => ({
      order_id: order.id,
      menu_item_id: item.id,
      quantity: item.qty,
      price_at_time: item.price,
    }));

    await supabase.from('order_items').insert(orderItems);
    setOrderPlaced(true);
    setCart([]);
  };

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Menu Loading...</div>;

  if (orderPlaced) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h2 style={{ color: 'green', fontSize: '24px' }}>Order Placed Successfully! 🎉</h2>
        <p>Your order has been sent to the kitchen.</p>
        <button onClick={() => setOrderPlaced(false)} style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '5px' }}>Order More</button>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'sans-serif', paddingBottom: '80px', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      <div style={{ backgroundColor: '#fff', padding: '15px', borderBottom: '1px solid #ddd', position: 'sticky', top: 0 }}>
        <h1 style={{ margin: 0, fontSize: '20px' }}>SmartQR Restaurant</h1>
        <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>Table Number: <strong>{tableNumber}</strong></p>
      </div>

      <div style={{ padding: '15px' }}>
        {menuItems.map((item) => (
          <div key={item.id} style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '8px', marginBottom: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: '0 0 5px 0' }}>{item.name}</h3>
              <p style={{ margin: '0 0 5px 0', color: '#888', fontSize: '12px' }}>{item.description}</p>
              <strong style={{ color: '#2b8a3e' }}>৳{item.price}</strong>
            </div>
            <button onClick={() => addToCart(item)} style={{ backgroundColor: '#228be6', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '5px', fontWeight: 'bold' }}>+ Add</button>
          </div>
        ))}
      </div>

      {cart.length > 0 && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', padding: '15px', borderTop: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#666' }}>{cart.reduce((a, b) => a + b.qty, 0)} Items</div>
            <strong style={{ fontSize: '18px' }}>৳{cartTotal}</strong>
          </div>
          <button onClick={placeOrder} style={{ backgroundColor: '#40c057', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px' }}>Place Order</button>
        </div>
      )}
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MenuContent />
    </Suspense>
  );
  }
         
