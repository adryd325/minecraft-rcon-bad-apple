import Rcon from "rcon-srcds";
import fs from "fs";

const password = fs.readFileSync("./password.txt", "utf-8");
const server = new Rcon.default({host: "127.0.0.1", port: 25575});
const sleep = async (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// location of the data in the world
const templateX = -144;
const templateY = 0;
const templateZ = -353 - 64;

// location of the video player
const playerX = 64;
const playerY = 64;
const playerZ = -64;

// frame count
const frames = 3944;

await server.authenticate(password);

let dx = templateX;
let dy = templateY;
let dz = templateZ;
let isDone;

const drawFrame = async () => {
  // clone the current frame from the data to the video player
  await server.execute(
    `clone ${dx} ${dy} ${dz} ${dx + 15} ${
      dy + 15
    } ${dz} ${playerX} ${playerY} ${playerZ}`
  );
  // adjust positions for next frame
  if (--dz == templateZ - 16) {
    dz = templateZ;
    dy += 16;
    if (dy == 256) {
      dy = templateY;
      dx -= 16;
      dz = templateZ;
    }
  }
  isDone = true;
};

const framerateMonitor = async (frame) => {
  await sleep(1000 / 18);
  // if isDone is false, we're late on this frame, send a warning
  if (!isDone) {
    console.log(`late frame ${frame}`);
  }
};

for (let frame = 0; frame < frames; ++frame) {
  isDone = false;
  // run these two at the same time and wait for them to finish
  await Promise.all([drawFrame(), framerateMonitor(frame)]);
}

process.exit(0);
