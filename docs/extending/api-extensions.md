# API Extensions

PEDAL's API can be extended for custom automation and integration needs.

## Custom Endpoints
- Add new REST endpoints to PEDAL's FastAPI server
- Expose custom data or actions

## Middleware
- Add custom authentication, logging, or rate-limiting
- Integrate with external monitoring or analytics

## Example: Add Custom Metrics Endpoint
```python
from fastapi import APIRouter
router = APIRouter()

@router.get("/metrics")
def get_metrics():
    return {"workflows": 42, "success_rate": 0.98}
```

---

> Next: [Contributing to PEDAL](contributing.md) 