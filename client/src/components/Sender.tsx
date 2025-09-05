import React, { useEffect, useState } from "react";

const Sender = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [pc, setPc] = useState<RTCPeerConnection | null>(null);

  useEffect(() => {
    const ws = new WebSocket(import.meta.env.VITE_WEB_SOCKET_URL || "ws://localhost:8080");
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "sender" }));
    };
    setSocket(ws);
  }, []);

  async function startSendingVideo() {
    if (!socket) return;

    const peer = new RTCPeerConnection();
    setPc(peer);

    // ICE candidates
    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.send(JSON.stringify({ type: "candidate", candidate: event.candidate }));
      }
    };

    // handle remote answer
    socket.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "answer") {
        await peer.setRemoteDescription(new RTCSessionDescription(data.answer));
      } else if (data.type === "candidate") {
        await peer.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    };

    // Get local camera
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    stream.getTracks().forEach(track => peer.addTrack(track, stream));

    // Create and send offer
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    socket.send(JSON.stringify({ type: "offer", offer }));
  }

  return (
    <div style={{
      maxWidth: 400,
      margin: '40px auto',
      padding: '32px 24px',
      borderRadius: 16,
      boxShadow: '0 4px 24px rgba(77,166,255,0.10)',
      background: 'linear-gradient(135deg,#f8fbff 60%,#eaf3ff 100%)',
      textAlign: 'center',
    }}>
      <h2 style={{marginBottom: 16, color: '#4d6aff', fontWeight: 700, fontSize: 22}}>Sender</h2>
      <button
        onClick={startSendingVideo}
        style={{
          padding: '12px 32px',
          fontSize: 16,
          fontWeight: 600,
          color: '#fff',
          background: 'linear-gradient(90deg,#4da6ff,#4d6aff)',
          border: 'none',
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(77,166,255,0.15)',
          cursor: 'pointer',
          marginBottom: 8,
          transition: 'all 0.2s',
        }}
        onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg,#4d6aff,#4da6ff)'}
        onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg,#4da6ff,#4d6aff)'}
      >
        Start Call
      </button>
      <div style={{marginTop: 16, color: '#888', fontSize: 14}}>
        Click to start sending your video/audio stream.
      </div>
    </div>
  );
};

export default Sender;
