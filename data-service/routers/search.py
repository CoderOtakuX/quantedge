from fastapi import APIRouter
from stock_universe import search_stocks

router = APIRouter()

@router.get("/search")
def search(q: str = ""):
    if len(q) < 1:
        return []
    return search_stocks(q)
