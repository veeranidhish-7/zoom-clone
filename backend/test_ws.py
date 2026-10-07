import asyncio
import websockets
import json

BASE_WS_URL = "ws://127.0.0.1:8000/ws/meetings"
MEETING_CODE = "65045918333"
PARTICIPANT_A = 20
PARTICIPANT_B = 21
WRONG_PARTICIPANT = 9999

async def main():
    # 2. Connection with wrong participant id being rejected
    print("\n--- Test 2: Connection with wrong participant id ---")
    try:
        async with websockets.connect(f"{BASE_WS_URL}/{MEETING_CODE}?participant_id={WRONG_PARTICIPANT}") as ws:
            await ws.recv()
            print("ERROR: Should not have connected")
    except websockets.exceptions.ConnectionClosedError as e:
        print(f"Connection rejected as expected with code: {e.code}")
    except Exception as e:
        print(f"Connection rejected with error: {e}")

    # 1. Valid participant connecting
    print("\n--- Test 1 & 4: Valid participant connecting and leaving ---")
    async with websockets.connect(f"{BASE_WS_URL}/{MEETING_CODE}?participant_id={PARTICIPANT_A}") as ws_a:
        print("Participant A connected.")
        msg = await ws_a.recv()
        print(f"Participant A received (on connect): {msg}")
        
        # Connect B
        async with websockets.connect(f"{BASE_WS_URL}/{MEETING_CODE}?participant_id={PARTICIPANT_B}") as ws_b:
            print("Participant B connected.")
            msg_b = await ws_b.recv()
            print(f"Participant B received (on connect): {msg_b}")
            
            # A should receive peer-joined
            msg_a_joined = await ws_a.recv()
            print(f"Participant A received: {msg_a_joined}")
            
            # 3. Offer sent from A arriving at B with correct from field
            print("\n--- Test 3: Offer sent from A to B ---")
            offer = {"type": "offer", "to": PARTICIPANT_B, "sdp": "v=0\n..."}
            print(f"Participant A sending: {offer}")
            await ws_a.send(json.dumps(offer))
            
            msg_b_offer = await ws_b.recv()
            print(f"Participant B received offer: {msg_b_offer}")
            
            # A answer from B to A
            answer = {"type": "answer", "to": PARTICIPANT_A, "sdp": "v=0\n..."}
            await ws_b.send(json.dumps(answer))
            msg_a_answer = await ws_a.recv()
            print(f"Participant A received answer: {msg_a_answer}")

            # ICE candidate from A to B
            ice = {"type": "ice", "to": PARTICIPANT_B, "candidate": "candidate:1 1 UDP..."}
            await ws_a.send(json.dumps(ice))
            msg_b_ice = await ws_b.recv()
            print(f"Participant B received ice: {msg_b_ice}")

        # B disconnects (leaves context)
        print("\n--- Test 4: Peer left arriving when a client disconnects ---")
        print("Participant B disconnected.")
        msg_a_left = await ws_a.recv()
        print(f"Participant A received: {msg_a_left}")

asyncio.run(main())
