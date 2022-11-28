import {makeTextComponent} from './flutterTextBuilder';
import {findNodeInSubtreeByType, getFlutterColor, indentString} from './utils';

export const flutterRadio = (node: any): string => {
    //Find name of group, the group is a string that should be defined by the developer
    //The name should be wrapped by _ chars in figma, like _album_

    const start = node.name.indexOf('_');
    const end = node.name.lastIndexOf('_');

    const group = node.name.substring(start + 1, end);
    const groupValue = `\ngroupValue: ${group},`;
    const functionContent = `${group} = value.toString();`;
    const setState = `setState(() {\n${indentString(functionContent)}\n});`;
    const onChanged = `\nonChanged: (value){\n${indentString(setState)}\n},`;

    const text = findNodeInSubtreeByType(node, 'TEXT');
    const title = makeTextComponent(text);

    const circle = findNodeInSubtreeByType(node, 'ELLIPSE');
    const fillColor = `\nfillColor: MaterialStateColor.resolveWith((states) =>  Color(${getFlutterColor(
        circle.strokes[0]
    )})),`;

    const value = `\nvalue: "${text.characters}",`;

    const properties = value + groupValue + onChanged + fillColor;

    const radio = `Radio(${indentString(properties)}\n),`;
    const children = `children: [\n${indentString(`${radio}\n${title}`)}\n]`;

    return `Row(\n${indentString(children)}\n),`;
};
