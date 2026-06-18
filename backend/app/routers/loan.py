# loan.py

from app.schemas import Loan
from app.schemas.Loan import LoanCreate, LoanDeduction
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Customer
# Import Loan model correctly if needed
from app.db.models import Loan

router = APIRouter(tags=["Loan"])


# Create Loan
@router.post("/create")
def create_loan(
    data: LoanCreate,
    db: Session = Depends(get_db)
):

    # Validate input
    if data.total_loan < 0:
        raise HTTPException(
            status_code=400,
            detail="Loan cannot be negative"
        )

    loan = Loan(
        customer_no=data.customer_no,
        total_loan=data.total_loan,
        deducted_amount=0,
        remaining_balance=data.total_loan,
        milk_sale_amount=0,
        final_payable=0
    )

    db.add(loan)
    db.commit()
    db.refresh(loan)

    return {
        "message": "Loan created",
        "data": loan
    }


# Deduct Loan
@router.put("/{loan_id}/deduct")
def deduct_loan(
    loan_id: int,
    data: LoanDeduction,
    db: Session = Depends(get_db)
):
    loan = (
        db.query(Loan)
        .filter(Loan.id == loan_id)
        .first()
    )

    if not loan:
        raise HTTPException(
            status_code=404,
            detail="Loan not found"
        )

    # Validate deduction
    if data.deduct_amount < 0:
        raise HTTPException(
            status_code=400,
            detail="Deduction cannot be negative"
        )

    if data.milk_sale_amount < 0:
        raise HTTPException(
            status_code=400,
            detail="Milk sale cannot be negative"
        )

    if data.deduct_amount > loan.remaining_balance:
        raise HTTPException(
            status_code=400,
            detail="Deduction exceeds balance"
        )

    final_amount = (
        data.milk_sale_amount
        - data.deduct_amount
    )

    loan.deducted_amount += data.deduct_amount
    loan.remaining_balance -= data.deduct_amount
    loan.milk_sale_amount = data.milk_sale_amount
    loan.final_payable = final_amount

    db.commit()
    db.refresh(loan)

    return {
        "milk_sale": data.milk_sale_amount,
        "deducted": data.deduct_amount,
        "pay_customer": final_amount,
        "remaining_loan": loan.remaining_balance
    }
   


# Report
# CHANGE 3
@router.get("/report/{customer_no}")
def customer_report(
    customer_no: int,
    db: Session = Depends(get_db)
):
    loans = (
        db.query(Loan)
        .filter(Loan.customer_no == customer_no)
        .all()
    )

    if not loans:
        raise HTTPException(
            status_code=404,
            detail="No records found"
        )

    report = []

    for item in loans:
        report.append({
            "loan_id": item.id,
            "milk_sale": item.milk_sale_amount,
            "deducted": item.deducted_amount,
            "remaining": item.remaining_balance,
            "final_payable": item.final_payable
        })

    return report

@router.get("/loan")
def get_loans(
    db: Session = Depends(get_db)):
    
    loans = db.query(Loan).all()

    return loans