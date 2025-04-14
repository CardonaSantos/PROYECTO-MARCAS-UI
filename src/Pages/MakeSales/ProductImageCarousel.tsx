import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import placeholder from "@/assets/images/placeholder.jpg";

interface ProductImageCarouselProps {
  images: { url: string }[];
  productName: string;
}

export default function ProductImageCarousel({
  images,
  productName,
}: ProductImageCarouselProps) {
  return (
    <div className="relative w-full">
      <Carousel className="w-full">
        <CarouselContent>
          {images.length > 0 ? (
            images.map((image, index) => (
              <CarouselItem key={index}>
                <div className="p-1">
                  <Card>
                    <CardContent className="flex aspect-square items-center justify-center p-4">
                      <img
                        src={image.url ? image.url : placeholder}
                        alt={`${productName} - Imagen ${index + 1}`}
                        className="object-cover w-full h-full rounded-md"
                      />
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))
          ) : (
            <CarouselItem>
              <div className="p-1">
                <Card>
                  <CardContent className="flex aspect-square items-center justify-center p-4">
                    <img
                      src={placeholder}
                      alt="Imagen no disponible"
                      className="object-cover w-full h-full rounded-md"
                    />
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          )}
        </CarouselContent>
        <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 scale-75 z-10 bg-white/70 shadow-md" />
        <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 scale-75 z-10 bg-white/70 shadow-md" />
      </Carousel>
    </div>
  );
}
