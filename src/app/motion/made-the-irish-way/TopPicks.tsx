"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, type Easing, type MotionProps } from "motion/react";
import { grotesk, serif } from "./fonts";
import focaccia from "./assets/top-picks/focaccia.png";
import image410 from "./assets/top-picks/image-410.png";
import image411 from "./assets/top-picks/image-411.png";
import nextPhoto from "./assets/top-picks/next.png";
import previousPhoto from "./assets/top-picks/previous.png";

// The Figma frame is 1440x1070 (see the aspect ratio and stage height below) and everything is laid out at that size, then scaled to the page width.
const STAGE_W = 1440;

// One 5.12s loop drives every moving layer: the centre card shrinks to the left, the green card on
// the right grows into the centre, the left card leaves and a new one enters from the right.
const DURATION = 5.12;
const EASE: Easing[] = [[0.4, 0, 0.2, 1], [0.4, 0, 0.2, 1], "linear"];

const SLIDE_TIMES = [0, 0.3945, 0.5801, 1];
const hold = (to: number, times = SLIDE_TIMES) => ({ values: [0, 0, to, to], times });
const fade = (values: number[], times: number[]) => ({ values, times });

type Track = { values: number[]; times: number[] };

// Builds initial/animate/transition for a set of keyframe tracks. With reduced motion it returns
// the first frame of the loop and nothing else.
function timeline(reduce: boolean | null, tracks: Record<string, Track>): MotionProps {
  const entries = Object.entries(tracks);
  const initial = Object.fromEntries(entries.map(([key, t]) => [key, t.values[0]]));
  if (reduce) return { initial };
  return {
    initial,
    animate: Object.fromEntries(entries.map(([key, t]) => [key, t.values])),
    transition: Object.fromEntries(
      entries.map(([key, t]) => [key, { duration: DURATION, times: t.times, ease: EASE, repeat: Infinity }]),
    ),
  };
}

const title = "m-0 w-full text-[26px] leading-[1.3] font-medium font-(family-name:--font-serif)";
const body = "m-0 w-full text-[16px] leading-[1.3] font-normal font-(family-name:--font-grotesk)";
const button =
  "absolute top-[960.43px] left-[622.3px] flex h-10 w-[195.053px] items-center justify-center rounded-[10px] border-[0.5px] border-black bg-[#fff9a7] text-[16px] leading-[1.1] font-semibold text-[#2d2b23] uppercase font-(family-name:--font-grotesk)";

export default function TopPicks() {
  const reduce = useReducedMotion();
  const frame = useRef<HTMLDivElement>(null);
  // null until measured: the server can't know the page width, so the stage stays hidden to avoid a size jump.
  const [fit, setFit] = useState<number | null>(null);

  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const update = () => setFit(el.clientWidth / STAGE_W);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const move = timeline(reduce, { x: hold(-632.959), y: hold(56.526) });
  const rect = timeline(reduce, {
    height: { values: [680.281, 680.281, 475, 475], times: [0, 0.3945, 0.541, 1] },
    width: { values: [485.651, 485.651, 475, 475], times: [0, 0.3945, 0.541, 1] },
    x: hold(5.326, [0, 0.3945, 0.541, 1]),
    y: hold(5.075, [0, 0.3945, 0.541, 1]),
  });
  const content = timeline(reduce, { opacity: fade([1, 1, 0, 0], [0, 0.3906, 0.4434, 1]) });
  const green = timeline(reduce, {
    height: { values: [475, 475, 680.281, 680.281], times: SLIDE_TIMES },
    width: { values: [475, 475, 485.651, 485.651], times: SLIDE_TIMES },
    x: hold(-641.885),
    y: hold(-62.075),
  });
  const window_ = timeline(reduce, { x: hold(5.326), y: hold(5.075) });
  const revealed = timeline(reduce, { opacity: fade([0, 0, 1, 1], [0, 0.4961, 0.6094, 1]) });
  const leave = timeline(reduce, { x: hold(-635) });
  const allRecipes = timeline(reduce, { opacity: fade([1, 1, 0, 0], [0, 0.4922, 0.5605, 1]) });
  const explore = timeline(reduce, { opacity: fade([0, 0, 1, 1], [0, 0.4922, 0.5801, 1]) });

  return (
    <section
      ref={frame}
      className={`${serif.variable} ${grotesk.variable} relative aspect-[1440/1070] w-full overflow-hidden bg-white`}
    >
      <div
        className="absolute top-0 left-0 h-[1070px] w-[1440px] origin-top-left"
        style={{ transform: `scale(${fit ?? 1})`, visibility: fit === null ? "hidden" : "visible" }}
      >
        {/* Centre card, which steps left and becomes the framed card on the left */}
        <motion.div className="absolute top-0 left-0 h-0 w-0" {...move}>
          <motion.div className="absolute top-[252.47px] left-[478.12px] bg-[#f4eddd]" {...rect} />
          <div className="absolute top-[282.54px] left-[492.94px] flex w-[456px] flex-col items-center justify-center gap-[31px]">
            <div className="relative size-[425px] overflow-hidden bg-[#d9d9d9]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={focaccia.src}
                alt=""
                className="absolute top-[-10.61%] left-0 h-[134.39%] w-full max-w-none"
              />
            </div>
            <motion.div className="flex w-full flex-col items-center px-12" {...content}>
              <div className="flex w-full flex-col items-start gap-3 text-center text-[#2d2b23]">
                <h3 className={title}>Kerrygold Garlic &amp; Herb Butter Focaccia</h3>
                <p className={body}>
                  Ian Doyle can be found making this golden focaccia brushed with melted Kerrygold butter, roasted
                  garlic, and fresh rosemary at teh Cliff House Hotel. A simple, crowd-pleasing recipe rated five stars
                  by our community.
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Green card on the right, which grows into the centre and reveals its text */}
        <motion.div className="absolute top-[314.54px] left-[1120px] overflow-clip bg-[#666a3b]" {...green}>
          <motion.div className="absolute top-[25px] left-[25px] size-[425px] overflow-clip" {...window_}>
            <div className="absolute top-[0.27px] left-0 h-[460px] w-[388px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={nextPhoto.src} alt="" className="absolute size-full max-w-none object-cover" />
              <div className="absolute inset-0 bg-linear-to-l from-white/50 to-white/0" />
            </div>
            <div className="absolute top-[-30.03px] left-[-12.82px] h-[536.601px] w-[437.819px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image410.src} alt="" className="absolute inset-0 size-full max-w-none object-cover" />
            </div>
          </motion.div>
          <motion.div
            className="absolute top-[486.07px] left-[14.83px] flex w-[456px] flex-col items-center px-12"
            {...revealed}
          >
            <div className="flex w-full flex-col items-start gap-3 text-center text-white">
              <h3 className={title}>A Lot Butter, A Lot of Magic</h3>
              <p className={body}>
                Step inside the kitchen with our favourite chefs and discover how Kerrygold butter brings simple
                ingredients to life. From everyday cooking to something extraordinary, it&apos;s all about making it
                gold.
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Card on the left, which leaves the frame */}
        <motion.div
          className="absolute top-[339.07px] left-[-124.52px] size-[425px] border-[25px] border-solid border-[#dde6cb]"
          {...leave}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previousPhoto.src} alt="" className="absolute inset-0 size-full max-w-none object-cover" />
        </motion.div>

        <div className="absolute top-[64.07px] left-1/2 flex w-[880px] -translate-x-1/2 flex-col items-center gap-4 text-center leading-none">
          <p className="m-0 h-[27px] w-full text-[24px] font-medium tracking-[-0.48px] text-[#2d2b23] uppercase font-(family-name:--font-grotesk)">
            Top picks of the week
          </p>
          <h2 className="m-0 w-full text-[50px] font-normal tracking-[-1px] text-black font-(family-name:--font-serif) [text-box-edge:cap_alphabetic] [text-box-trim:trim-both]">
            Chosen by our favourite
            <br />
            Michelin chefs
          </h2>
        </div>

        <motion.a href="#all-recipes" className={button} {...allRecipes}>
          All recipes
        </motion.a>

        {/* New card entering from the right */}
        <motion.div
          className="absolute top-[339.54px] left-[1780px] size-[425px] overflow-clip border-[25px] border-solid border-[#dde6cb]"
          {...leave}
        >
          <div className="absolute top-[0.27px] left-0 h-[460px] w-[388px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={nextPhoto.src} alt="" className="absolute size-full max-w-none object-cover" />
            <div className="absolute inset-0 bg-linear-to-l from-white/50 to-white/0" />
          </div>
          <div className="absolute top-[calc(50%+25.77px)] left-[calc(50%-10.68px)] h-[536.601px] w-[429.281px] -translate-x-1/2 -translate-y-1/2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image410.src} alt="" className="absolute inset-0 size-full max-w-none object-cover" />
          </div>
          <div className="absolute top-[-14.87px] left-[-6.83px] h-[456.174px] w-[355.986px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image411.src} alt="" className="absolute inset-0 size-full max-w-none object-cover" />
          </div>
        </motion.div>

        <motion.a href="#explore-more" aria-hidden="true" tabIndex={-1} className={button} {...explore}>
          Explore more
        </motion.a>
      </div>
    </section>
  );
}
