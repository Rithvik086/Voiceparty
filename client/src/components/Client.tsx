import React, { useEffect, useState, useRef } from "react";
import generateName from "../utils/randomname";
const WS_URL = import.meta.env.VITE_WEB_SOCKET_URL;
import { v4 as uuidv4 } from "uuid";

const Client = () => {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [userName, setUserName] = useState("");
  const [isInCall, setIsInCall] = useState(false);

  // stream and peer refs
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    setUserName(generateName());
  }, []);

  useEffect(() => {
    ws.current = new WebSocket(WS_URL);

    ws.current.onopen = () => {
      console.log("Connected to signaling server");
      setIsConnected(true);
    };

    ws.current.onclose = () => {
      console.log("Disconnected from signaling server");
      setIsConnected(false);
    };

    ws.current.onmessage = async (event) => {
      const msg = JSON.parse(event.data);
      console.log("Received message:", msg);

      // if message type is offer recive an dset renmote description
      if (msg.type == "offer") {
        console.log("Handling offer, setting remote description");
        await peerRef.current?.setRemoteDescription(
          new RTCSessionDescription(msg.offer),
        );
        // create an answer
        const answer = await peerRef.current?.createAnswer();
        console.log("Answer created:", answer);
        // set you local description to answer
        await peerRef.current?.setLocalDescription(answer);
        console.log("Local description set for answer");

        ws.current?.send(
          JSON.stringify({
            type: "answer",
            answer: answer,
          }),
        );
        console.log("Answer sent via WebSocket");
      }

      // if messag etype is answer

      if (msg.type == "answer") {
        console.log("Handling answer, setting remote description");
        await peerRef?.current?.setRemoteDescription(
          new RTCSessionDescription(msg.answer),
        );
        console.log("Remote description set for answer");
      }
      // if msg type is candidate add teh ice candidate to you rtc peer ref

      if (msg.type == "candidate") {
        console.log("Handling ICE candidate, adding to peer");
        await peerRef.current?.addIceCandidate(
          new RTCIceCandidate(msg.candidate),
        );
        console.log("ICE candidate added");
      }
    };

    return () => {
      ws.current?.close();
    };
  }, []);

  const handleJoin = async () => {
    console.log("Joining channel...");
    // capturing your microphone
    streamRef.current = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    console.log("Audio stream captured:", streamRef.current);
    // a newt peer ocnnection

    peerRef.current = new RTCPeerConnection();
    console.log("RTCPeerConnection created");
    // adding stream tracks ot peer
    streamRef.current
      .getTracks()
      .forEach((track) => peerRef.current?.addTrack(track, streamRef.current!));
    console.log("Audio tracks added to peer");

    peerRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("Sending ICE candidate:", event.candidate);
        ws.current?.send(
          JSON.stringify({ type: "candidate", candidate: event.candidate }),
        );
      }
    };

    peerRef.current.ontrack = (event) => {
      console.log("Received remote track, playing audio");
      const remoteStream = event.streams[0];
      const audio = new Audio();
      audio.srcObject = remoteStream;
      audio.play();
    };
    const userId = uuidv4();
    console.log("Sending join message with userId:", userId);
    ws.current?.send(
      JSON.stringify({
        type: "join",
        channel: "room1",
        name: userName,
        userId: userId,
      }),
    );
    setIsJoined(true);
    console.log("Joined channel successfully");
  };

  const handleCall = async () => {
    console.log("Initiating call...");
    const offer = await peerRef.current?.createOffer();
    console.log("Offer created:", offer);
    await peerRef.current?.setLocalDescription(offer!);
    console.log("Local description set for offer");
    ws.current?.send(JSON.stringify({ type: "offer", offer }));
    console.log("Offer sent via WebSocket");
    setIsInCall(true);
  };

  return (
    <>
      <button onClick={handleCall} disabled={!isJoined || isInCall}>
        Call
      </button>

      <button onClick={handleJoin} disabled={!isConnected || isJoined}>
        Join channel
      </button>
    </>
  );
};

export default Client;
