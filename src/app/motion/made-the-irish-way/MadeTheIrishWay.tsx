"use client";

import { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { Archivo, Fraunces } from "next/font/google";
import photo from "./assets/image-414.png";
import maskShape from "./assets/mask-413.svg";
import sliderArrow from "./assets/slider-arrow.svg";

// Free stand-ins for Gelica and Test Founders Grotesk, which are licensed.
const serif = Fraunces({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-serif" });
const grotesk = Archivo({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-grotesk" });

// The Figma frame is 1440x810. Everything inside is laid out at that size and scaled to cover.
const STAGE_W = 1440;
const STAGE_H = 810;

// One timeline drives all four animated nodes (8.303s, looping).
const DURATION = 8.303;
const TIMES = [0, 0.1506, 0.5119, 1];
const EASE = [[0.5, 0, 0.5, 1], [0.65, 0, 0.35, 1], "linear"] as const;
const SLIDE = 1141.968;
const MASK_SCALE = 20.5;

// The photo layer is 1512x840 at (-36, -30) in the stage. The mask starts as a 117.125x62.208 shape
// centred on stage point (720, 370), which is (756, 400) inside the layer.
const MASK_W = 117.125;
const MASK_H = 62.208;
const MASK_CX = 756;
const MASK_CY = 400;

export default function MadeTheIrishWay() {
  const reduceMotion = useReducedMotion();
  const frame = useRef<HTMLDivElement>(null);
  // null until measured: the server can't know the viewport, so the stage stays hidden to avoid a size jump.
  const [fit, setFit] = useState<number | null>(null);

  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const update = () => setFit(Math.max(el.clientWidth / STAGE_W, el.clientHeight / STAGE_H));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Scaling a CSS mask can't be done with transform, so the mask size and position are animated instead.
  const maskScale = useMotionValue(1);
  const maskSize = useTransform(maskScale, (s) => `${MASK_W * s}px ${MASK_H * s}px`);
  const maskPosition = useTransform(
    maskScale,
    (s) => `${MASK_CX - (MASK_W * s) / 2}px ${MASK_CY - (MASK_H * s) / 2}px`,
  );

  useEffect(() => {
    if (reduceMotion) {
      maskScale.set(MASK_SCALE);
      return;
    }
    const controls = animate(maskScale, [1, 1, MASK_SCALE, MASK_SCALE], {
      duration: DURATION,
      times: TIMES,
      ease: [...EASE],
      repeat: Infinity,
    });
    return () => controls.stop();
  }, [maskScale, reduceMotion]);

  const loop = (keyframes: number[], times: number[], ease: unknown[]) =>
    reduceMotion
      ? { animate: { x: keyframes[keyframes.length - 1] } }
      : {
          animate: { x: keyframes },
          transition: { duration: DURATION, times, ease, repeat: Infinity },
        };

  const slideLeft = loop([0, 0, -SLIDE, -SLIDE], TIMES, [...EASE]);
  const slideRight = loop([0, 0, SLIDE, SLIDE], TIMES, [...EASE]);

  const headline =
    "absolute top-[calc(50%-65.5px)] m-0 w-[568px] whitespace-nowrap font-(family-name:--font-serif) text-[75px] leading-none text-[#006e42]";

  return (
    <div
      ref={frame}
      className={`${serif.variable} ${grotesk.variable} relative h-dvh w-screen overflow-hidden bg-[#fff9a7]`}
    >
      <div
        className="absolute top-1/2 left-1/2 h-[810px] w-[1440px]"
        style={{ transform: `translate(-50%, -50%) scale(${fit ?? 1})`, visibility: fit === null ? "hidden" : "visible" }}
      >
        <motion.p className={`${headline} right-[calc(50%+77.83px)] text-right`} initial={{ x: 0 }} {...(slideLeft as object)}>
          Made the
        </motion.p>
        <motion.p className={`${headline} left-[calc(50%+77.84px)] italic`} initial={{ x: 0 }} {...(slideRight as object)}>
          Irish way
        </motion.p>

        <motion.div
          className="absolute -top-[30px] -left-9 h-[840px] w-[1512px] mask-alpha mask-no-repeat"
          aria-hidden="true"
          style={{
            maskImage: `url("${maskShape.src}")`,
            WebkitMaskImage: `url("${maskShape.src}")`,
            maskSize,
            WebkitMaskSize: maskSize,
            maskPosition,
            WebkitMaskPosition: maskPosition,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo.src} alt="" className="pointer-events-none absolute inset-0 size-full object-cover" />
        </motion.div>

        <motion.div
          className="absolute top-0 left-0 h-[810px] w-[1440px] bg-[rgba(45,43,35,0.4)]"
          initial={{ opacity: reduceMotion ? 1 : 0 }}
          animate={reduceMotion ? { opacity: 1 } : { opacity: [0, 0, 1, 1] }}
          transition={{
            duration: DURATION,
            times: [0, 0.3922, 0.4457, 1],
            ease: [[0.5, 0, 0.5, 1], [0.5, 0, 0.5, 1], "easeOut"],
            repeat: Infinity,
          }}
        >
          <div className="absolute top-[calc(50%+16.78px)] left-1/2 flex w-[651px] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-[33px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={sliderArrow.src} alt="" width={67} height={66} />
            <h1 className="m-0 w-full text-center font-(family-name:--font-serif) font-normal text-white">
              <span className="block font-(family-name:--font-grotesk) text-[25px] leading-none font-medium uppercase">
                The true taste of Kerrygold<span className="align-top text-[16px]">®</span>
              </span>
              <span className="block text-[50px] leading-none">Made by people who care, for people who care.</span>
            </h1>
            <a
              className="flex h-10 w-[195px] items-center justify-center rounded-[10px] border-[0.5px] border-black bg-[#fff9a7] font-(family-name:--font-grotesk) text-base leading-[1.1] font-semibold text-[#2d2b23] uppercase"
              href="#explore"
            >
              Explore more
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
