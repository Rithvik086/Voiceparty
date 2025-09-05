import React, { useEffect, useRef } from "react";

const Receiver = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const socket = new WebSocket(
      import.meta.env.VITE_WEB_SOCKET_URL || "ws://localhost:8080"
    );
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "receiver" }));
    };

    let pc: RTCPeerConnection | null = null;
    let pendingCandidates: any[] = [];

    socket.onmessage = async (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "offer") {
        pc = new RTCPeerConnection();

        // ICE candidates
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.send(
              JSON.stringify({ type: "candidate", candidate: event.candidate })
            );
          }
        };

        // when remote track arrives
        pc.ontrack = (event) => {
          if (videoRef.current) {
            videoRef.current.srcObject = event.streams[0];
          }
        };

        await pc.setRemoteDescription(new RTCSessionDescription(message.offer));

        // Create answer
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.send(JSON.stringify({ type: "answer", answer }));

        // Add pending candidates
        pendingCandidates.forEach((c) => pc?.addIceCandidate(c));
        pendingCandidates = [];
      } else if (message.type === "candidate") {
        const candidate = new RTCIceCandidate(message.candidate);
        if (pc) {
          await pc.addIceCandidate(candidate);
        } else {
          pendingCandidates.push(candidate);
        }
      }
    };
  }, []);

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "40px auto",
        padding: "32px 24px",
        borderRadius: 16,
        boxShadow: "0 4px 24px rgba(77,166,255,0.10)",
        background: "linear-gradient(135deg,#f8fbff 60%,#eaf3ff 100%)",
        textAlign: "center",
      }}
    >
      <h2
        style={{
          marginBottom: 16,
          color: "#4d6aff",
          fontWeight: 700,
          fontSize: 22,
        }}
      >
        Receiver
      </h2>
      <div style={{ margin: "24px 0" }}>
        {/* Video will appear here when implemented */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: 320,
            height: 180,
            borderRadius: 8,
            background: "#000",
          }}
        />
      </div>
      <div style={{ marginTop: 8, color: "#888", fontSize: 14 }}>
        Waiting for sender to start the call...
      </div>
    </div>
  );
};

export default Receiver;
