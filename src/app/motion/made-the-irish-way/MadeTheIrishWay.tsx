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
import styles from "./MadeTheIrishWay.module.css";

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
  const [fit, setFit] = useState(1);

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

  return (
    <div ref={frame} className={`${styles.frame} ${serif.variable} ${grotesk.variable}`}>
      <div className={styles.stage} style={{ transform: `translate(-50%, -50%) scale(${fit})` }}>
        <motion.p className={`${styles.headline} ${styles.left}`} initial={{ x: 0 }} {...(slideLeft as object)}>
          Made the
        </motion.p>
        <motion.p className={`${styles.headline} ${styles.right}`} initial={{ x: 0 }} {...(slideRight as object)}>
          Irish way
        </motion.p>

        <motion.div
          className={styles.photo}
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
          <img src={photo.src} alt="" className={styles.photoImg} />
        </motion.div>

        <motion.div
          className={styles.cta}
          initial={{ opacity: reduceMotion ? 1 : 0 }}
          animate={reduceMotion ? { opacity: 1 } : { opacity: [0, 0, 1, 1] }}
          transition={{
            duration: DURATION,
            times: [0, 0.3922, 0.4457, 1],
            ease: [[0.5, 0, 0.5, 1], [0.5, 0, 0.5, 1], "easeOut"],
            repeat: Infinity,
          }}
        >
          <div className={styles.ctaInner}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={sliderArrow.src} alt="" width={67} height={66} />
            <h1 className={styles.ctaText}>
              <span className={styles.eyebrow}>
                The true taste of Kerrygold<span className={styles.reg}>®</span>
              </span>
              <span className={styles.line}>Made by people who care, for people who care.</span>
            </h1>
            <a className={styles.button} href="#explore">
              Explore more
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
