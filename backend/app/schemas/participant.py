from pydantic import BaseModel, ConfigDict


class ParticipantRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str | None = None
    avatar_color: str


class ParticipantCreate(BaseModel):
    name: str
    email: str | None = None
    avatar_color: str = "#6D5EF8"
