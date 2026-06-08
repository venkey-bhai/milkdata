from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.deps import get_current_user
from app.db.database import get_db
from app.db.models import Customer, MilkEntry
from app.schemas import CustomerStatusUpdate
from app.schemas.CustomerStatusUpdate import CustomerStatusUpdate
from app.schemas.customer import CustomerCreate
 
router = APIRouter(dependencies=[Depends(get_current_user)])

@router.post("/customer")
def add_customer(customer: CustomerCreate, db: Session = Depends(get_db)):
    db_customer = Customer(**customer.dict())
    db.add(db_customer)
    db.commit()
    return {"message": "Customer added"}

@router.get("/customers")
def get_customers(db: Session = Depends(get_db)):
    return db.query(Customer).all()


@router.put("/customer/{id}")
def update_customer(
    id: int,
    updated_data: CustomerCreate,
    db: Session = Depends(get_db)
):
    customer = db.query(Customer).filter(Customer.id == id).first()

    if not customer:
        return {"detail": "Customer not found"}
    customer.customer_no = updated_data.customer_no
    customer.name = updated_data.name
    customer.phone = updated_data.phone
    customer.address = updated_data.address
    customer.milk_type = updated_data.milk_type
    customer.price_per_liter = updated_data.price_per_liter

    db.commit()

    return {"message": "Customer updated"}


# @router.delete("/customer/{id}")
# def delete_customer(id: int, db: Session = Depends(get_db)):
#     customer = db.query(Customer).filter(Customer.id == id).first()

#     if not customer:
#         return {"detail": "Customer not found"}

#     db.delete(customer)
#     db.commit()

#     return {"message": "Customer deleted"}



@router.delete("/customer/{id}")
def delete_customer(id: int, db: Session = Depends(get_db)):

      # delete milk entries first
    db.query(MilkEntry).filter(
        MilkEntry.customer_id == id
    ).delete()

    # delete customer
    customer = db.query(Customer).filter(
        Customer.id == id
    ).first()

    if not customer:
        raise HTTPException(404, "Customer not found")

    db.delete(customer)
    db.commit()
    
    return {"message": "Customer deleted"}
    
    # except Exception as e:
    #     db.rollback()
    #     raise HTTPException(status_code=500, detail=str(e))
    
@router.put("/customer/{id}/status")
def update_customer_status(
    id: int,
    status_data: CustomerStatusUpdate,
    db: Session = Depends(get_db)
):

    customer = db.query(Customer).filter(Customer.id == id).first()

    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    customer.status = status_data.status
    customer.is_active = status_data.is_active

    db.commit()
    db.refresh(customer)

    return {
        "message": "Customer status updated successfully",
        "customer": customer
    }