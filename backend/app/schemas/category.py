from pydantic import BaseModel
from app.models.category import CategoryType


class CategoryCreate(BaseModel):
    name: str
    type: CategoryType


class CategoryOut(BaseModel):
    id: int
    name: str
    type: CategoryType
    is_default: bool
    user_id: int | None = None

    model_config = {"from_attributes": True}
