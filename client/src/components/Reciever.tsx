import React from "react";
import { useEffect } from "react";

const Reciever = () => {
  useEffect(() => {
    const socket = new WebSocket(
      import.meta.env.VITE_WEB_SOCKET_URL || "ws://localhost:8080"
    );
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "receiver" }));
    };

    socket.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "offer") {
        const pc = new RTCPeerConnection();
        await pc.setRemoteDescription(message.sdp);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.send(
          JSON.stringify({ type: "answer", sdp: pc.localDescription })
        );
      }
    };
  }, []);

  return <div>Reciever</div>;
};

export default Reciever;
