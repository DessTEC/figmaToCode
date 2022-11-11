import {flutterBorderRadius, flutterSide, getFlutterColor} from './utils';

export const makeElevatedButtonStyleComponent = (node: any): string => {
    let backgroundColor = '';
    if (node.fills !== null && node.fills.length > 0) {
        backgroundColor = `\nbackgroundColor: Color(${getFlutterColor(node.fills[0])}),`;
    } else {
        backgroundColor = `\nbackgroundColor: Colors.transparent,\nelevation: 0,`;
    }
    const side = flutterSide(node);
    const borderRadius = flutterBorderRadius(node);
    const shape = `\nshape: RoundedRectangleBorder(${side}${borderRadius}\n),`;

    //Take width infinity and fixed height
    const minimumSize = `\nminimumSize: const Size.fromHeight(${node.height}),`;

    const properties = backgroundColor + shape + minimumSize;

    return `\nstyle: ElevatedButton.styleFrom(${properties}\n),`;
};

export const makeIconButtonStyleComponent = (node: any): string => {
    let backgroundColor = '';
    if (node.fills !== null && node.fills.length > 0) {
        backgroundColor = `\nbackgroundColor: Color(${getFlutterColor(node.fills[0])}),`;
    } else {
        backgroundColor = `\nbackgroundColor: Colors.transparent,\nelevation: 0,`;
    }
    const side = flutterSide(node);
    const borderRadius = flutterBorderRadius(node);
    const shape = `\nshape: RoundedRectangleBorder(${side}${borderRadius}\n),`;

    //Take width infinity and fixed height
    const minimumSize = `\nminimumSize: const Size.fromHeight(${node.height}),`;

    const properties = backgroundColor + shape + minimumSize;

    return `\nstyle: IconButton.styleFrom(${properties}\n),`;
};
