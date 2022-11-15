import {
    alignmentWidget,
    findNodeInSubtreeByType,
    flutterBorderRadius,
    flutterBoxShadow,
    flutterPadding,
    getScreenParent,
    widthScreen,
    wrapInteractiveComponent,
} from './utils';
import {makeTextStyleComponent} from './flutterTextFieldBuilder';
import {makeElevatedButtonStyleComponent, makeIconButtonStyleWrapper} from './flutterButtonBuilder';
import {getLayoutType, makeRowOrColumn} from './flutterMain';
import {flutterIcon} from './flutterIcon';

export const flutterButton = (node: InstanceNode | ComponentNode): string => {
    const textNode = findNodeInSubtreeByType(node, 'TEXT');
    let icon = flutterIcon(node);
    const onPressed = `\nonPressed: (){},`;

    let typeButton = '';

    let children = '';
    if (textNode !== null && textNode.visible) {
        const textStyle = makeTextStyleComponent(textNode);
        children = `Text(\nr"${textNode.characters}",\noverflow: TextOverflow.clip,\nsoftWrap: false,${textStyle}\n),`;

        if (icon !== '') {
            //Button with text and icon --------------------
            typeButton = 'textIcon';

            const parentScreen = getScreenParent(node);
            const ratio = node.itemSpacing / parentScreen.width;
            //Wrap text in expanded to avoid overflow issues, also added overflow behaviour on text
            children = `Expanded(\nchild: ${children}\n),`;
            //Icon - Space - Text
            if (node.children[0].type === 'VECTOR') {
                children = `${icon}\nSizedBox(width: ${widthScreen}*${ratio.toFixed(2)}),\n${children}`;
            } else {
                // Text - Space - Icon
                children = `${children}\nSizedBox(width: ${widthScreen}*${ratio.toFixed(2)}),\n${icon}`;
            }
            children = makeRowOrColumn(node, children);
        } else {
            //Button with text --------------------
            typeButton = 'text';
            children = alignmentWidget(node, children);
        }
    } else {
        //Button with icon
        typeButton = 'icon';
        children = icon;
    }

    if (typeButton === 'icon') {
        children = `\nicon: ${children}`;
    } else {
        children = `\nchild: ${children}`;
    }

    //TODO: Icon button does not support background color
    let buttonStyle = '';
    if (typeButton !== 'icon') {
        buttonStyle = makeElevatedButtonStyleComponent(node);
    }

    let properties = children + onPressed + buttonStyle;
    if (typeButton === 'icon') {
        const padding = flutterPadding(node);
        properties += padding;
    }

    const {width, height, layoutMode} = getLayoutType(node);

    let buttonComponent = '';
    if (typeButton === 'icon') {
        buttonComponent = `IconButton(${properties}\n),`;
    } else {
        buttonComponent = `ElevatedButton(${properties}\n),`;
    }

    if (typeButton === 'icon') {
        buttonComponent = makeIconButtonStyleWrapper(node, buttonComponent);
    }

    const shadow = flutterBoxShadow(node);
    if (shadow !== '' && typeButton !== 'icon') {
        const borderRadius = flutterBorderRadius(node);
        buttonComponent = `Container(\ndecoration: BoxDecoration(${borderRadius}${shadow}\n),\nchild: \n${buttonComponent}\n),`;
    }

    return wrapInteractiveComponent(width, height, layoutMode, buttonComponent, node);
};
