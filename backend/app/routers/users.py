from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..schemas import UserOut

router = APIRouter(prefix="/api", tags=["users"])


@router.get("/me", response_model=UserOut)
def get_me(db: Session = Depends(get_db)):
    """Return the default user (Anirudh, id=1)."""
    user = db.query(User).filter(User.id == 1).first()
    if not user:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Default user not found")
    return user
