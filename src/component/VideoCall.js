import React, { useEffect, useRef } from "react";

export default function VideoCall() {
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const pc = useRef(new RTCPeerConnection(null));
  const textRef = useRef();

  useEffect(() => {
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
      if (e.candidate) console.log(JSON.stringify(e.candidate));
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

  const createOffer = () => {
    pc.current
      .createOffer({
        offerToReceiveAudio: 1,
        offerToReceiveVideo: 1,
      })
      .then((sdp) => {
        console.log(JSON.stringify(sdp));
        pc.current.setLocalDescription(sdp);
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
        console.log(JSON.stringify(sdp));
        pc.current.setLocalDescription(sdp);
      })
      .catch((e) => console.log(e));
  };

  const setRemoteDescription = () => {
    //get the SDP value from the text editor
    const sdp = JSON.parse(textRef.current.value);
    console.log(sdp);

    pc.current.setRemoteDescription(new RTCSessionDescription(sdp));
  };

  const addCandidate = () => {
    const candidate = JSON.parse(textRef.current.value);
    console.log("Adding Candidate ......", candidate);

    pc.current.addIceCandidate(new RTCIceCandidate(candidate));
  };

  return (
    <>
      <div style={{ margin: 10 }}>
        <br />
        <div style={{display:"flex", flexDirection:"row"}}>
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
        <button onClick={createOffer}>Create Offer</button>
        <button onClick={createAnswer}>Create Answer</button>
        <button onClick={setRemoteDescription}>Set Remote Description</button>
        <button onClick={addCandidate}>Add Candidates</button>
      </div>
    </>
  );
}
