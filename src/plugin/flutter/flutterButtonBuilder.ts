import {flutterBorderRadius, flutterSide, getFlutterColor} from './utils';

export const makeButtonStyleComponent = (node: any): string => {
    const backgroundColor = `\nbackgroundColor: Color(${getFlutterColor(node.fills[0])}),`;
    const side = flutterSide(node);
    const borderRadius = flutterBorderRadius(node);
    const shape = `\nshape: RoundedRectangleBorder(${side}${borderRadius}\n),`;

    //Take width infinity and fixed height
    const minimumSize = `\nminimumSize: const Size.fromHeight(${node.height}),`;

    const properties = backgroundColor + shape + minimumSize;

    return `\nstyle: ElevatedButton.styleFrom(${properties}\n),`;
};
