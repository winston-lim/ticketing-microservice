const OrderIndex = ({ orders, currentUser }) => {
  const renderOrders = orders.map(order=>{
    return (
      <li key={order.id}>
        {order.ticket.title} - {order.status}
      </li>
    );
  });
  return (
    <ul>
      {renderOrders}
    </ul>
  );
}

OrderIndex.getInitialProps = async (context, client) => {
  const { data } = await client.get('/api/orders');
  return { orders: data }
}

export default OrderIndex;