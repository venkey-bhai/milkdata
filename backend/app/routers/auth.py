from fastapi import APIRouter, Depends, Form, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import User

from app.schemas.user import UserCreate, UserLogin
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token
)
router = APIRouter(tags=["Admin Auth"])

# router = APIRouter(prefix="/auth", tags=["Auth"])

# ================= ADMIN REGISTER =================

@router.post("/admin/register")
def admin_register(
    user: UserCreate,
    db: Session = Depends(get_db)
):

    # Check existing username
    existing_user = db.query(User).filter(
        User.username == user.username
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )

    # Allow only admin role
    if user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only admin registration allowed"
        )

    # Optional: limit admin accounts
    admin_count = db.query(User).filter(
        User.role == "admin"
    ).count()

    if admin_count >= 2:
        raise HTTPException(
            status_code=400,
            detail="Only 2 admins allowed"
        )

    # Create admin
    new_admin = User(
        username=user.username,
        password=hash_password(user.password),
        role="admin"
    )

    db.add(new_admin)
    db.commit()

    return {
        "message": "Admin registered successfully"
    }


# ================= ADMIN LOGIN =================

@router.post("/admin/login")
# def admin_login(
#     user: UserLogin,
#     db: Session = Depends(get_db)
# ):
def admin_login(
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):

    admin = db.query(User).filter(
        User.username == username
    ).first()

   
    if not admin:
        raise HTTPException(
            status_code=401,
            detail="Invalid username"
        )

    print(admin.username)
    print(admin.role)
    
    if admin.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    if not verify_password(
        password,
        admin.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid password"
        )

    token = create_access_token({
        "id": admin.id,
        "username": admin.username,
        "role": admin.role
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": admin.role
    }
    
    # ================= ADMIN LOGOUT =================
    
@router.post("/logout")
def logout():
    return {"message": "Logged out successfully"}