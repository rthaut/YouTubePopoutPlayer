const fs = require("fs");
const path = require("path");
const svg2png = require("svg2png");

const sizes = [16, 19, 24, 32, 38, 48, 64, 96, 128];
const inputFile = path.resolve("resources/logo.svg");
const outputDir = path.resolve("app/images/");

sizes.forEach((size) => {
  const input = fs.readFileSync(inputFile);
  const output = svg2png.sync(input, { width: size, height: size });

  const outputFilename = "icon-" + size.toString() + ".png";
  fs.writeFileSync(path.join(outputDir, outputFilename), output, {
    flag: "w",
  });
  console.log("Created", outputFilename, "in", outputDir);
});
