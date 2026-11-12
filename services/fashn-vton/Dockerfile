FROM nvidia/cuda:12.4.1-cudnn-runtime-ubuntu22.04

ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    FASHN_WEIGHTS_DIR=/models/fashn-vton

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3.11 python3.11-venv python3-pip git libgl1 libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY upstream /opt/fashn-vton
COPY requirements.txt ./requirements.txt
RUN python3.11 -m pip install --upgrade pip \
    && python3.11 -m pip install -r requirements.txt \
    && python3.11 -m pip install -e /opt/fashn-vton

COPY app.py ./app.py
RUN mkdir -p /models/fashn-vton \
    && python3.11 /opt/fashn-vton/scripts/download_weights.py --weights-dir /models/fashn-vton

EXPOSE 8000
CMD ["python3.11", "-m", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
