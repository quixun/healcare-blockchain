import { useRef } from "react";
import Slider from "react-slick";

const slides = [
  "/images/medicines/general-1.webp",
  "/images/medicines/general-2.webp",
  "/images/medicines/general-3.webp",
  "/images/medicines/general-4.webp",
  "/images/medicines/general-5.webp",
];

const settings = {
  infinite: true,
  slidesToScroll: 1,
  arrows: false,
  dots: false,
  draggable: true,
  swipeToSlide: true,
  speed: 1700,
  slidesToShow: 4,
  autoplay: true,
  autoplaySpeed: 0,
  cssEase: "linear",
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 3,
      },
    },
    {
      breakpoint: 768,
      settings: {
        slidesToShow: 1,
      },
    },
  ],
};

export default function GeneralSection() {
  const sliderRef = useRef<Slider>(null);

  return (
    <div className="w-full my-20 px-10">
      <Slider ref={sliderRef} {...settings}>
        {slides.map((src, i) => (
          <div key={i} className="px-4">
            <div className="h-80 overflow-hidden rounded-lg">
              <img
                src={src}
                alt={`medicine-${i}`}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
}
