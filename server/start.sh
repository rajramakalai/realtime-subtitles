#!/usr/bin/env bash
set -e

# bind to all interfaces so Docker’s -p 8765:8765 works
HOST=0.0.0.0
PORT=8765

# invoke the built server with 3s chunks, 2s overlap
./build/bin/whisper-server \
  --host   "$HOST" \
  --port   "$PORT" \
  -m       models/ggml-base.en.bin \
  -d       3000 \
  --offset-t 2000 \
  -mc      0 \
  -ml      1 \
  -wt      0.01 \
  -et      2.4 \
  -lpt     -1 \
  --no-timestamps \
  --print-realtime
