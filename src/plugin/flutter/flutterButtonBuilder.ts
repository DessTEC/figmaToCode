import {
    flutterBorder,
    flutterBorderRadius,
    flutterBoxShadow,
    flutterSide,
    getFlutterColor,
    indentString,
    numToAutoFixed,
} from './utils';

export const makeElevatedButtonStyleComponent = (node: any): string => {
    let backgroundColor = '';
    if (node.fills !== null && node.fills.length > 0) {
        backgroundColor = `backgroundColor: Color(${getFlutterColor(node.fills[0])}),`;
    } else {
        backgroundColor = `backgroundColor: Colors.transparent,\nelevation: 0,`;
    }
    const side = flutterSide(node);
    const borderRadius = flutterBorderRadius(node);
    const shape = `\nshape: RoundedRectangleBorder(${indentString(`${side}${borderRadius}`)}\n),`;

    //Take width infinity and fixed height
    const minimumSize = `\nminimumSize: const Size.fromHeight(${numToAutoFixed(node.height)}),`;

    const properties = backgroundColor + shape + minimumSize;

    return `\nstyle: ElevatedButton.styleFrom(\n${indentString(properties)}\n),`;
};

export const makeIconButtonStyleWrapper = (node: any, child: string): string => {
    let backgroundColor = '';
    if (node.fills !== null && node.fills.length > 0) {
        backgroundColor = `\ncolor: Color(${getFlutterColor(node.fills[0])}),`;
    }

    const border = flutterBorder(node);
    const borderRadius = flutterBorderRadius(node);
    const shadow = flutterBoxShadow(node);

    const properties = backgroundColor + border + borderRadius + shadow;
    const decoration = `BoxDecoration(${indentString(properties)}\n),`;

    return `Container(\n${indentString(`decoration: ${decoration}\nchild: ${child}`)}\n),`;
};
