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

Health check:

```bash
curl http://localhost:8000/health
```

The API accepts `person_image`, `garment_image`, and `category` (`tops`,
`bottoms`, or `one-pieces`). Set the Vercel variable
`FASHN_VTON_API_URL` to the public HTTPS URL of this service after deploying it
on a GPU host. Vercel itself cannot run the model because it has no CUDA GPU
and serverless execution is not suitable for loading the weights.
