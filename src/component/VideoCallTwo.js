import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

const socket = io("http://54.245.144.158:2121");

export default function VideoCallTwo() {
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const pc = useRef(new RTCPeerConnection(null));
  const textRef = useRef();
  const [offerVisible, setOfferVisible] = useState(true);
  const [answerVisible, setAnswerVisible] = useState(false);
  const [status, setStatus] = useState("Make call");

  useEffect(() => {
    socket.on("connection-success", (success) => {
      console.log(success);
    });

    socket.on("sdp", (args) => {
      console.log(args);
      pc.current.setRemoteDescription(new RTCSessionDescription(args.sdp));
      textRef.current.value = JSON.stringify(args.sdp);

      if (args.sdp.type === "offer") {
        setOfferVisible(false);
        setAnswerVisible(true);
        setStatus("Incoming call ...");
      } else {
        setStatus("Call Established.");
      }
    });

    socket.on("candidate", (candidate) => {
      console.log(candidate);
      // candidates.current =[ ...candidates.current, candidate]
      pc.current.addIceCandidate(new RTCIceCandidate(candidate));
    });

    const constraints = {
      audio: false,
      video: true,
    };

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        // display the stream video
        localVideoRef.current.srcObject = stream;

        stream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, stream);
        });
      })
      .catch((e) => {
        console.log("getUserMedia Error ......", e);
      });

    const peerConnection = new RTCPeerConnection(null);

    peerConnection.onicecandidate = (e) => {
      if (e.candidate) {
        console.log(JSON.stringify(e.candidate));
        sendToPeer("candidate", e.candidate);
      }
    };

    peerConnection.oniceconnectionstatechange = (e) => {
      console.log(e);
    };

    peerConnection.ontrack = (e) => {
      // we got remote stream...
      remoteVideoRef.current.srcObject = e.streams[0];
    };

    pc.current = peerConnection;
  }, []);

  const sendToPeer = (eventType, payload) => {
    socket.emit(eventType, payload);
  };

  const processSDP = (sdp) => {
    console.log(JSON.stringify(sdp));
    pc.current.setLocalDescription(sdp);

    sendToPeer("sdp", { sdp });
  };

  const createOffer = () => {
    pc.current
      .createOffer({
        offerToReceiveAudio: 1,
        offerToReceiveVideo: 1,
      })
      .then((sdp) => {
        // send the sdp to the server
        processSDP(sdp);
        setOfferVisible(false);
        setStatus("Calling to Peer...........");
      })
      .catch((e) => console.log(e));
  };

  const createAnswer = () => {
    pc.current
      .createAnswer({
        offerToReceiveAudio: 1,
        offerToReceiveVideo: 1,
      })
      .then((sdp) => {
        // send the andwer sdp to the offering peer
        processSDP(sdp);
        setAnswerVisible(false);
        setStatus("Call Established");
      })
      .catch((e) => console.log(e));
  };

  const showHidenButtons = () => {
    if (offerVisible) {
      return (
        <div>
          <button onClick={createOffer}>Call</button>
        </div>
      );
    } else if (answerVisible) {
      return (
        <div>
          <button onClick={createAnswer}>Answer</button>
        </div>
      );
    }
  };

  return (
    <>
      <div style={{ margin: 10 }}>
        <br />
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div>
            <span>Peer A</span>
            <br />
            <video
              autoPlay
              ref={localVideoRef}
              style={{
                width: 240,
                height: 240,
                margin: 5,
                backgroundColor: "black",
              }}
            ></video>
          </div>
          <div>
            <span>Peer B</span>
            <br />
            <video
              autoPlay
              ref={remoteVideoRef}
              style={{
                width: 340,
                height: 340,
                margin: 5,
                backgroundColor: "black",
              }}
            ></video>
          </div>
        </div>
        <br />
        <textarea ref={textRef}></textarea>
        <br />
        {showHidenButtons()}
        <h3>{status}</h3>
      </div>
    </>
  );
}
