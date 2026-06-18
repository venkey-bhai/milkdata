# from tkinter import Entry

# from sqlalchemy.orm import Session
# from app.db.models import MilkEntry

# def monthly_report(db: Session, customer_id: int):
#     entries = db.query(MilkEntry).filter(MilkEntry.customer_id == customer_id).all()

#     total_liters = sum(e.liters for e in entries)
#     total_amount = sum(e.total for e in entries)
    

#     return {
#         "customer_id": customer_id,
#         "total_liters": total_liters,
#         "total_amount_inr": total_amount,
        
#     }