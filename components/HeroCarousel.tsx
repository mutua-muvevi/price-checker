"use client"
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from "react-responsive-carousel";
import Image from "next/image";

const heroImages = [
	{
		imgUrl: "/assets/images/hero-1.svg",
		alt: "Smart Watch",
	},
	{
		imgUrl: "/assets/images/hero-2.svg",
		alt: "Bag",
	},
	{
		imgUrl: "/assets/images/hero-3.svg",
		alt: "Lamp",
	},
	{
		imgUrl: "/assets/images/hero-4.svg",
		alt: "AirFrier",
	},
	{
		imgUrl: "/assets/images/hero-5.svg",
		alt: "Chart",
	},
];

const HeroCarousel = () => {
	return (
		<div className="hero-carousel">
			<Carousel
				showThumbs={false}
				infiniteLoop
				autoPlay
				showStatus={false}
				showIndicators={false}
				showArrows={false}
				interval={2000}
			>
				{heroImages.map((image) => (
					<Image
						src={image.imgUrl}
						alt={image.alt}
						width={484}
						height={484}
						key={image.alt}
						className="object-contain"
					/>
				))}
			</Carousel>

			<Image
				src="/assets/icons/hand-drawn-arrow.svg"
				alt="hand-drawn-arrow"
				width={175}
				height={175}
				className="max-xl:hidden absolute -left-[15%] bottom-0 z-0"
			/>
		</div>
	);
};

export default HeroCarousel;
