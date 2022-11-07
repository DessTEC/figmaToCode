import {
    findNodeInChildren,
    findNodeInSubtreeByType,
    flutterBorderRadius,
    flutterBoxShadow,
    getScreenParent,
    numToAutoFixed,
    widthScreen,
    wrapInteractiveComponent,
} from './utils';
import {makeTextStyleComponent} from './flutterTextFieldBuilder';
import {makeButtonStyleComponent} from './flutterButtonBuilder';
import {getLayoutType} from './flutterMain';

export const flutterButton = (node: InstanceNode | ComponentNode): string => {
    const textNode = findNodeInSubtreeByType(node, 'TEXT');
    const iconMaterial = findNodeInSubtreeByType(node, 'VECTOR');

    const onPressed = `\nonPressed: (){},`;
    const textStyle = makeTextStyleComponent(textNode);
    let children = `Text(\n"${textNode.characters}",\noverflow: TextOverflow.clip,\nsoftWrap: false,${textStyle}\n),`;

    if (iconMaterial !== null && iconMaterial.visible) {
        const icon = `Icon(Icons.${iconMaterial.name}),`;
        if (node.children[0].type === 'VECTOR') {
            const parentScreen = getScreenParent(node);
            const ratio = node.itemSpacing / parentScreen.width;
            children = `Expanded(\nchild: ${children}\n),`;
            children = `\nchildren: [\n${icon}\nSizedBox(width: ${widthScreen}*${ratio.toFixed(2)}),\n${children}\n],`;
            children = `Row(\nmainAxisSize: MainAxisSize.min, ${children}\n),`;
        }
    }

    children = `\nchild: ${children}`;
    const buttonStyle = makeButtonStyleComponent(node);

    const properties = children + onPressed + buttonStyle;

    const {width, height, layoutMode} = getLayoutType(node);

    let buttonComponent = `ElevatedButton(${properties}\n),`;

    const shadow = flutterBoxShadow(node);

    if (shadow !== '') {
        const borderRadius = flutterBorderRadius(node);
        buttonComponent = `Container(\ndecoration: BoxDecoration(${borderRadius}${shadow}\n),\nchild: ${buttonComponent}\n),`;
    }

    return wrapInteractiveComponent(width, height, layoutMode, buttonComponent, node);
};
