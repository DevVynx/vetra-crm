import { PROFILE_PHOTO_SIZE_PX } from "@vetra/contracts";

// Crops the center square and shrinks it, as WebP: the file that is kept is small whatever the
// photo the user picked. A browser that can't write WebP hands back another type, so it is refused.
export async function toProfilePhoto(file: File): Promise<Blob> {
  const image = await createImageBitmap(file);

  try {
    const side = Math.min(image.width, image.height);
    const canvas = document.createElement("canvas");
    canvas.width = PROFILE_PHOTO_SIZE_PX;
    canvas.height = PROFILE_PHOTO_SIZE_PX;

    const context = canvas.getContext("2d");
    if (!context) throw new Error("The canvas is not available.");
    context.drawImage(
      image,
      (image.width - side) / 2,
      (image.height - side) / 2,
      side,
      side,
      0,
      0,
      PROFILE_PHOTO_SIZE_PX,
      PROFILE_PHOTO_SIZE_PX
    );

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.85)
    );
    if (blob?.type !== "image/webp") throw new Error("The browser can't write WebP.");

    return blob;
  } finally {
    image.close();
  }
}
