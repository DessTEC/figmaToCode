export const indentString = (str: string, indentLevel: number = 1): string => {
    // const options = {
    //   includeEmptyLines: false,
    // };

    // const regex = options.includeEmptyLines ? /^/gm : /^(?!\s*$)/gm;
    const regex = /^(?!\s*$)/gm;
    return str.replace(regex, ' '.repeat(indentLevel * 4));
};

export function clone(val: any) {
    if (val !== undefined) {
        return JSON.parse(JSON.stringify(val));
    }
}

// Color utils
const namesRGB = ['r', 'g', 'b'];

export function figmaRGBToWebRGB(color: any): any {
    console.log(color);
    const rgb = [];

    namesRGB.forEach((e, i) => {
        rgb[i] = Math.round(color[e] * 255);
    });

    if (color['a'] !== undefined) rgb[3] = Math.round(color['a'] * 100) / 100;
    console.log(rgb);
    return rgb;
}

export function figmaRGBToFlutterColor(color: any): string {
    let hex = '0x';

    const rgb = figmaRGBToWebRGB(color);
    if (rgb[3] !== undefined) {
        const a = Math.round(rgb[3] * 255).toString(16);
        hex += a;
    }

    hex += ((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).slice(1);

    return hex;
}
