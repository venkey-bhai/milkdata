from urllib import request

from fastapi import APIRouter, Depends, HTTPException, Form
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import User
from app.core.deps import get_current_admin #new one
from app.schemas.AdminRequest import AdminRequest
from app.schemas.user import UserCreate, UserResponse

from app.core.security import (
    hash_password,
    verify_password,
    create_access_token
)

router = APIRouter(tags=["Admin"])


# ================= COMMON ADMIN CHECK =================
def verify_admin(
    username: str,
    password: str,
    db: Session
):
    admin = db.query(User).filter(
        User.username == username
    ).first()

    if not admin:
        raise HTTPException(
            status_code=401,
            detail="Admin not found"
        )

    if admin.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only admin can access"
        )

    if not verify_password(password, admin.password):
        raise HTTPException(
            status_code=401,
            detail="Invalid password"
        )

    return admin


# ================= USER LOGIN =================
@router.post("/login")
def login(
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.username == username
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid username"
        )

    if not verify_password(password, user.password):
        raise HTTPException(
            status_code=401,
            detail="Invalid password"
        )

    token = create_access_token({
        "id": user.id,
        "username": user.username,
        "role": user.role
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "username": user.username,
        "role": user.role
    }


# ================= GET ALL USERS =================
@router.get("/admin/users", response_model=list[UserResponse])
def get_users(
    # payload: AdminRequest,
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):

    users = db.query(User).all()

    return [
        {
            "id": user.id,
            "username": user.username,
            "role": user.role
        }
        for user in users
    ]


# ================= CREATE USER =================
@router.post("/admin/create-user")
def create_user(
    user: UserCreate,
    admin_username: str,
    admin_password: str,
    db: Session = Depends(get_db)
):

    # VERIFY ADMIN
    verify_admin(
        admin_username,
        admin_password,
        db
    )

    # CHECK EXISTING USER
    existing_user = db.query(User).filter(
        User.username == user.username
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )

    # LIMIT ADMINS
    if user.role == "admin":

        admin_count = db.query(User).filter(
            User.role == "admin"
        ).count()

        if admin_count >= 2:
            raise HTTPException(
                status_code=400,
                detail="Only 2 admin accounts allowed"
            )

    # CREATE USER
    try:

        new_user = User(
            username=user.username,
            password=hash_password(user.password),
            role=user.role
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        return {
            "message": "User created successfully"
        }

    except Exception as e:

        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))



# ================= DELETE USER =================
@router.delete("/admin/delete-user/{user_id}")
def delete_user(
    user_id: int,
    admin_username: str,
    admin_password: str,
    db: Session = Depends(get_db)
):

    # VERIFY ADMIN
    admin = verify_admin(
        admin_username,
        admin_password,
        db
    )

    # FIND USER
    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # PREVENT SELF DELETE
    if user.id == admin.id:
        raise HTTPException(
            status_code=400,
            detail="Admin cannot delete self"
        )

    # DELETE USER
    db.delete(user)
    db.commit()

    return {
        "message": "User deleted successfully",
        "deleted_user_id": user_id
    }


# ================= LOGOUT =================
@router.post("/admin/logout")
def logout():

    return {
        "message": "admin Logged out successfully"
    }