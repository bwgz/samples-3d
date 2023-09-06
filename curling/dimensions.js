const meterToMillimeter = (m) => m * 1000;
const centimeterToMillimeter = (cm) => cm * 10;
const meterToCentimeter = (m) => m * 100;

const iceWidth = 4.750;
const toHack = 1.829;
const toBackLine = toHack + 1.829;
const toTeeLine = toBackLine + 1.829;
const toHogLine = toTeeLine + 6.401;
const hogToHog = 21.945;

const lineWidth = 5;
const hogLineWidth = 10.16; // 10.16 cm

const rink = {
    width: meterToCentimeter(iceWidth),

    hack: meterToCentimeter(toHack),
    backLine: meterToCentimeter(toBackLine),
    teeLine: meterToCentimeter(toTeeLine),
    hogLine: meterToCentimeter(toHogLine),
    centerLine: meterToCentimeter(iceWidth) / 2,

    twelveFoot: meterToCentimeter(1.829),
    eightFoot: meterToCentimeter(1.219),
    fourFoot: meterToCentimeter(0.610),
    button: meterToCentimeter(0.152),

    hogToHog: meterToCentimeter(hogToHog),

    lineWidth: lineWidth,
    hogLineWidth: hogLineWidth,
};

export { rink };