import Rcon from "rcon-srcds";
import fs from "fs";

const password = fs.readFileSync("./password.txt", "utf-8");
const server = new Rcon.default({host: "127.0.0.1", port: 25575});
const badAppleImageData = JSON.parse(fs.readFileSync("./tba3", "utf-8")).c;

/// /setblock -144 0 -353
// -Z (third argument decrements)
const baseX = -144;
const baseZ = -353 - 64;
const baseY = 0;

// const blocks = [
//   "black_concrete",
//   "gray_concrete",
//   "light_gray_concrete",
//   "white_concrete"
// ]

const blocks = [
  "black_concrete",
  "coal_block",
  "black_wool",
  "black_concrete_powder",
  "blackstone",
  "cracked_polished_blackstone_bricks",
  "polished_blackstone_bricks",
  "chiseled_polished_blackstone",
  "gray_concrete",
  "netherite_block",
  "basalt",
  "gray_concrete_powder",
  "coal_ore",
  "stone_bricks",
  "stone",
  "andesite",
  "light_gray_wool",
  "light_gray_concrete_powder",
  "smooth_stone",
  "diorite",
  "polished_diorite",
  "white_concrete",
  "birch_wood",
  "iron_block",
  "white_concrete_powder",
  "white_wool",
  "snow_block",
];

const PALETTE_SCALER = 256 / blocks.length;

await server.authenticate(password);
let dx = baseX;
let dy = baseY;
let dz = baseZ;
let previousBlock;
let lastX, lastY, lastZ;
for (let time = 0; time < badAppleImageData.length; ++time) {
  if (time > 0) {
    // clone the previous frame if we're not on the first frame
    const cmd = `clone ${lastX} ${lastY} ${lastZ} ${lastX + 15} ${
      lastY + 15
    } ${lastZ} ${dx} ${dy} ${dz}`;
    await server.execute(cmd);
  }
  for (let x = 0; x < badAppleImageData[time].length; ++x) {
    for (let y = 0; y < badAppleImageData[time][x].length; ++y) {
      let block =
        blocks[Math.floor(badAppleImageData[time][x][y] / PALETTE_SCALER)];
      // if we have a concrete powder block at the bottom of a frame, just replace it with regular concrete
      // we need to flip the y axys cause the dataset is upside-down; thus y == 15
      if (block.includes("powder") && y == 15) {
        block = block.replace("_powder", "");
      }
      // only setblock the difference between frames, instead of redrawing the whole frame
      previousBlock =
        time == 0 ||
        blocks[Math.floor(badAppleImageData[time - 1][x][y] / PALETTE_SCALER)];
      if (block === previousBlock) continue;
      // gotta flip on the y axys cause the dataset is upside-down
      await server.execute(
        `setblock ${dx + x} ${dy + (15 - y)} ${dz} ${block}`
      );
    }
  }
  // Reset!
  lastX = dx;
  lastY = dy;
  lastZ = dz;
  if (--dz == baseZ - 16) {
    dz = baseZ;
    dy += 16;
    if (dy == 256) {
      dy = baseY;
      dx -= 16;
      dz = baseZ;
    }
  }
  console.log("Drew", time);
  //await server.execute(`tellraw @a "<bapple> Drawn frame ${time}"`);
}

process.exit(0)