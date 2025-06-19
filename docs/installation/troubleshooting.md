# Troubleshooting

If you encounter issues during installation or setup, try the following solutions.

## Common Issues
- **Dependency conflicts:** Ensure all required Python packages are installed and up to date.
- **Port 8000 in use:** Stop any process using the port or change PEDAL's port in config.
- **GitHub authentication failures:** Check `GITHUB_TOKEN` and permissions.
- **Database connection errors:** Verify `DATABASE_URL` and database status.

## Debug Mode
- Run with `--debug` flag for verbose output:
```bash
pedal --debug
```
- Check logs for detailed error messages.

## Support Channels
- [GitHub Issues](https://github.com/ForestMars/PEDAL/issues)
- Submit logs and error details for faster help.

---

> For system requirements, see [System Requirements](requirements.md). 