import { Area } from "react-easy-crop";

export const getCroppedImg = async (imageSrc: string, crop: Area) => {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve) => (image.onload = resolve));

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return null;
  }

  canvas.width = crop.width;
  canvas.height = crop.height;

  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height
  );

  return new Promise<string>((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        const fileReader = new FileReader();
        fileReader.readAsDataURL(blob);
        fileReader.onloadend = () => {
          resolve(fileReader.result as string);
        };
      }
    }, "image/jpeg");
  });
};
