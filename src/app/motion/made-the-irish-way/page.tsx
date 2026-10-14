import type { Metadata } from "next";
import MadeTheIrishWay from "./MadeTheIrishWay";

export const metadata: Metadata = {
  title: "Made the Irish way",
  description:
    "A Figma motion frame rebuilt in code: the headline splits, a masked photo grows to fill the screen, then the call to action fades in.",
};

export default function Page() {
  return (
    <main>
      <MadeTheIrishWay />
    </main>
  );
}
