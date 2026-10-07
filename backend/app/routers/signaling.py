import json
import logging
from typing import Dict
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.database import get_db
from app.models import Meeting, Participant

router = APIRouter()
logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        # meeting_code -> participant_id -> WebSocket
        self.active_connections: Dict[str, Dict[int, WebSocket]] = {}

    async def connect(self, websocket: WebSocket, meeting_code: str, participant_id: int):
        await websocket.accept()
        if meeting_code not in self.active_connections:
            self.active_connections[meeting_code] = {}
        
        # Send current peers
        peers = list(self.active_connections[meeting_code].keys())
        await websocket.send_json({"type": "peers", "peers": peers})
        
        # Notify others
        await self.broadcast(meeting_code, {"type": "peer-joined", "id": participant_id}, exclude=participant_id)
        
        self.active_connections[meeting_code][participant_id] = websocket

    def disconnect(self, meeting_code: str, participant_id: int):
        if meeting_code in self.active_connections:
            if participant_id in self.active_connections[meeting_code]:
                del self.active_connections[meeting_code][participant_id]
            if not self.active_connections[meeting_code]:
                del self.active_connections[meeting_code]

    async def broadcast(self, meeting_code: str, message: dict, exclude: int = None):
        if meeting_code in self.active_connections:
            for pid, ws in self.active_connections[meeting_code].items():
                if pid != exclude:
                    try:
                        await ws.send_json(message)
                    except Exception as e:
                        logger.error(f"Error sending message to {pid}: {e}")

    async def send_personal_message(self, meeting_code: str, participant_id: int, message: dict):
        if meeting_code in self.active_connections and participant_id in self.active_connections[meeting_code]:
            ws = self.active_connections[meeting_code][participant_id]
            try:
                await ws.send_json(message)
            except Exception as e:
                logger.error(f"Error sending personal message to {participant_id}: {e}")

manager = ConnectionManager()

@router.websocket("/ws/meetings/{code}")
async def websocket_endpoint(websocket: WebSocket, code: str, participant_id: int, db: Session = Depends(get_db)):
    meeting = db.execute(select(Meeting).where(Meeting.meeting_code == code)).scalar_one_or_none()
    
    if not meeting or meeting.status == "ended":
        await websocket.accept()
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
        
    participant = db.execute(
        select(Participant).where(Participant.id == participant_id, Participant.meeting_id == meeting.id)
    ).scalar_one_or_none()
    
    if not participant or participant.status == "removed":
        await websocket.accept()
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await manager.connect(websocket, code, participant_id)
    
    try:
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
            except json.JSONDecodeError:
                continue
                
            msg_type = message.get("type")
            if msg_type in ["offer", "answer", "ice"]:
                target_id = message.get("to")
                if target_id is not None:
                    forward_msg = {k: v for k, v in message.items() if k != "to"}
                    forward_msg["from"] = participant_id
                    await manager.send_personal_message(code, target_id, forward_msg)
            elif msg_type == "media-state":
                forward_msg = {
                    "type": "media-state",
                    "from": participant_id,
                    "video": message.get("video", False),
                    "audio": message.get("audio", False),
                }
                target_id = message.get("to")
                if target_id is not None:
                    await manager.send_personal_message(code, target_id, forward_msg)
                else:
                    await manager.broadcast(code, forward_msg, exclude=participant_id)
    except WebSocketDisconnect:
        manager.disconnect(code, participant_id)
        await manager.broadcast(code, {"type": "peer-left", "id": participant_id})
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(code, participant_id)
        await manager.broadcast(code, {"type": "peer-left", "id": participant_id})
