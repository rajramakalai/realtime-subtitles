# CUDA 12.1 build image
FROM nvcr.io/nvidia/cuda:12.1.0-devel-ubuntu22.04

# Install build tools and dependencies
RUN set -ex && \
    apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential \
        cmake \
        git \
        curl \
        ffmpeg \
        libopenblas-dev \
        python3-pip && \
    rm -rf /var/lib/apt/lists/*

# Clone whisper.cpp and build the server with CUDA support
RUN git clone --depth 1 https://github.com/ggerganov/whisper.cpp /whisper.cpp

WORKDIR /whisper.cpp

RUN cmake -B build \
          -DWHISPER_SERVER=ON \
          -DGGML_CUDA=1 \
          -DCMAKE_BUILD_TYPE=Release \
          -DCMAKE_EXE_LINKER_FLAGS="-Wl,--allow-shlib-undefined" && \
    cmake --build build --target whisper-server -j"$(nproc)" && \
    ./models/download-ggml-model.sh base.en

# Python dependencies
RUN pip3 install --no-cache-dir websockets

# After the build, set WORKDIR and copy in the launcher
WORKDIR /whisper.cpp
COPY start.sh /whisper.cpp/start.sh
RUN chmod +x /whisper.cpp/start.sh

EXPOSE 8765
CMD ["./start.sh"]
