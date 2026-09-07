from pydantic import BaseModel, ConfigDict


class SummaryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    overview_text: str
