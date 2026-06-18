from pydantic import BaseModel

class AdminRequest(BaseModel):
    username: str
    password: str