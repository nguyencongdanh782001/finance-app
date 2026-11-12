"""Private FASHN VTON API used by the Next.js virtual try-on route."""

import io
import os
from functools import lru_cache
from typing import Literal

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from fashn_vton import TryOnPipeline
from PIL import Image, UnidentifiedImageError

app = FastAPI(title="Quynh Nhi Store FASHN VTON", version="1.0.0")
MAX_IMAGE_BYTES = 8 * 1024 * 1024
WEIGHTS_DIR = os.getenv("FASHN_WEIGHTS_DIR", "/models/fashn-vton")


@lru_cache(maxsize=1)
def get_pipeline() -> TryOnPipeline:
    return TryOnPipeline(
        weights_dir=WEIGHTS_DIR,
        device=os.getenv("FASHN_DEVICE") or None,
    )


async def read_image(upload: UploadFile, label: str) -> Image.Image:
    data = await upload.read(MAX_IMAGE_BYTES + 1)
    if len(data) > MAX_IMAGE_BYTES:
        raise HTTPException(413, f"{label} must be no larger than 8MB")
    try:
        return Image.open(io.BytesIO(data)).convert("RGB")
    except (UnidentifiedImageError, OSError) as error:
        raise HTTPException(422, f"Invalid {label} image") from error


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "provider": "fashn-vton-1.5"}


@app.post("/try-on")
async def try_on(
    person_image: UploadFile = File(...),
    garment_image: UploadFile = File(...),
    category: Literal["tops", "bottoms", "one-pieces"] = Form(...),
    garment_photo_type: Literal["model", "flat-lay"] = Form("flat-lay"),
    num_timesteps: int = Form(30),
    guidance_scale: float = Form(1.5),
    seed: int = Form(42),
    segmentation_free: bool = Form(True),
) -> StreamingResponse:
    if not 10 <= num_timesteps <= 50:
        raise HTTPException(422, "num_timesteps must be between 10 and 50")
    if not 1 <= guidance_scale <= 3:
        raise HTTPException(422, "guidance_scale must be between 1 and 3")

    person = await read_image(person_image, "person")
    garment = await read_image(garment_image, "garment")
    result = get_pipeline()(
        person_image=person,
        garment_image=garment,
        category=category,
        garment_photo_type=garment_photo_type,
        num_timesteps=num_timesteps,
        guidance_scale=guidance_scale,
        seed=seed,
        segmentation_free=segmentation_free,
        num_samples=1,
    )
    output = io.BytesIO()
    result.images[0].save(output, format="PNG")
    output.seek(0)
    return StreamingResponse(output, media_type="image/png")
