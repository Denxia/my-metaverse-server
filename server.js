// components/MoneyDisplay.jsx
import { useState, useEffect } from 'react';

export default function MoneyDisplay() {
  const [money, setMoney] = useState(0);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Render 서버 주소로 웹소켓 연결
    const ws = new WebSocket('wss://my-metaverse-server.onrender.com');

    ws.onopen = () => {
      console.log('서버에 성공적으로 접속했습니다.');
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('서버로부터 받은 메시지:', data);

        // 서버로부터 돈 업데이트 메시지를 받으면
        if (data.action === 'update_money') {
          setMoney(data.money);
        }
      } catch (error) {
        console.error('메시지 파싱 오류:', error);
      }
    };

    ws.onclose = () => {
      console.log('서버와의 연결이 끊어졌습니다.');
      setSocket(null);
    };

    // 컴포넌트가 언마운트될 때 웹소켓 연결을 닫습니다.
    return () => {
      ws.close();
    };
  }, []); // 이 useEffect는 컴포넌트가 처음 렌더링될 때 한 번만 실행됩니다.

  const handlePurchase = (amount) => {
    if (socket) {
      const message = {
        action: 'purchase',
        amount: amount,
      };
      socket.send(JSON.stringify(message));
    } else {
      console.log('소켓이 연결되지 않았습니다.');
    }
  };

  return (
    <div className="p-8 bg-gray-100 rounded-lg">
      <h2 className="text-2xl font-bold">내 자산</h2>
      <p className="text-4xl my-4">{money.toLocaleString()}원</p>
      <div className="flex space-x-2">
        <button
          onClick={() => handlePurchase(100)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={!socket}
        >
          100원짜리 음료수 구매
        </button>
        <button
          onClick={() => handlePurchase(500)}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          disabled={!socket}
        >
          500원짜리 과자 구매
        </button>
      </div>
    </div>
  );
}