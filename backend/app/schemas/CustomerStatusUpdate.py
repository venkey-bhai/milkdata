
from pydantic import BaseModel

class CustomerStatusUpdate(BaseModel):
    status: str
    is_active: bool