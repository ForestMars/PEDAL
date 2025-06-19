# Advanced Setup

For production and enterprise deployments, PEDAL supports advanced configuration.

## Proxy Configuration
- Deploy behind a reverse proxy (e.g., nginx, Traefik)
- Example nginx config:
```nginx
location / {
    proxy_pass http://localhost:8000;
}
```

## SSL/TLS
- Use Certbot for Let's Encrypt certificates
- Or configure self-signed certificates for internal use

## Clustering
- Run multiple FastAPI instances behind a load balancer (e.g., HAProxy)
- Scale database (PostgreSQL) as needed

## Verification
- CLI: `pedal --version`, `pedal health`
- API: `curl http://localhost:8000/health`
- Web: Open [http://localhost:8000](http://localhost:8000)
- Logs: Check `pedal.log` or stdout

---

> For troubleshooting, see [Troubleshooting](troubleshooting.md). 