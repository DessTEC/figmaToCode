import {
    indentString,
    figmaRGBToFlutterColor,
    clone,
    findNodeInChildren,
    getFlutterColor,
    widthScreen,
    getWidthRatioParent,
    getHeightRatioParent,
    getScreenParent,
    flutterBorder,
    flutterBoxShadow,
    flutterBorderRadius,
    flutterPadding,
    heightScreen,
    makeContainerWithStyle,
    findNodeInSubtreeByType,
} from './utils';
import {flutterButton} from './flutterButton';
import {makeTextComponent} from './flutterTextBuilder';
import {flutterTextField} from './flutterTextField';
import {flutterIcon} from './flutterIcon';
import {flutterDropdown} from './flutterDropdown';

export const flutterWidgetGenerator = (sceneNode: ReadonlyArray<SceneNode>): string => {
    let comp = '';

    const sceneLen = sceneNode.length;

    sceneNode.forEach((node, index) => {
        //const previousComp = comp
        if (node.type === 'RECTANGLE' || node.type === 'ELLIPSE') {
            comp += flutterContainer(node, '');
        } else if (node.type === 'GROUP') {
            //comp += flutterGroup(node);
        } else if (node.type === 'FRAME') {
            comp += flutterFrame(node);
        } else if (node.type === 'TEXT') {
            comp += flutterText(node);
            //This will build the interactive widgets
        } else if (node.type === 'INSTANCE') {
            comp += flutterComponent(node);
        } else if (node.type === 'COMPONENT') {
            comp += flutterComponent(node);
        }

        if (index < sceneLen - 1) {
            // if the parent is an AutoLayout, and itemSpacing is set, add a SizedBox between items.
            // on else, comp += ""
            const spacing = addSpacingIfNeeded(node);
            if (spacing) {
                // comp += "\n";
                comp += spacing;
            }
            // don't add a newline at last element.
            comp += '\n';
        }
    });

    return comp;
};

//Used for images and screen background
const flutterContainer = (node: FrameNode | GroupNode | RectangleNode | EllipseNode, child: string): string => {
    if ('fills' in node && node.fills[0].type === 'IMAGE') {
        if (node.name.includes('SCREEN')) {
            const image = `\nimage: AssetImage("assets/background.png")`;
            const decorationImage = `\nimage: DecorationImage(${indentString(image)},\nfit: BoxFit.cover,\n)`;
            const decoration = `\ndecoration: const BoxDecoration(${indentString(decorationImage)}\n),`;
            return `Container(${indentString(decoration)}\nchild: ${child}\n);`;
        } else {
            const parentScreen = getScreenParent(node);
            const shadow = flutterBoxShadow(node);

            const image = `\nimage: AssetImage("assets/${node.name}.png")`;
            const decorationImage = `\nimage: DecorationImage(${indentString(image)},\nfit: BoxFit.fill,\n),`;
            const decoration = `\ndecoration: const BoxDecoration(${indentString(decorationImage)}\n${indentString(
                shadow
            )}\n),`;
            return `Container(\nwidth: ${getWidthRatioParent(node, parentScreen)},\nheight: ${getHeightRatioParent(
                node,
                parentScreen
            )},${indentString(decoration)}\n),`;
        }
    }

    //Define container for more shapes
    return makeContainerWithStyle(node, child);
};

const flutterContainerDecoration = (node: any): string => {
    //Background image or color
    let background = '';
    if (node.fills.length > 0) {
        //Image as background
        if (node.fills[0].type === 'IMAGE') {
            const image = `\nimage: AssetImage("assets/background.png")`;
            background = `\nimage: DecorationImage(${indentString(image)},\nfit: BoxFit.cover,\n),`;
            //Color as background
        } else if (node.fills[0].type === 'SOLID') {
            const color = getFlutterColor(node.fills[0]);
            background = `\ncolor: Color(${color}),`;
        }
    }

    //Border sytle
    const border = flutterBorder(node);
    const borderRadius = flutterBorderRadius(node);

    //Shadow style
    const shadow = flutterBoxShadow(node);

    if (background === '' && border === '' && borderRadius === '' && shadow === '') {
        return '';
    }

    //Define container for more shapes
    return `\ndecoration: BoxDecoration(${background}${border}${borderRadius}${shadow}\n),`;
};

const flutterComponent = (node: InstanceNode | ComponentNode): string => {
    const nodeName = node.name;

    if (nodeName.includes('Input')) {
        return flutterTextField(node);
    } else if (nodeName.includes('Button')) {
        return flutterButton(node);
    } else if (nodeName.includes('Icon')) {
        return flutterIcon(node);
    } else if (nodeName.includes('Dropdown')) {
        return flutterDropdown(node);
    } else {
        return flutterFrame(node);
    }
};

const flutterFloatingActionButton = (sceneNode: ReadonlyArray<SceneNode>): string => {
    let floatingActionButton = '';

    sceneNode.forEach((node) => {
        if (node.name.includes('Floating button')) {
            const circle = findNodeInSubtreeByType(node, 'ELLIPSE');
            const icon = findNodeInSubtreeByType(node, 'VECTOR');

            //Change this way of generation icon
            const iconResource = `\nchild: const Icon(Icons.${icon.name}),`;
            const onPressed = '\nonPressed: (){},';
            const color = getFlutterColor(circle.fills[0]);
            const backgroundColor = `\nbackgroundColor: Color(${color}),`;

            const properties = backgroundColor + onPressed + iconResource;

            // getLocation of button: startFloat, startTop, endFloat, endTop

            const parent: SceneNode = node.parent as SceneNode;
            const widthScreen = parent.width;
            const heightScreen = parent.height;

            let position = '\nfloatingActionButtonLocation: FloatingActionButtonLocation.';
            if (node.x < widthScreen / 2 && node.y <= heightScreen / 2) {
                position += 'startTop,';
            } else if (node.x >= widthScreen / 2 && node.y <= heightScreen / 2) {
                position += 'endTop,';
            } else if (node.x < widthScreen / 2 && node.y > heightScreen / 2) {
                position += 'startFloat,';
            } else if (node.x >= widthScreen / 2 && node.y > heightScreen / 2) {
                position += 'endFloat,';
            }

            floatingActionButton = `\nfloatingActionButton: FloatingActionButton(${properties}\n),${position}`;
        }
    });

    return floatingActionButton;
};

const flutterFrame = (node: any): string => {
    // -------- SCREENS ----------------------------
    if (node.name.includes('SCREEN')) {
        //Convert readonly array to regular array
        const childrenOriginal = node.children.concat();
        //Sort all components in screen vertically
        childrenOriginal.sort((a, b) => (a.y > b.y ? 1 : -1));

        const floatingActionButton = flutterFloatingActionButton(childrenOriginal);
        const children = flutterWidgetGenerator(childrenOriginal);

        //Manage screens with image or color backgrounds
        if (node.backgrounds.length > 0) {
            const background: any = node.backgrounds[0];
            const padding = flutterPadding(node);
            const safeArea = `SafeArea(\nchild: Container(\nwidth: ${widthScreen},\nheight: ${heightScreen},${padding}\nchild: Column(\nchildren: <Widget>[\n${indentString(
                children,
                1
            )}\n]\n)\n)\n)`;

            const listView = `ListView(\nchildren: <Widget>[\n${safeArea}\n]\n)`;

            switch (background.type) {
                case 'IMAGE': {
                    const scaffold = `Scaffold(\nbackgroundColor: Colors.transparent,${floatingActionButton}\nbody: ${listView}\n)`;
                    return flutterContainer(node, scaffold);
                }
                default: {
                    const colorFigma = clone(background.color);
                    colorFigma['a'] = background.opacity;

                    const hexColor = figmaRGBToFlutterColor(colorFigma);
                    return `Scaffold(\nbackgroundColor: Color(${hexColor}),${floatingActionButton}\nbody: ${listView}\n);`;
                }
            }
        } else {
            // Screens with no background
            return `Scaffold(
                ${floatingActionButton}
                body: ${children}
                );`;
        }
        // -------- AUTO LAYOUTS ----------------------------
    } else if (node.layoutMode !== 'NONE') {
        const children = flutterWidgetGenerator(node.children);

        const {width, height, layoutMode} = getLayoutType(node);

        //Get margin relations
        return getLayoutComponent(width, height, layoutMode, children, node);
    }
};

export const getLayoutType = (
    node: FrameNode | InstanceNode | ComponentNode
): {width: string; height: string; layoutMode: string} => {
    let width = '';
    let height = '';

    const layoutMode = node.layoutMode;
    const layoutGrow = node.layoutGrow;
    const primaryAxisSizingMode = node.primaryAxisSizingMode;
    const layoutAlign = node.layoutAlign;
    const counterAxisSizingMode = node.counterAxisSizingMode;

    let primaryAxis = '';
    let counterAxis = '';

    //EXAMPLE FOR COLUMNS
    // Height fixed
    if (layoutGrow === 0 && primaryAxisSizingMode === 'FIXED') {
        primaryAxis = 'FIXED';
        // Height hug
    } else if (layoutGrow === 0 && primaryAxisSizingMode === 'AUTO') {
        primaryAxis = 'WRAP_CONTENT';
        // Height fill
    } else if (layoutGrow === 1) {
        primaryAxis = 'MATCH_PARENT';
    }

    // Width fixed
    if (layoutAlign === 'INHERIT' && counterAxisSizingMode === 'FIXED') {
        counterAxis = 'FIXED';
        // Width hug
    } else if (layoutAlign === 'INHERIT' && counterAxisSizingMode === 'AUTO') {
        counterAxis = 'WRAP_CONTENT';
        // Width fill
    } else if (layoutAlign === 'STRETCH') {
        counterAxis = 'MATCH_PARENT';
    }

    if (layoutMode === 'VERTICAL') {
        //COLUMNS
        height = primaryAxis;
        width = counterAxis;
    } else {
        //ROWS
        width = primaryAxis;
        height = counterAxis;
    }

    return {width, height, layoutMode};
};

export const getLayoutComponent = (
    widthMode: string,
    heightMode: string,
    layoutMode: string,
    children: string,
    node: FrameNode | InstanceNode | ComponentNode
): string => {
    let comp = '';
    const parentScreen = getScreenParent(node);

    //Get styles of containers
    const decoration = flutterContainerDecoration(node);
    const padding = flutterPadding(node);

    console.log(widthMode);
    console.log(heightMode);
    console.log(layoutMode);

    //LAYOUTS INDEPENDENT OF LAYOUTMODE
    if (widthMode === 'WRAP_CONTENT' && heightMode === 'WRAP_CONTENT') {
        return `Container(${padding}${decoration}\nchild: ${makeRowOrColumn(node, children)}\n),`;
    } else if (widthMode === 'FIXED' && heightMode === 'FIXED') {
        return `Container(${padding}${decoration}\nwidth: ${getWidthRatioParent(
            node,
            parentScreen
        )},\nheight: ${getHeightRatioParent(node, parentScreen)},\nchild: \n${makeRowOrColumn(node, children)}\n),`;
    } else if (widthMode === 'WRAP_CONTENT' && heightMode === 'FIXED') {
        return `Container(${padding}${decoration}\nheight: ${getHeightRatioParent(
            node,
            parentScreen
        )},\nchild: \n${makeRowOrColumn(node, children)}\n),`;
    } else if (widthMode === 'FIXED' && heightMode === 'WRAP_CONTENT') {
        return `Container(${padding}${decoration}\nwidth: ${getWidthRatioParent(
            node,
            parentScreen
        )},\nchild: ${makeRowOrColumn(node, children)}\n),`;
    }

    //VERTICAL LAYOUT
    if (layoutMode === 'VERTICAL') {
        if (widthMode === 'MATCH_PARENT' && heightMode === 'WRAP_CONTENT') {
            return `Container(${padding}${decoration}\nwidth: double.infinity,\nchild: ${makeRowOrColumn(
                node,
                children
            )}\n),`;
        } else if (widthMode === 'WRAP_CONTENT' && heightMode === 'MATCH_PARENT') {
            return `Expanded(\nchild: Container(${padding}${decoration}\nchild: ${makeRowOrColumn(
                node,
                children
            )}\n)\n),`;
        } else if (widthMode === 'MATCH_PARENT' && heightMode === 'MATCH_PARENT') {
            return `Expanded(\nchild: Container(${padding}${decoration}\nwidth: double.infinity,\nchild: ${makeRowOrColumn(
                node,
                children
            )}\n)\n),`;
        } else if (widthMode === 'MATCH_PARENT' && heightMode === 'FIXED') {
            return `Container(${padding}${decoration}\nwidth: double.infinity,\nheight: ${getHeightRatioParent(
                node,
                parentScreen
            )},\nchild: ${makeRowOrColumn(node, children)}\n),`;
        } else if (widthMode === 'FIXED' && heightMode === 'MATCH_PARENT') {
            return `Expanded(\nchild: Container(${padding}${decoration}\nwidth: ${getWidthRatioParent(
                node,
                parentScreen
            )},\nchild: ${makeRowOrColumn(node, children)}\n)\n),`;
        }
    } else {
        //HORIZONTAL LAYOUT
        if (widthMode === 'WRAP_CONTENT' && heightMode === 'MATCH_PARENT') {
            return `Container(${padding}${decoration}\nheight: double.infinity,\nchild: ${makeRowOrColumn(
                node,
                children
            )}\n),`;
        } else if (widthMode === 'MATCH_PARENT' && heightMode === 'WRAP_CONTENT') {
            return `Expanded(\nchild: Container(${padding}${decoration}\nchild: ${makeRowOrColumn(
                node,
                children
            )}\n)\n),`;
        } else if (widthMode === 'MATCH_PARENT' && heightMode === 'MATCH_PARENT') {
            return `Expanded(\nchild: Container(${padding}${decoration}\nheight: double.infinity,\nchild: ${makeRowOrColumn(
                node,
                children
            )}\n)\n),`;
        } else if (widthMode === 'MATCH_PARENT' && heightMode === 'FIXED') {
            return `Expanded(\nchild: Container(${padding}${decoration}\nheight: ${getHeightRatioParent(
                node,
                parentScreen
            )},\nchild: ${makeRowOrColumn(node, children)}\n)\n),`;
        } else if (widthMode === 'FIXED' && heightMode === 'MATCH_PARENT') {
            return `Container(${padding}${decoration}\nheight: double.infinity, \nwidth: ${getWidthRatioParent(
                node,
                parentScreen
            )},\nchild: ${makeRowOrColumn(node, children)}\n),`;
        }
    }

    return comp;
};

export const makeRowOrColumn = (node: FrameNode | InstanceNode | ComponentNode, children: string): string => {
    // ROW or COLUMN
    const rowOrColumn = node.layoutMode === 'HORIZONTAL' ? 'Row' : 'Column';

    let crossAlignType;
    switch (node.counterAxisAlignItems) {
        case 'MIN':
            crossAlignType = 'start';
            break;
        case 'CENTER':
            crossAlignType = 'center';
            break;
        case 'MAX':
            crossAlignType = 'end';
            break;
    }
    const crossAxisAlignment = `\ncrossAxisAlignment: CrossAxisAlignment.${crossAlignType},`;

    let mainAlignType;
    switch (node.primaryAxisAlignItems) {
        case 'MIN':
            mainAlignType = 'start';
            break;
        case 'CENTER':
            mainAlignType = 'center';
            break;
        case 'MAX':
            mainAlignType = 'end';
            break;
        case 'SPACE_BETWEEN':
            mainAlignType = 'spaceBetween';
            break;
    }
    const mainAxisAlignment = `\nmainAxisAlignment: MainAxisAlignment.${mainAlignType},`;

    let mainAxisSize;
    // The primaryAxisSizingMode is changed in figma with Vertical resizing configs
    if (node.primaryAxisSizingMode === 'AUTO') {
        mainAxisSize = '\nmainAxisSize: MainAxisSize.min,';
    } else {
        mainAxisSize = '\nmainAxisSize: MainAxisSize.max,';
    }

    const properties =
        mainAxisSize +
        mainAxisAlignment +
        crossAxisAlignment +
        `\nchildren:<Widget>[\n${indentString(children, 1)}\n],`;

    return `${rowOrColumn}(${indentString(properties, 1)}\n),`;
};

const flutterText = (node: TextNode): string => {
    const textComp = makeTextComponent(node);
    return `FittedBox(\nfit: BoxFit.scaleDown,\nchild: ${textComp}\n),`;
};

// Aplicable for auto layout frames
const addSpacingIfNeeded = (node: SceneNode): string => {
    const parentScreen = getScreenParent(node);

    if (
        node.parent?.type === 'FRAME' ||
        node.parent?.type === 'COMPONENT' ||
        (node.parent?.type === 'INSTANCE' && node.parent.layoutMode !== 'NONE')
    ) {
        // check if itemSpacing is set and if it isn't the last value.
        // Don't add the SizedBox at last value. In Figma, itemSpacing CAN be negative; here it can't.
        if (node.parent.itemSpacing > 0) {
            if (node.parent.layoutMode === 'HORIZONTAL') {
                const ratio = node.parent.itemSpacing / parentScreen.width;
                return `\nSizedBox(width: ${widthScreen}*${ratio.toFixed(2)}),`;
            } else {
                // node.parent.layoutMode === "VERTICAL"
                const ratio = node.parent.itemSpacing / parentScreen.height;
                return `\nSizedBox(height: ${heightScreen}*${ratio.toFixed(2)}),`;
            }
        }
    }
    return '';
};
