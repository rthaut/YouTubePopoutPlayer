const path = require("path");
const sharp = require("sharp");

const sizes = [16, 19, 24, 32, 38, 48, 64, 96, 128];
const inputFile = path.resolve("resources/logo.svg");
const outputDir = path.resolve("src/public/icons");

sizes.forEach((size) =>
  sharp(inputFile)
    .resize(size, size, { fit: "contain", background: "transparent" })
    .png()
    .toFile(path.join(outputDir, `${size}.png`))
    .then(() => console.log("Created", `${size}.png`, "in", outputDir)),
);
