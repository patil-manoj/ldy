from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import PriceList
from app.schemas import PriceListCreate, PriceListOut

router = APIRouter(prefix="/api/price-list", tags=["price-list"])


@router.get("", response_model=list[PriceListOut])
def get_price_list(
    service_type: str | None = Query(None),
    category: str | None = Query(None),
    active_only: bool = Query(True),
    db: Session = Depends(get_db),
):
    q = db.query(PriceList)
    if active_only:
        q = q.filter(PriceList.active == True)
    if service_type:
        q = q.filter(PriceList.service_type == service_type)
    if category:
        q = q.filter(PriceList.category == category)
    return q.order_by(PriceList.service_type, PriceList.category, PriceList.item_name).all()


@router.post("", response_model=PriceListOut, status_code=201)
def create_price(payload: PriceListCreate, db: Session = Depends(get_db)):
    item = PriceList(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/{item_id}", response_model=PriceListOut)
def update_price(item_id: int, payload: PriceListCreate, db: Session = Depends(get_db)):
    item = db.query(PriceList).get(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Price item not found")
    for field, value in payload.model_dump().items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}", status_code=204)
def deactivate_price(item_id: int, db: Session = Depends(get_db)):
    item = db.query(PriceList).get(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Price item not found")
    item.active = False
    db.commit()
