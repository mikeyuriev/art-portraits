import Swiper from "swiper";
import { Navigation } from "swiper/modules";
import "swiper/scss";

new Swiper(".gallery__swiper", {
    modules: [Navigation],
    slidesPerView: 1,
    navigation: {
        nextEl: ".gallery__button--next",
        prevEl: ".gallery__button--prev",
    },
});