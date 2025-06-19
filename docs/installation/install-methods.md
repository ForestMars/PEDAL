# Installation Methods

PEDAL supports multiple installation methods to fit your environment and workflow.

## 1. Pip (Recommended for Python users)
```bash
pip install pedal
```

## 2. Docker
```bash
docker run -p 8000:8000 -e PEDAL_API_KEY=<key> forestmars/pedal
```

## 3. Kubernetes (Enterprise/Cloud)
- Use a Helm chart or Kubernetes manifest (coming soon)
- Example (speculative):
```bash
helm install pedal ./charts/pedal
```

## 4. From Source
```bash
git clone https://github.com/ForestMars/PEDAL.git
cd PEDAL
python setup.py install
```

## 5. Enterprise Setup Notes
- For production, consider using Docker or Kubernetes for scalability and isolation.
- Configure environment variables and secrets securely.

---

> For system requirements, see [System Requirements](requirements.md). 