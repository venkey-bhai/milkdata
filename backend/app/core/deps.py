from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer

from jose import jwt, JWTError

from app.core.security import (
    SECRET_KEY,
    ALGORITHM
)

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/login"
)

# ================= GET CURRENT USER =================
def get_current_user(
    token: str = Depends(oauth2_scheme)
):

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        return payload

    except JWTError:

        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

# ================= ADMIN ONLY =================
def get_current_admin(
    current_user: dict = Depends(get_current_user)
):

    if current_user.get("role") != "admin":

        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    return current_user

# ================= MILK ENTRY ONLY =================
def get_milk_entry_user(
    current_user: dict = Depends(get_current_user)
):

    allowed_roles = [ "admin", "user"]

    if current_user.get("role") not in allowed_roles:

        raise HTTPException(
            status_code=403,
            detail="Milk entry access required"
        )

    return current_user