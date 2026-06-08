from fastapi import APIRouter, Depends,HTTPException
# from h11 import Data
from sqlalchemy.orm import Session
from app.core.deps import get_milk_entry_user#new one
from app.db.database import get_db
from app.db.models import MilkEntry,Customer
from app.schemas.milk_entry import MilkEntryCreate

router = APIRouter()

@router.post("/milk-entry")
def add_milk(
    entry: MilkEntryCreate,
    db: Session = Depends(get_db),
    milk_user = Depends(get_milk_entry_user)
):
     # ✅ STEP 1: find customer using customer_no
    customer = db.query(Customer).filter(
        Customer.customer_no == entry.customer_no
    ).first()
    
      # 2. Check if customer exists
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
     # 3. IMPORTANT: Check active status
    if customer.is_active is False:
        raise HTTPException(
            status_code=400,
            detail="Inactive customer cannot add milk entry"
        )
    
    total = float(entry.liters) * float(entry.rate)

    db_entry = MilkEntry(
        
       customer_id=customer.id,
        date=entry.date,
        session=entry.session,
        liters=entry.liters,
        rate=entry.rate,
        total=total
    )

    db.add(db_entry)
    db.commit()
    # print(Data)
    return {"message": "Entry saved", "total": total}