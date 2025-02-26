import { createCanvas } from "@napi-rs/canvas";
import GIFEncoder from "gif-encoder";
import { DotLottie } from "@lottiefiles/dotlottie-web";
import fs from "fs";

const WIDTH = 200;
const HEIGHT = 200;

// Create a canvas with the specified width and height
const canvas = createCanvas(WIDTH, HEIGHT);

// Create a GIF encoder with the same dimensions as the canvas
const gif = new GIFEncoder(WIDTH, HEIGHT);

// Initialize dotLottie with specific settings
const dotLottie = new DotLottie({
  loop: false, // Prevent looping for single playback
  useFrameInterpolation: false, // Disable frame interpolation as it's not supported by gif
  canvas: canvas as unknown as HTMLCanvasElement, // Canvas for rendering

  // Credit goes to -> https://lottiefiles.com/animations/celebration-lolo-w318l83FuX
  src: "https://assets.ctfassets.net/auzjf8fz9kg1/60csWdJkQB4HBFjhKWbLC7/64741206f721750d3c05b3fc175bbd3e/Loader.lottie", // URL to lottie or dotLottie animation
  autoplay: true, // Start playback upon loading
});

dotLottie.addEventListener("load", () => {
  // Generate a timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  const outputGifFile = fs.createWriteStream(
    `./output/animation_${timestamp}.gif`,
  ); // Stream for output GIF file

  gif.pipe(outputGifFile); // Pipe the encoder output to the file stream

  gif.writeHeader(); // Write the initial header for the GIF

  // Calculate frame delay from animation frame rate
  const fps = dotLottie.totalFrames / dotLottie.duration;
  gif.setDelay(1000 / fps); // Set frame delay in milliseconds
  gif.setRepeat(0); // Configure repeat setting for the GIF (0 for repeat)
});

dotLottie.addEventListener("frame", () => {
  const ctx = canvas.getContext("2d"); // Get the 2D context of the canvas
  const frameBuffer = ctx.getImageData(0, 0, WIDTH, HEIGHT).data; // Extract frame data

  gif.addFrame(frameBuffer); // Add the current frame to the GIF
});

dotLottie.addEventListener("complete", () => {
  gif.finish(); // Finish the GIF encoding and close the file stream
});
