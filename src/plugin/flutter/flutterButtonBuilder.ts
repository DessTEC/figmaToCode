import {
    flutterBorder,
    flutterBorderRadius,
    flutterBoxShadow,
    flutterSide,
    getFlutterColor,
    numToAutoFixed,
} from './utils';

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
    const minimumSize = `\nminimumSize: const Size.fromHeight(${numToAutoFixed(node.height)}),`;

    const properties = backgroundColor + shape + minimumSize;

    return `\nstyle: ElevatedButton.styleFrom(${properties}\n),`;
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

    return `Container(\ndecoration: BoxDecoration(${properties}\n),\nchild: ${child}\n),`;
};
