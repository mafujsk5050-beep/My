'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function KitchenPage() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel('realtime-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  async function fetchOrders() {
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*, menu_items(*))')
      .neq('status', 'Completed')
      .order('created_at', { ascending: false });

    if (data) setOrders(data);
  }

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', id);
  };

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px', backgroundColor: '#1a1a1a', minHeight: '100vh', color: '#fff' }}>
      <h1>Kitchen Display System (KDS)</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {orders.map((order) => (
          <div key={order.id} style={{ backgroundColor: '#2a2a2a', padding: '15px', borderRadius: '8px', borderTop: order.status === 'New' ? '4px solid #ff4d4f' : '4px solid #1890ff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <h2>Table {order.table_number}</h2>
              <span style={{ backgroundColor: '#444', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>{order.status}</span>
            </div>
            <ul>
              {order.order_items?.map((item: any) => (
                <li key={item.id} style={{ margin: '8px 0' }}>
                  {item.quantity}x {item.menu_items?.name}
                </li>
              ))}
            </ul>
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              {order.status === 'New' && <button onClick={() => updateStatus(order.id, 'Preparing')} style={{ flex: 1, padding: '8px', backgroundColor: '#1890ff', color: '#fff', border: 'none', borderRadius: '4px' }}>Prepare</button>}
              {order.status === 'Preparing' && <button onClick={() => updateStatus(order.id, 'Ready')} style={{ flex: 1, padding: '8px', backgroundColor: '#52c41a', color: '#fff', border: 'none', borderRadius: '4px' }}>Ready</button>}
              {order.status === 'Ready' && <button onClick={() => updateStatus(order.id, 'Completed')} style={{ flex: 1, padding: '8px', backgroundColor: '#8c8c8c', color: '#fff', border: 'none', borderRadius: '4px' }}>Complete</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
      }
            
