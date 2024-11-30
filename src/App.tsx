import { useState, useEffect, useRef } from 'react';

import './App.scss'

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
  const [playerTowerStatus, setPlayerTowerStatus] = useState<{ brickAnimation: string | undefined, towerAnimation: string | undefined, brickContainerAnimation: string | undefined } | undefined>({ brickAnimation: undefined, towerAnimation: undefined, brickContainerAnimation: undefined });
  const [computerTowerStatus, setComputerTowerStatus] = useState<{ brickAnimation: string | undefined, towerAnimation: string | undefined, brickContainerAnimation: string | undefined } | undefined>({ brickAnimation: undefined, towerAnimation: undefined, brickContainerAnimation: undefined });
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<string>('');


  function calculateTowerStatus(tower: number[], isComputer: boolean) {
    if (gameOver)
      return;

    let flyInAnimation = '';
    if (isComputer) {
      flyInAnimation = 'fly-in-right .6s ease-out';
    } else {
      flyInAnimation = 'fly-in-left .6s ease-out';
    }

    let errors = 0;
    let highest = 0;

    for (let i = 0; i < tower.length; i++) {
      if (tower[i] < highest)
        errors++
      else if (tower[i] > highest)
        highest = tower[i];
    }
    if (errors <= 2)
      return { brickAnimation: flyInAnimation, towerAnimation: 'sway 18s ease-in-out infinite', brickContainerAnimation: 'flash-green 2s ease-in-out infinite' };
    else if (errors <= 4)
      return { brickAnimation: flyInAnimation, towerAnimation: 'sway 13s ease-in-out infinite', brickContainerAnimation: 'vibrate 3.5s ease-in-out infinites' }
    else
      return { brickAnimation: flyInAnimation, towerAnimation: 'sway 8s ease-in-out infinite', brickContainerAnimation: 'vibrate 2s ease-in-out infinite' };
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
          if (!gameOver)
            setTimeout(() => {
              setComputerTower(payload);
            }, 400)

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
          setGameOver(true);
          setWinner('player');
          setComputerTowerStatus({ brickAnimation: undefined, towerAnimation: undefined, brickContainerAnimation: undefined });
          // setPlayerTowerStatus( { brickAnimation: undefined, towerAnimation: 'rise-up-and-down 3s ease-in-out infinite', brickContainerAnimation: 'flash-gold 3s ease-in-out infinite' });
          break;
        case 'computer_wins':
          setGameOver(true);
          setWinner('computer');
          setPlayerTowerStatus({ brickAnimation: undefined, towerAnimation: undefined, brickContainerAnimation: undefined });
          // setComputerTowerStatus( { brickAnimation: undefined, towerAnimation: 'rise-up-and-down 3s ease-in-out infinite', brickContainerAnimation: 'flash-gold 3s ease-in-out infinite' });
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

  }, []);


  function sendReplaceBrickMessage(event: React.MouseEvent<HTMLButtonElement>) {
    if (!takeFromPile || gameOver)
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
    setComputerTowerStatus(calculateTowerStatus(computerTower, true));
    setPlayerTowerStatus(calculateTowerStatus(playerTower, false));
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
      <h1>- - - Tower Race - - -</h1>
      <button className='start-button' onClick={sendStartMessasge}>Start</button>
      <br></br>

      <p className='play-message'>{computerPlayMessage}</p>
      <div>Next brick in {takeFromPile === 'discard' ? 'discard' : 'hidden'} stack: {nextBrick && <button className='new-brick' style={{ width: 5 + (nextBrick  * 4)}} >{nextBrick}</button>}</div>
      <button onClick={switchToMainPile}>Take from Hidden Stack</button>
      <span className='game-container'>
        <div className='tower' style={{ animation: `${winner === 'player' ? 'rise-up-and-down 3s ease-in-out infinite' : playerTowerStatus?.towerAnimation}` }}>
          <h2>{winner === 'player' ? '👑Player👑' : 'Player'}</h2>
          {playerTower.map((brick, index) => <div key={`player-brick-container${index}`} className='button-container' style={{ animation: `${winner === 'player' ? 'flash-gold 3s ease-in-out infinite' : playerTowerStatus?.brickContainerAnimation} ${.6 + (10 - index) / 10}s` }}><button key={`player-brick${brick}`} className={`tower-button-delay-${index}`} style={{ width: 5 + (brick * 4), animation: playerTowerStatus?.brickAnimation }} onClick={sendReplaceBrickMessage}>{brick}</button></div>
          )} </div>
        <>
          <br></br>
          <div className='tower' style={{ animation: `${winner === 'computer' ? 'rise-up-and-down 3s ease-in-out infinite' : computerTowerStatus?.towerAnimation}` }}>
            <h2>{winner === 'computer' ? '👑Computer👑' : 'Computer'}</h2>
            {computerTower.map((brick, index) => <div key={`computer-brick-container${index}`} className='button-container' style={{ animation: `${winner === 'computer' ? 'flash-gold 3s ease-in-out infinite' : computerTowerStatus?.brickContainerAnimation} ${.6 + (10 - index) / 10}s` }}><button key={`computer-brick${brick}`} className={`tower-button-delay-${index}`} style={{ width: 5 + (brick * 4), animation: computerTowerStatus?.brickAnimation }}>{brick}</button></div>
            )}
          </div>
        </>
        <br></br>
      </span>


    </>
  )
}

export default App
