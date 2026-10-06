# Runbook

## Prerequisites
- Docker and `docker compose` installed
- All environment variables set per `.env.example`
- `make setup` completed successfully

## Start
```bash
make dev
```
Starts the full local stack. Verify health with:
```bash
curl http://localhost:<PORT>/health
```

## Health check
```bash
make test        # unit tests
make e2e         # end-to-end tests against local stack
```

## Reset state
```bash
make clean       # tear down containers and remove local state
make dev         # restart fresh
```

## Stop
```bash
docker compose down
```

## Clean up
```bash
make clean       # removes containers, volumes, and local state
```

## Recover from failures
1. Check container logs: `docker compose logs <service>`
2. Check for port conflicts: `lsof -i :<PORT>` or `netstat -tlnp | grep <PORT>`
3. If state is corrupted: `make clean && make dev`

## Troubleshoot
| Symptom | Likely cause | Fix |
|---|---|---|
| Service won't start | Port conflict | Change port in `.env` |
| Tests timeout | Stack not ready | Wait for health check to pass |
| Model errors | API key missing | Set `MODEL_API_KEY` or use `MODEL_MODE=mock` |

## Notes
- These are specification targets. `make` targets do not exist until the bootstrap package implements them.
- Do not report runtime tests as passing until they actually run successfully.
