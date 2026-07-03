from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, SessionLocal, Base
from app.api.routes import auth, transactions, categories, summary
from app.crud.category import seed_defaults

import app.models.user         # noqa: F401
import app.models.category     # noqa: F401
import app.models.transaction  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        Base.metadata.create_all(bind=engine)
        print("[OK] Database tables created / verified")
    except Exception as e:
        print(f"[FAIL] create_all failed: {e}")
        print("  Check that PostgreSQL is running and expense_tracker database exists.")

    try:
        db = SessionLocal()
        seed_defaults(db)
        db.close()
        print("[OK] Default categories seeded")
    except Exception as e:
        print(f"[WARN] seed_defaults: {e}")

    yield


app = FastAPI(
    title="Personal Expense Tracker API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORSMiddleware must be added before any router so it wraps all responses,
# including FastAPI's built-in HTTP-exception responses.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(transactions.router, prefix="/api/v1")
app.include_router(categories.router, prefix="/api/v1")
app.include_router(summary.router, prefix="/api/v1")


@app.get("/health", tags=["health"])
def health():
    return {"status": "ok"}
