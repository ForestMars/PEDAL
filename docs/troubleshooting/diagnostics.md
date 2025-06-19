# Advanced Diagnostics

Use advanced tools to trace and profile PEDAL for deep troubleshooting.

## Tracing
- Integrate with OpenTelemetry for distributed tracing (roadmap)
- Trace workflow execution across services

## Profiling
- Use Python cProfile to analyze performance
- Add FastAPI middleware for request profiling

## Example: FastAPI Profiling Middleware
```python
from fastapi_profiler import ProfilerMiddleware
app.add_middleware(ProfilerMiddleware)
```

---

> For getting help, see [Getting Help](getting-help.md) 