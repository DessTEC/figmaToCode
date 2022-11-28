// Checkbox(value: false, onChanged: (value){})

import {makeTextComponent} from './flutterTextBuilder';
import {findNodeInSubtreeByType, getFlutterColor, indentString} from './utils';

export const flutterCheckbox = (node: any): string => {
    const text = findNodeInSubtreeByType(node, 'TEXT');
    const title = makeTextComponent(text);

    const rectangle = findNodeInSubtreeByType(node, 'RECTANGLE');
    const fillColor = `\nfillColor: MaterialStateColor.resolveWith((states) =>  Color(${getFlutterColor(
        rectangle.strokes[0]
    )})),`;

    const value = '\nvalue: false,';
    const onChanged = '\nonChanged: (value){},';
    const properties = value + onChanged + fillColor;

    const checkbox = `Checkbox(${indentString(properties)}\n),`;
    const children = `children: [\n${indentString(`${checkbox}\n${title}`)}\n]`;

    return `Row(\n${indentString(children)}\n),`;
};
