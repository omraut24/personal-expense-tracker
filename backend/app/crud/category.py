from sqlalchemy.orm import Session
from app.models.category import Category, CategoryType
from app.schemas.category import CategoryCreate

DEFAULT_CATEGORIES = [
    ("Food", CategoryType.expense),
    ("Shopping", CategoryType.expense),
    ("Travel", CategoryType.expense),
    ("Entertainment", CategoryType.expense),
    ("Bills", CategoryType.expense),
    ("Rent", CategoryType.expense),
    ("Healthcare", CategoryType.expense),
    ("Education", CategoryType.expense),
    ("Salary", CategoryType.income),
    ("Investment", CategoryType.income),
]


def seed_defaults(db: Session) -> None:
    existing = db.query(Category).filter(Category.is_default == True).count()
    if existing == 0:
        for name, cat_type in DEFAULT_CATEGORIES:
            db.add(Category(name=name, type=cat_type, is_default=True, user_id=None))
        db.commit()


def list_for_user(db: Session, user_id: int) -> list[Category]:
    return (
        db.query(Category)
        .filter((Category.is_default == True) | (Category.user_id == user_id))
        .all()
    )


def create_for_user(db: Session, user_id: int, payload: CategoryCreate) -> Category:
    cat = Category(name=payload.name, type=payload.type, is_default=False, user_id=user_id)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat
