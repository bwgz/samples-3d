const meterToMeter = (m) => m;
const meterToCentimeter = (m) => m * 100;
const meterToMillimeter = (m) => m * 1000;

// All values are in meters.

const width = 4.75;
const board = 0;
const boardToHack = 1.829;
const hackToBackLine = 1.829;
const backLineToTeeLine = 1.829;
const teeLineToHogLine = 6.401;
const hogToHog = 21.945;

const twelveFootRadius = 1.829;
const eightFootRadius = 1.219;
const fourFootRadius = 0.61;
const buttonRadius = 0.152;
const pinRadius = 0.01;

const hack = boardToHack;
const backLine = hack + hackToBackLine;
const teeLine = backLine + backLineToTeeLine;
const hogLine = teeLine + teeLineToHogLine;
const centerLine = width / 2;

const backLineWidth = 0.05;
const teeLineWidth = 0.05;
const hogLineWidth = 0.1016;
const centerLineWidth = 0.05;

const scoreboardWidth = width * 0.9;
const scoreboardHeight = 1.5;

class IceDimensions {
  static generate(converter) {
    const dimensions = {
      width: converter(width),
      board: converter(board),
      boardToHack: converter(boardToHack),
      hackToBackLine: converter(hackToBackLine),
      backLineToTeeLine: converter(backLineToTeeLine),
      teeLineToHogLine: converter(teeLineToHogLine),
      hogToHog: converter(hogToHog),

      twelveFootRadius: converter(twelveFootRadius),
      eightFootRadius: converter(eightFootRadius),
      fourFootRadius: converter(fourFootRadius),
      buttonRadius: converter(buttonRadius),
      pinRadius: converter(pinRadius),

      hack: converter(hack),
      backLine: converter(backLine),
      teeLine: converter(teeLine),
      hogLine: converter(hogLine),
      centerLine: converter(centerLine),

      backLineWidth: converter(backLineWidth),
      teeLineWidth: converter(teeLineWidth),
      hogLineWidth: converter(hogLineWidth),
      centerLineWidth: converter(centerLineWidth),
    };

    dimensions.oneMeter = converter(1);
    dimensions.length = (dimensions.hogLine * 2) + dimensions.hogToHog;

    return dimensions;
  }
}

const stoneCircumference = 0.9144;
const stoneRadius = stoneCircumference / (2 * Math.PI);

class StoneDimensions {
  static generate(converter) {
    const dimensions = {
      circumference: converter(stoneCircumference),
      radius: converter(stoneRadius),
      diameter: converter(stoneRadius * 2),
    };
    return dimensions;
  }
}

class ScoreboardDimensions {
  static generate(converter) {
    const dimensions = {
      width: converter(scoreboardWidth),
      height: converter(scoreboardHeight),
    }
    return dimensions;
  }
}

export { IceDimensions, ScoreboardDimensions, StoneDimensions, meterToMeter, meterToCentimeter, meterToMillimeter };
