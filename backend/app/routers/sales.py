import dbm

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import extract
from sqlalchemy.orm import Session

from app.db.database import get_db
from db.models import SaleBill, SaleItem
from schemas.sales import SaleBillCreate

router = APIRouter(prefix="/sales", tags=["Sales"])


@router.post("/create-bill")
def create_bill(request: SaleBillCreate, db: Session = Depends(get_db)):
    if not request.items:
        raise HTTPException(status_code=400, detail="A bill must contain at least one item")

    total_amount = sum(item.quantity * item.rate for item in request.items)

    bill = SaleBill(
        customer_name=request.customer_name,
        bill_date=request.bill_date,
        rate_perliter=request.rate_perliter,
        total_amount=total_amount,
    )

    db.add(bill)
    db.flush()

    sale_items = []
    for item in request.items:
        sale_item = SaleItem(
            bill_id=bill.id,
            product_name=item.product_name,
            quantity=item.quantity,
            rate=item.rate,
            amount=item.quantity * item.rate,
        )
        sale_items.append(sale_item)

    db.add_all(sale_items)
    db.commit()
    db.refresh(bill)

    return {
        "success": True,
        "message": "Bill created successfully",
        "data": bill,
    }


# GET /sales/bills
@router.get("/bills")
def get_all_bills(
    db: Session = Depends(get_db)
):
    bills = db.query(SaleBill).all()

    return {
        "success": True,
        "count": len(bills),
        "data": bills,
    }


# GET /sales/bill/{bill_id}
@router.get("/bill/{bill_id}")
def get_bill(
    bill_id: int,
    db: Session = Depends(get_db)
):
    bill = (
        db.query(SaleBill)
        .filter(SaleBill.id == bill_id)
        .first()
    )

    if not bill:
        raise HTTPException(
            status_code=404,
            detail="Bill not found"
        )

    
    items = (
        db.query(SaleItem)
        .filter(SaleItem.bill_id == bill_id)
        .all()
    )
    
    return {
        "success": True,
        "data": {
            "id": bill.id,
            "customer_name": bill.customer_name,
            "bill_date": bill.bill_date,
            "rate_perliter": bill.rate_perliter,
            "total_amount": bill.total_amount,
            "items": [
                {
                    "product_name": i.product_name,
                    "quantity": i.quantity,
                    "rate": i.rate,
                    "amount": i.amount,
                }
                for i in items
            ]
        }
    }


# DELETE /sales/bill/{bill_id}
@router.delete("/bill/{bill_id}")
def delete_bill(
    bill_id: int,
    db: Session = Depends(get_db)
):
    bill = (
        db.query(SaleBill)
        .filter(SaleBill.id == bill_id)
        .first()
    )

    if not bill:
        raise HTTPException(
            status_code=404,
            detail="Bill not found"
        )

    # Delete child records first
    db.query(SaleItem).filter(
        SaleItem.bill_id == bill_id
    ).delete()

    # Delete parent bill
    db.delete(bill)

    db.commit()

    return {
        "success": True,
        "message": f"Bill {bill_id} deleted successfully"
    }
    
    
@router.get("/sales-report")
def sales_report(db: Session = Depends(get_db)):

    rows = (
        db.query(
            SaleBill.id,
            SaleBill.customer_name,
            SaleBill.bill_date,
            SaleItem.product_name,
            SaleItem.quantity,
            SaleItem.rate,
            SaleItem.amount,
        )
        .join(
            SaleItem,
            SaleBill.id == SaleItem.bill_id
        )
        .all()
    )

    result = []

    for row in rows:
        result.append({
            "id": row.id,
            "customer_name": row.customer_name,
            "bill_date": row.bill_date,
            "product_name": row.product_name,
            "quantity": row.quantity,
            "rate": row.rate,
            "amount": row.amount,
        })

    return {
        "success": True,
        "count": len(result),
        "data": result
    }
    
@router.get("/monthly-sales")
def monthly_sales_report(
    customer_name: str,
    month: int,
    year: int,
    db: Session = Depends(get_db),
):
    bills = (
        db.query(SaleBill)
        .filter(
            # SaleBill.customer_name == customer_name,
            extract("month", SaleBill.bill_date) == month,
            extract("year", SaleBill.bill_date) == year,
        )
        .all()
    )

    if not bills:
        return {
            "success": True,
            "message": "No records found",
            "data": [],
            "total_amount": 0,
        }

    total_amount = sum(bill.total_amount for bill in bills)

    report_data = []

    for bill in bills:
        report_data.append(
            {
                "bill_id": bill.id,
                "customer_name": bill.customer_name,
                "bill_date": bill.bill_date,
                "rate_perliter": bill.rate_perliter,
                "total_amount": bill.total_amount,
            }
        )

    return {
        "success": True,
        "month": month,
        "year": year,
        "customer_name": customer_name,
        "total_amount": total_amount,
        "count": len(report_data),
        "data": report_data,
    }

# @router.get("/sales/monthly-sales")
# def monthly_sales(month: int, year: int, customer_name: str = None):

#     query = get_db.query(SaleBill).filter(
#         extract('month', SaleBill.bill_date) == month,
#         extract('year', SaleBill.bill_date) == year
#     )

#     if customer_name:
#         query = query.filter(
#             SaleBill.customer_name.ilike(f"%{customer_name}%")
#         )

#     records = query.all()

#     total = sum(r.total_amount for r in records)

#     return {
#         "data": records,
#         "total_amount": total
#     }