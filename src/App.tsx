import { useState, useEffect, useRef } from 'react';

import './App.css'

const API_URL: string | URL = import.meta.env.VITE_API_URL



function App() {

  const socketRef = useRef<WebSocket | null>(null);
  const [messageQueue, setMessageQueue] = useState<string[]>([]);
  const [computerTower, setComputerTower] = useState<number[]>([]);
  const [playerTower, setPlayerTower] = useState<number[]>([]);
  const [computerPlayMessage, setComputerPlayMessage] = useState<string>('');
  const [playerPlayMessage, setPlayerPlayMessage] = useState<string>('');
  const [takeFromPile, setTakeFromPile] = useState<string>('discard');
  const [nextBrick, setNextBrick] = useState<number | null>(null);
  const [playerTowerStatus, setPlayerTowerStatus] = useState<object>({brickAnimation: undefined, towerAnimation: undefined});
  const [computerTowerStatus, setComputerTowerStatus] = useState<object>({brickAnimation: undefined, towerAnimation: undefined});


  function calculateTowerStatus(tower: number[]) {
    let errors = 0;

    for (let i = 0; i < tower.length - 1; i++) {
      console.log(tower[i]);
      if (tower[i] > tower[i + 1]){
        errors++;
      }
    }
    console.log('errors', errors)
    if (errors <= 1)
      return {brickAnimation: 'flash 2s ease-in-out infinite', towerAnimation: undefined};
    else if (errors <= 3)
      return {brickAnimation: undefined, towerAnimation: undefined};
    else
      return {brickAnimation: undefined, towerAnimation: 'sway 2s ease-in-out infinite'};
  }


  useEffect(() => {

    socketRef.current = new WebSocket(API_URL);
    // Event listener for receiving messages
    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const type = data.type;
      const payload = data.payload;
      console.log('message', data)
      switch (type) {
        case 'test':
          console.log(payload);
          break;
        case 'set_computer_tower':
          setComputerTower(payload);
          break;
        case 'set_player_tower':
          setPlayerTower(payload);
          break;
        case 'set_computer_play_message':
          setComputerPlayMessage(payload);
          break;
        case 'set_player_play_message':
          setPlayerPlayMessage(payload);
          break;
        case 'set_next_brick':
          setNextBrick(payload);
          break;
        case 'player_wins':
          alert("YOU WIN!!")
          break;
        case 'computer_wins':
          alert("YOU LOSE!!");
          break;

      }
    }

    // Handle the open event and enable sending messages
    socketRef.current.addEventListener('open', () => {
      console.log('WebSocket connection opened.');
    });

    socketRef.current.addEventListener('close', () => {
      console.log('WebSocket connection closed.');
    });

  }, [])

  function sendReplaceBrickMessage(event: React.MouseEvent<HTMLButtonElement>) {
    if (!takeFromPile)
      return;

    const target = event.target as HTMLButtonElement;
    const takeMessage = JSON.stringify({
      type: `take_from_${takeFromPile}`,
      payload: target.innerText
    })

    setMessageQueue((prevMessageQueue) => [...prevMessageQueue, takeMessage]);
    setTakeFromPile('discard');


    const getMessage = JSON.stringify({
      type: 'get_top_of_discard',
      payload: null
    })

    setMessageQueue((prevMessageQueue) => [...prevMessageQueue, getMessage]);

  }

  function sendStartMessasge() {
    const testMessage = JSON.stringify({
      type: "start_game",
      payload: null,
    });

    setMessageQueue((prevMessageQueue) => [...prevMessageQueue, testMessage]);

    const message = JSON.stringify({
      type: 'get_top_of_discard',
      payload: null
    })

    setMessageQueue((prevMessageQueue) => [...prevMessageQueue, message]);


  }

  useEffect(() => {
    setComputerTowerStatus(calculateTowerStatus(computerTower));
    setPlayerTowerStatus(calculateTowerStatus(playerTower));
  }, [computerTower, playerTower])

  function switchToMainPile() {
    setTakeFromPile('main');

    const message = JSON.stringify({
      type: 'get_top_of_main',
      payload: null
    });
    setMessageQueue((prevMessageQueue) => [...prevMessageQueue, message]);
  }


  // Handle message sending with queue
  useEffect(() => {
    const sendMessage = async () => {
      if (messageQueue.length > 0 && socketRef.current !== null && socketRef.current.readyState === WebSocket.OPEN) {
        const message = messageQueue[0]; // Get the first message in the queue


        console.log(message);

        socketRef.current.send(message);
        setMessageQueue(prevMessageQueue => prevMessageQueue.slice(1)); // Remove the sent message from the queue

      }
    };

    sendMessage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageQueue]);

  return (
    <>
    <div>computerTowerStatus: {computerTowerStatus.towerAnimation}</div>
    <div>playerTowerStatus: {playerTowerStatus.towerAnimation}</div>
      <br></br>
      {computerPlayMessage}
      <>Computer's Tower:
        <br></br>
        <div className='tower' style={{animation: computerTowerStatus.towerAnimation}}>
        {computerTower.map((brick, index) => <div key={`computer-brick-container${index}`} className="button-container"><button key={`computer-brick${index}`} className='tower-button' style={{ width: 5 + (brick * 4), animation: computerTowerStatus.brickAnimation, animationDelay:`${index/10}s` }}>{brick}</button></div>
        )} 
        </div></>
      <br></br>
      <div>{playerPlayMessage}</div>
      <>Player's Tower:
        <br></br>
        <div>Next Brick: {nextBrick}</div>
        <div className='tower' style={{animation: playerTowerStatus.towerAnimation}}>
        {playerTower.map((brick, index) => <div key={`player-brick-container${index}`} className="button-container"><button key={`player-brick${index}`} className='tower-button' style={{ width: 5 + (brick * 4), animation: playerTowerStatus.brickAnimation, animationDelay:`${index/10}s` }} onClick={sendReplaceBrickMessage}>{brick}</button></div>
        )} <button onClick={switchToMainPile}>Take from Main</button></div></>
      <br></br>
      <button onClick={sendStartMessasge}>Start</button>
    </>
  )
}

export default App
