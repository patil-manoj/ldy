from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Setting
from app.schemas import SettingOut, SettingUpdate

router = APIRouter(prefix="/api/settings", tags=["settings"])


@router.get("", response_model=list[SettingOut])
def get_all_settings(db: Session = Depends(get_db)):
    return db.query(Setting).all()


@router.get("/{key}", response_model=SettingOut)
def get_setting(key: str, db: Session = Depends(get_db)):
    setting = db.query(Setting).filter(Setting.key == key).first()
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    return setting


@router.put("/{key}", response_model=SettingOut)
def update_setting(key: str, payload: SettingUpdate, db: Session = Depends(get_db)):
    setting = db.query(Setting).filter(Setting.key == key).first()
    if not setting:
        setting = Setting(key=key, value=payload.value)
        db.add(setting)
    else:
        setting.value = payload.value
    db.commit()
    db.refresh(setting)
    return setting
