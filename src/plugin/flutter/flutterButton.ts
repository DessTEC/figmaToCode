import {
    alignmentWidget,
    findNodeInSubtreeByType,
    flutterBorderRadius,
    flutterBoxShadow,
    flutterPadding,
    getScreenParent,
    indentString,
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
        let text = textNode.characters;
        if (textNode.textCase === 'LOWER') {
            text = text.toLowerCase();
        } else if (textNode.textCase === 'UPPER') {
            text = text.toUpperCase();
        }

        children = `Text(\n${indentString(
            `r"${text}",\noverflow: TextOverflow.clip,\nsoftWrap: false,${textStyle}`
        )}\n),`;

        if (icon !== '') {
            //Button with text and icon --------------------
            typeButton = 'textIcon';

            const parentScreen = getScreenParent(node);
            const ratio = node.itemSpacing / parentScreen.width;
            //Wrap text in flexible to avoid overflow issues, also added overflow behaviour on text
            children = `Flexible(\n${indentString(`child: ${children}`)}\n),`;
            //Icon - Space - Text
            if (node.children[0].type === 'VECTOR') {
                children = `${icon}\nSizedBox(width: ${widthScreen}*${ratio.toFixed(3)}),\n${children}`;
            } else {
                // Text - Space - Icon
                children = `${children}\nSizedBox(width: ${widthScreen}*${ratio.toFixed(3)}),\n${icon}`;
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
        buttonComponent = `IconButton(${indentString(properties)}\n),`;
    } else {
        buttonComponent = `ElevatedButton(${indentString(properties)}\n),`;
    }

    if (typeButton === 'icon') {
        buttonComponent = makeIconButtonStyleWrapper(node, buttonComponent);
    }

    const shadow = flutterBoxShadow(node);
    if (shadow !== '' && typeButton !== 'icon') {
        const borderRadius = flutterBorderRadius(node);
        const decoration = `BoxDecoration(${indentString(`${borderRadius}${shadow}`)}\n),`;
        buttonComponent = `Container(\n${indentString(`decoration: ${decoration}\nchild: ${buttonComponent}`)}\n),`;
    }

    return wrapInteractiveComponent(width, height, layoutMode, buttonComponent, node);
};
