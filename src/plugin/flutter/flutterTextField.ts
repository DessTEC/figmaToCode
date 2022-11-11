import {
    indentString,
    findNodeInSubtreeByName,
    findNodeInSubtreeByType,
    wrapInteractiveComponent,
    makeContainerWithStyle,
    flutterBoxShadow,
} from './utils';
import {makeHintStyleComponent, makeInputDecorationComponent, makeTextStyleComponent} from './flutterTextFieldBuilder';
import {getLayoutType} from './flutterMain';
import {flutterIcon} from './flutterIcon';

// TODO: Add shadow in container
export const flutterTextField = (node: InstanceNode | ComponentNode): string => {
    const labelNode = findNodeInSubtreeByName(node, 'Label');
    const inputTextNode = findNodeInSubtreeByName(node, 'InputText');
    const inputBoxNode = findNodeInSubtreeByName(node, 'InputBox');

    //Text will have same style as hint
    const textStyle = makeTextStyleComponent(inputTextNode);
    const hintStyle = makeHintStyleComponent(inputTextNode);

    let icon = flutterIcon(node);

    if (icon !== '') {
        //Check if it is a prefix or suffix icon
        const childrenBox = inputBoxNode.children;
        //Suffix icon
        if (childrenBox[0].type === 'TEXT') {
            icon = `\nsuffixIcon: ${icon}`;
        } else {
            //Prefix icon
            icon = `\nprefixIcon: ${icon}`;
        }
    }

    const inputDecoration = makeInputDecorationComponent(inputBoxNode, inputTextNode.characters, hintStyle, icon);
    const properties = `${textStyle}${inputDecoration}`;
    let textFieldWidget = `const TextField(${indentString(properties)}\n),`;

    const shadow = flutterBoxShadow(inputBoxNode);
    if (shadow !== '') {
        textFieldWidget = `Container(decoration: BoxDecoration(${shadow}\n),\nchild: ${textFieldWidget}\n),`;
    }

    const {width, height, layoutMode} = getLayoutType(node);

    // If there is a label above the input box
    if (labelNode !== null && labelNode.visible) {
        const labelStyle = makeTextStyleComponent(labelNode);
        const textLabelWidget = `Text(\n"${labelNode.characters}",${labelStyle}\n),`;

        const wrapperTextField = `Expanded(\nchild: ${textFieldWidget})`;

        textFieldWidget = `Column(\ncrossAxisAlignment: CrossAxisAlignment.start, \nchildren: <Widget>[\n${textLabelWidget}\n${wrapperTextField}]\n),`;
        //return column with text and texfield
    }

    return wrapInteractiveComponent(width, height, layoutMode, textFieldWidget, node);
};
