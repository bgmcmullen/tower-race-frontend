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
  const [takeFromPile, setTakeFromPile] = useState<string>('');


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
        case 'set_take_from_pile':
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



  function sendTestMessasge() {
    const testMessage = JSON.stringify({
      type: "start_game",
      payload: null,
    });

    setMessageQueue((prevMessageQueue) => [...prevMessageQueue, testMessage]);

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
      {computerPlayMessage}
      <>Computer's Tower:
        <br></br>
        {computerTower.map((brick) => <button>{brick}</button>
        )} <button>None</button></>
      <br></br>
      <div>{playerPlayMessage}</div>
      <>Player's Tower:
        <br></br>
        {playerTower.map((brick) => <button>{brick}</button>
        )} <button>None</button></>
      <br></br>
      <button onClick={sendTestMessasge}>Start</button>
    </>
  )
}

export default App
