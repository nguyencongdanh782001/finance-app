# Private FASHN VTON service

This folder contains the official FASHN VTON v1.5 source and a small FastAPI
wrapper for a GPU host. The model weights are intentionally not committed.

## Run with Docker

The image requires an NVIDIA GPU and downloads approximately 2GB of model
weights while building:

```bash
docker build -t quynhnhistore-fashn-vton services/fashn-vton
docker run --gpus all -p 8000:8000 quynhnhistore-fashn-vton
```

## Run on a CPU-only VPS

For a CPU VPS, use the CPU image instead. It is much slower and should have at
least 8GB RAM (16GB is safer):

```bash
docker build -f services/fashn-vton/Dockerfile.cpu \
  -t quynhnhistore-fashn-vton-cpu services/fashn-vton
docker run -p 8000:8000 quynhnhistore-fashn-vton-cpu
```

One request can take several minutes on CPU. The current website request has a
finite timeout, so CPU mode is suitable for testing first; production should
use a background job or a GPU host if requests regularly exceed five minutes.

Health check:

```bash
curl http://localhost:8000/health
```

The API accepts `person_image`, `garment_image`, and `category` (`tops`,
`bottoms`, or `one-pieces`). Set the Vercel variable
`FASHN_VTON_API_URL` to the public HTTPS URL of this service after deploying it
on a GPU host. Vercel itself cannot run the model because it has no CUDA GPU
and serverless execution is not suitable for loading the weights.
