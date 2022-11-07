import {clone, commonLetterSpacing, figmaRGBToFlutterColor, getTextStyle, indentString, numToAutoFixed} from './utils';

export const makeTextComponent = (node: TextNode): string => {
    // only undefined in testing
    let alignHorizontal = node.textAlignHorizontal?.toString()?.toLowerCase() ?? 'left';
    alignHorizontal = alignHorizontal === 'justified' ? 'justify' : alignHorizontal;

    // todo if layoutAlign !== MIN, Text will be wrapped by Align
    // if alignHorizontal is LEFT, don't do anything because that is native
    const textAlign = alignHorizontal !== 'left' ? `\ntextAlign: TextAlign.${alignHorizontal},` : '';

    let text = node.characters;
    if (node.textCase === 'LOWER') {
        text = text.toLowerCase();
    } else if (node.textCase === 'UPPER') {
        text = text.toUpperCase();
    }
    // else if (node.textCase === "TITLE") {
    // TODO this
    // }

    const textStyle = getTextStyle(node);

    const style = textStyle ? `\nstyle: TextStyle(${indentString(textStyle)}\n),` : '';

    const splittedChars = text.split('\n');
    const charsWithLineBreak = splittedChars.length > 1 ? splittedChars.join('\\n') : text;

    const properties = `\n"${charsWithLineBreak}",${textAlign}${style}`;

    const textComp = `const Text(${indentString(properties)}\n),`;

    return `FittedBox(\nfit: BoxFit.scaleDown,\nchild: ${textComp}\n),`;
};

export const flutterBorder = (node: any): string => {
    if (node.type === 'GROUP' || !node.strokes || node.strokes.length === 0) {
        return '';
    }

    // retrieve the stroke color, when existent (returns "" otherwise)

    const colorFigma = clone(node.strokes[0].color);
    colorFigma['a'] = node.strokes[0].opacity;

    const propStrokeColor = figmaRGBToFlutterColor(colorFigma);

    // only add strokeWidth when there is a strokeColor (returns "" otherwise)
    const propStrokeWidth = `width: ${numToAutoFixed(node.strokeWeight)}, `;

    // generate the border, when it should exist
    return propStrokeColor && node.strokeWeight ? `\nborder: Border.all(${propStrokeColor} ${propStrokeWidth}),` : '';
};
