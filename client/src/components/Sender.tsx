import React from "react";
import { useEffect, useState } from "react";
const Sender = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket(
      import.meta.env.WEB_SOCKET_URL || "ws://localhost:8080"
    );
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "sender" }));
    };
  }, []);

  async function startsendingvideo() {
    if (!socket) return;
    //creat an  offer
    const pc = new RTCPeerConnection();
    //sdp offer
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket?.send(JSON.stringify({ type: "offer", sdp: pc.localDescription }));

    socket.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "answer") {
        await pc.setRemoteDescription(data.sdp);
      }
    };
  }

  return (
    <div>
      Sender
      <button onClick={startsendingvideo}>Start call</button>
    </div>
  );
};

export default Sender;
