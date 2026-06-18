from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.deps import get_current_user
from app.db.database import Base, engine
from app.routers import auth, customer, loan, milk_entry, report, admin, sales,loan
from app.schemas import Loan

app = FastAPI(title="Milk Buyer Management System")

# Create tables (optional)
Base.metadata.create_all(bind=engine)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(customer.router)
app.include_router(milk_entry.router)
app.include_router(report.router )
app.include_router(admin.router)
app.include_router(sales.router)
app.include_router(loan.router)



@app.get("/")
def root():
    return {"message": "API is running"}