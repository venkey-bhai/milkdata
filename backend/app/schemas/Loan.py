from pydantic import BaseModel

class LoanCreate(BaseModel): 
    customer_no: int 
    total_loan: float 
    
class LoanDeduction(BaseModel): 
    milk_sale_amount: float 
    deduct_amount: float