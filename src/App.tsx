import { useState, useEffect, useRef } from 'react';

import calculateTowerStatus from './CalculateTowerStatus';

import './App.scss'

const API_URL: string | URL = import.meta.env.VITE_API_URL



function App() {


  const playerTowerAnimationRef = useRef<{ brickAnimation: string | undefined; towerAnimation: string | undefined; brickContainerAnimation: string | undefined } | undefined>({ brickAnimation: undefined, towerAnimation: undefined, brickContainerAnimation: undefined });
  const computerTowerAnimationRef = useRef<{ brickAnimation: string | undefined; towerAnimation: string | undefined; brickContainerAnimation: string | undefined } | undefined>({ brickAnimation: undefined, towerAnimation: undefined, brickContainerAnimation: undefined });

  const socketRef = useRef<WebSocket | null>(null);
  const [messageQueue, setMessageQueue] = useState<string[]>([]);
  const [computerTower, setComputerTower] = useState<number[]>([]);
  const [playerTower, setPlayerTower] = useState<number[]>([]);
  const [computerPlayMessage, setComputerPlayMessage] = useState<string>('');
  const [takeFromPile, setTakeFromPile] = useState<string>('discard');
  const [nextBrick, setNextBrick] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<string>('');



  useEffect(() => {

    socketRef.current = new WebSocket(API_URL);
    // Event listener for receiving messages
    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const type = data.type;
      const payload = data.payload;
      switch (type) {
        case 'test':
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
        case 'set_next_brick':
          setNextBrick(payload);
          break;
        case 'player_wins':
          setGameOver(true);
          setWinner('player');

          // Stop computer tower animation
          computerTowerAnimationRef.current = { brickAnimation: undefined, towerAnimation: undefined, brickContainerAnimation: undefined };
          break;
        case 'computer_wins':
          setGameOver(true);
          setWinner('computer');

          // Stop player tower animation
          playerTowerAnimationRef.current = { brickAnimation: undefined, towerAnimation: undefined, brickContainerAnimation: undefined };
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

  function switchToHiddenPile() {
    setTakeFromPile('hidden');

    const message = JSON.stringify({
      type: 'get_top_of_hidden',
      payload: null
    });
    setMessageQueue((prevMessageQueue) => [...prevMessageQueue, message]);
  }

  useEffect(() => {
    playerTowerAnimationRef.current = calculateTowerStatus(playerTower, false, gameOver);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerTower])

  useEffect(() => {
    computerTowerAnimationRef.current = calculateTowerStatus(computerTower, true, gameOver);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [computerTower])



  // Handle message sending with queue
  useEffect(() => {
    const sendMessage = async () => {
      if (messageQueue.length > 0 && socketRef.current !== null && socketRef.current.readyState === WebSocket.OPEN) {
        const message = messageQueue[0]; // Get the first message in the queue

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

      {/* Display next brick */}
      <p className='main-text'>Next brick in {takeFromPile === 'discard' ? 'discard' : 'hidden'} stack: {nextBrick && <button className='new-brick' style={{ width: 5 + (nextBrick * 4) }} >{nextBrick}</button>}</p>

      <button className='switch-button' onClick={switchToHiddenPile}>Take from Hidden Stack</button>

      <span className='game-container'>

        {/* Contain player tower and set tower animation */}
        <div className='tower' style={{ animation: `${gameOver ? (winner === 'player' ? 'rise-up-and-down 3s ease-in-out infinite' : 'drop 2s ease-in forwards') : playerTowerAnimationRef.current?.towerAnimation}` }}>

          {/* Add crown emojis if player has won */}
          <h2>{winner === 'player' ? '👑Player👑' : 'Player'}</h2>

          {/* Display player tower */}
          {playerTower.map((brick, index) => <div key={`player-brick-container${index}`}

            // Flash green when tower is close to stacked
            className='button-container' style={{ animation: `${winner === 'player' ? 'flash-gold 3s ease-in-out infinite' : playerTowerAnimationRef.current?.brickContainerAnimation} ${.6 + (10 - index) / 10}s` }}>

            {/* Brick button front face */}
            <button key={`player-brick${brick}`} className={`tower-button-delay-${index}`} style={{ width: 5 + (brick * 4), animation: playerTowerAnimationRef.current?.brickAnimation }} onClick={sendReplaceBrickMessage}>{brick}</button>

            {/* Brick button back face */}
            <button key={`player-brick-top${brick}`} className={`tower-button-topface-${index}`} style={{ width: 5 + (brick * 4) }}>{brick}</button></div>
          )} </div>

        <br></br>

        {/* Contain computer tower and set tower animation */}
        <div className='tower' style={{ animation: `${gameOver ? (winner === 'computer' ? 'rise-up-and-down 3s ease-in-out infinite' : 'drop 2s ease-in forwards') : computerTowerAnimationRef.current?.towerAnimation}` }}>

          {/* Add crown emojis if computer has won */}
          <h2>{winner === 'computer' ? '👑Computer👑' : 'Computer'}</h2>

          {/* Display computer tower */}
          {computerTower.map((brick, index) => <div key={`computer-brick-container${index}`}

            // Flash green when tower is close to stacked
            className='button-container' style={{ animation: `${winner === 'computer' ? 'flash-gold 3s ease-in-out infinite' : computerTowerAnimationRef.current?.brickContainerAnimation} ${.6 + (10 - index) / 10}s` }}>

            {/* Brick button front face */}
            <button key={`computer-brick${brick}`} className={`tower-button-delay-${index}`} style={{ width: 5 + (brick * 4), animation: computerTowerAnimationRef.current?.brickAnimation }}>{brick}</button>

            {/* Brick button back face */}
            <button key={`computer-brick-top${brick}`} className={`tower-button-topface-${index}`} style={{ width: 5 + (brick * 4) }}>{brick}</button></div>
          )}
        </div>
        <br></br>
      </span>
    </>
  )
}

export default App
