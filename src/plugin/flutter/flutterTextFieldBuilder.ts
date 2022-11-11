import {flutterBorderRadius, flutterBorderSide, getFlutterColor, getTextStyle, indentString} from './utils';

export const makeTextStyleComponent = (node: TextNode): string => {
    const textStyle = getTextStyle(node);

    const style = textStyle ? `\nstyle: TextStyle(${indentString(textStyle)}\n),` : '';

    return style;
};

export const makeHintStyleComponent = (node: TextNode): string => {
    const textStyle = getTextStyle(node);

    const style = textStyle ? `\nhintStyle: TextStyle(${indentString(textStyle)}\n),` : '';

    return style;
};

export const makeInputDecorationComponent = (node: any, hintText: string, hintStyle: string, icon: string): string => {
    const borderSide = flutterBorderSide(node);
    const borderRadius = flutterBorderRadius(node);

    const outlineBorder = `\nborder: OutlineInputBorder(${borderSide}${borderRadius}\n),`;
    const backgroundColor = flutterInputBackgroundColor(node);
    const hint = `\nhintText: "${hintText}",`;
    const padding = `\ncontentPadding: EdgeInsets.fromLTRB(${node.paddingLeft}, ${node.paddingTop}, ${node.paddingRight}, ${node.paddingBottom}),`;

    const properties = padding + hint + hintStyle + outlineBorder + backgroundColor + icon;

    return `\ndecoration: InputDecoration(${indentString(properties)}\n),`;
};

export const flutterInputBackgroundColor = (node: RectangleNode): string => {
    const color = getFlutterColor(node.fills[0]);

    //Consider that fills is always in rectangle
    return `\nfilled: true,\nfillColor: Color(${color}),`;
};
