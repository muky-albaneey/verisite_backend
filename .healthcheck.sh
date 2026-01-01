#!/bin/bash
# Health check script for Render
curl -f http://localhost:${PORT:-10000}/api/v1/health || exit 1

