from fastapi import APIRouter, Depends, HTTPException

from fastapi import APIRouter, Depends, Query

from fastapi.responses import StreamingResponse, FileResponse

from sqlalchemy import extract, func
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Customer, MilkEntry

from datetime import date

import csv
import io
import pandas as pd

from reportlab.pdfgen import canvas

router = APIRouter(tags=["Reports"])


# ==================================================
# REPORTS API (NO AUTH)
# ==================================================

@router.get("/reports")
def get_reports(
    report_date: date = Query(None),
    db: Session = Depends(get_db)
):

    query = db.query(MilkEntry)

    # FILTER BY DATE
    if report_date:
        query = query.filter(MilkEntry.date == report_date)

    milk_entries = query.all()

    # CUSTOMER IDS
    customer_ids = list(set([e.customer_id for e in milk_entries]))

    # FETCH CUSTOMERS
    customers = db.query(Customer).filter(
        Customer.id.in_(customer_ids)
    ).all()

    customer_map = {c.id: c for c in customers}

    reports = []

    for entry in milk_entries:

        customer = customer_map.get(entry.customer_id)

        reports.append({
            "id": entry.id, 
            "customer_no": customer.customer_no if customer else None,
            "customer_name": customer.name if customer else "Unknown",
            "customer_phone": customer.phone if customer else "",
            "session": entry.session,
            "date": str(entry.date),
            "total_liters": entry.liters,
            "milk_type":entry.customer.milk_type,
            "rate": entry.rate,
            "total_amount": entry.total
        })

    return {
        "success": True,
        "data": reports
    }



@router.delete("/reports/{id}")
def delete_report(id: int, db: Session = Depends(get_db)):

    entry = db.query(MilkEntry).filter(MilkEntry.id == id).first()

    if not entry:
        raise HTTPException(status_code=404, detail="Report not found")

    db.delete(entry)
    db.commit()

    return {"message": "Report deleted successfully"}


@router.get("/monthly-buying")
def monthly_buying_report(
    month: int,
    year: int,
    db: Session = Depends(get_db)
):
    results = (
        db.query(
            Customer.customer_no,
            Customer.name,
            Customer.milk_type,
            func.sum(MilkEntry.liters).label("total_liters"),
            func.sum(MilkEntry.total).label("total_amount"),
        )
        .join(Customer, MilkEntry.customer_id == Customer.id)
        .filter(
            extract("month", MilkEntry.date) == month,
            extract("year", MilkEntry.date) == year,
        )
        .group_by(
            Customer.customer_no,
            Customer.name,
            Customer.milk_type,
        )
        .all()
    )

    report = []

    grand_liters = 0
    grand_amount = 0

    for row in results:
        report.append({
            "customer_no": row.customer_no,
            "customer_name": row.name,
            "milk_type": row.milk_type,
            "total_liters": float(row.total_liters or 0),
            "total_amount": float(row.total_amount or 0),
        })

        grand_liters += float(row.total_liters or 0)
        grand_amount += float(row.total_amount or 0)

    return {
        "success": True,
        "month": month,
        "year": year,
        "grand_total_liters": grand_liters,
        "grand_total_amount": grand_amount,
        "data": report,
    }


# ==================================================
# CSV EXPORT (NO AUTH)
# ==================================================

@router.get("/reports/csv")
def download_csv(db: Session = Depends(get_db)):

    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow([
        "Customer",
        "Date",
        "Session",
        "Liters",
        "Rate",
        "Total"
    ])

    entries = db.query(MilkEntry).all()

    for entry in entries:

        customer = db.query(Customer).filter(
            Customer.id == entry.customer_id
        ).first()

        writer.writerow([
            customer.name if customer else "Unknown",
            entry.date,
            entry.session,
            entry.liters,
            entry.rate,
            entry.total
        ])

    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=milk_report.csv"
        }
    )


# ==================================================
# EXCEL EXPORT (NO AUTH)
# ==================================================

@router.get("/reports/excel")
def download_excel(db: Session = Depends(get_db)):

    entries = db.query(MilkEntry).all()

    data = []

    for entry in entries:

        customer = db.query(Customer).filter(
            Customer.id == entry.customer_id
        ).first()

        data.append({
            "Customer": customer.name if customer else "Unknown",
            "Date": entry.date,
            "Session": entry.session,
            "Liters": entry.liters,
            "Rate": entry.rate,
            "Total": entry.total
        })

    df = pd.DataFrame(data)

    file_path = "milk_report.xlsx"

    df.to_excel(file_path, index=False)

    return FileResponse(
        path=file_path,
        filename="milk_report.xlsx",
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )


# ==================================================
# PDF EXPORT (NO AUTH)
# ==================================================

@router.get("/reports/pdf")
def download_pdf(db: Session = Depends(get_db)):

    file_path = "milk_report.pdf"

    c = canvas.Canvas(file_path)

    y = 800
    c.drawString(220, y, "Milk Report")
    y -= 40

    entries = db.query(MilkEntry).all()

    for entry in entries:

        customer = db.query(Customer).filter(
            Customer.id == entry.customer_id
        ).first()

        line = (
            f"{customer.name if customer else 'Unknown'} | "
            f"{entry.date} | "
            f"{entry.session} | "
            f"{entry.liters}L | "
            f"₹{entry.total}"
        )

        c.drawString(40, y, line)
        y -= 20

    c.save()

    return FileResponse(
        file_path,
        filename="milk_report.pdf",
        media_type="application/pdf"
    )