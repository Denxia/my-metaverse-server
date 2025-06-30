const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

// 모든 플레이어의 정보를 저장할 곳
let players = {};
let nextPlayerId = 1;

wss.on('connection', ws => {
  const playerId = nextPlayerId++;
  players[playerId] = {
    ws: ws,
    money: 10000 // 초기 자금 10000원
  };
  console.log(`새로운 클라이언트 (ID: ${playerId})가 접속했습니다.`);

  // 접속한 클라이언트에게 현재 돈 상태를 보내줌
  const initialState = {
    action: 'update_money',
    money: players[playerId].money
  };
  ws.send(JSON.stringify(initialState));

  // 메시지 수신 시 로직
  ws.on('message', message => {
    console.log(`클라이언트 (ID: ${playerId})로부터 받은 메시지: ${message}`);

    try {
      const data = JSON.parse(message);

      switch (data.action) {
        case 'purchase':
          const cost = data.amount || 0;
          if (players[playerId].money >= cost) {
            players[playerId].money -= cost;
            console.log(`ID ${playerId}의 자산이 ${cost}만큼 차감되어 현재 ${players[playerId].money}원 입니다.`);

            // 변경된 돈 상태를 모든 클라이언트에게 전파
            const updateState = {
              action: 'update_money',
              money: players[playerId].money
            };

            // 모든 접속자에게 잔액 변경 전송
            for (const id in players) {
              if (players[id].ws.readyState === WebSocket.OPEN) {
                players[id].ws.send(JSON.stringify(updateState));
              }
            }

          } else {
            console.log(`ID ${playerId}의 자산이 부족하여 구매에 실패했습니다.`);
          }
          break;

        // "Unreal says Hello!" 같은 테스트 메시지 처리
        default:
          // 받은 메시지를 그대로 되돌려주는 에코(echo) 기능 추가
          ws.send(message.toString());
          break;
      }
    } catch (error) {
      console.error('잘못된 JSON 형식의 메시지입니다:', error);
      // JSON 파싱 실패 시 받은 메시지를 그대로 에코
      ws.send(message.toString());
    }
  });

  ws.on('close', () => {
    console.log(`클라이언트 (ID: ${playerId})의 접속이 끊어졌습니다.`);
    delete players[playerId];
  });
});

console.log('🚀 v2 머니 시스템이 8080 포트에서 당신을 기다리고 있어요...');