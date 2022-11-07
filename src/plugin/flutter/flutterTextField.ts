import {indentString, findNodeInSubtreeByName, findNodeInSubtreeByType, wrapInteractiveComponent} from './utils';
import {makeHintStyleComponent, makeInputDecorationComponent, makeTextStyleComponent} from './flutterTextFieldBuilder';
import {getLayoutType} from './flutterMain';

export const flutterTextField = (node: InstanceNode | ComponentNode): string => {
    const labelNode = findNodeInSubtreeByName(node, 'Label');
    const inputTextNode = findNodeInSubtreeByName(node, 'InputText');
    const inputBoxNode = findNodeInSubtreeByName(node, 'InputBox');
    const iconNode = findNodeInSubtreeByName(node, 'Icon');

    //Text will have same style as hint
    const textStyle = makeTextStyleComponent(inputTextNode);
    const hintStyle = makeHintStyleComponent(inputTextNode);

    let icon = '';

    if (iconNode !== null && iconNode.visible) {
        //Check if it is a prefix or suffix icon
        const childrenBox = inputBoxNode.children;
        const iconMaterial = findNodeInSubtreeByType(iconNode, 'VECTOR');
        //Suffix icon
        if (childrenBox[0].type === 'TEXT') {
            icon = `\nsuffixIcon: Icon(Icons.${iconMaterial.name}),`;
        } else {
            //Prefix icon
            icon = `\nprefixIcon: Icon(Icons.${iconMaterial.name}),`;
        }
    }

    const inputDecoration = makeInputDecorationComponent(inputBoxNode, inputTextNode.characters, hintStyle, icon);
    const properties = `${textStyle}${inputDecoration}`;

    let textFieldWidget = `const TextField(${indentString(properties)}\n),`;
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
