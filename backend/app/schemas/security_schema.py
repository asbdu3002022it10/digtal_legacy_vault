from typing import Optional
from pydantic import BaseModel, EmailStr

class SecurityQuestions(BaseModel):
    q1: str
    a1: str
    q2: str
    a2: str
    q3: str
    a3: str

class SecurityQuestionsSetup(BaseModel):
    email: EmailStr
    otp: str  # Use OTP as proof to set questions
    questions: SecurityQuestions

class SecurityQuestionsVerify(BaseModel):
    email: EmailStr
    otp: str # Use OTP as proof to verify
    answers: list[str] # Or just the answers in order

class SecurityQuestionsRead(BaseModel):
    q1: str
    q2: str
    q3: str
