import {
    indentString,
    figmaRGBToFlutterColor,
    clone,
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
    findNodeInSubtreeByName,
} from './utils';
import {flutterButton} from './flutterButton';
import {makeTextComponent} from './flutterTextBuilder';
import {flutterTextField} from './flutterTextField';
import {flutterIcon} from './flutterIcon';
import {flutterDropdown} from './flutterDropdown';
import {flutterRadio} from './flutterRadio';
import {flutterCheckbox} from './flutterCheckbox';

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
        } else if (node.type === 'LINE') {
            comp += flutterLine(node);
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
            const decorationImage = `\nimage: DecorationImage(${indentString(`${image},\nfit: BoxFit.cover,`)}\n),`;
            const decoration = `\ndecoration: const BoxDecoration(${indentString(decorationImage)}\n),`;
            return `Container(${indentString(`${decoration}\nchild: ${child}`)}\n);`;
        } else {
            const parentScreen = getScreenParent(node);
            const shadow = flutterBoxShadow(node);

            const image = `\nimage: AssetImage("assets/${node.name}.png")`;
            const decorationImage = `\nimage: DecorationImage(${indentString(`${image},\nfit: BoxFit.cover,`)}\n),`;
            const decoration = `\ndecoration: const BoxDecoration(${indentString(`${decorationImage}${shadow}`)}\n),`;
            return `Container(\n${indentString(
                `width: ${getWidthRatioParent(node, parentScreen)},\nheight: ${getHeightRatioParent(
                    node,
                    parentScreen
                )},${decoration}`
            )}\n),`;
        }
    }

    //Define container for more shapes
    return makeContainerWithStyle(node, child);
};

const flutterLine = (node: LineNode): string => {
    const propStrokeColor = getFlutterColor(node.strokes[0]);
    const color = `\ncolor: Color(${propStrokeColor})`;

    const parentScreen = getScreenParent(node);
    let width = getWidthRatioParent(node, parentScreen);
    if (width === 'MediaQuery.of(context).size.width*0.000') {
        width = '1';
    }
    let height = getHeightRatioParent(node, parentScreen);
    if (height === 'MediaQuery.of(context).size.height*0.000') {
        height = '1';
    }
    return `Container(\n${indentString(`width: ${width},\nheight: ${height},${color}`)}\n),`;
};

const flutterContainerDecoration = (node: any): string => {
    //Background image or color
    let background = '';
    if (node.fills.length > 0) {
        //Image as background
        if (node.fills[0].type === 'IMAGE') {
            const image = `\nimage: AssetImage("assets/background.png")`;
            background = `\nimage: DecorationImage(${indentString(`${image},\nfit: BoxFit.cover,`)}\n),`;
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
    return `\ndecoration: BoxDecoration(${indentString(`${background}${border}${borderRadius}${shadow}`)}\n),`;
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
    } else if (nodeName.includes('Radio')) {
        return flutterRadio(node);
    } else if (nodeName.includes('Checkbox')) {
        return flutterCheckbox(node);
    } else {
        return flutterFrame(node);
    }
};

const flutterFloatingActionButton = (node: any): string => {
    let floatingActionButton = '';
    const floatingButtonNode = findNodeInSubtreeByName(node, 'Floating button');

    if (floatingButtonNode !== null) {
        const circle = findNodeInSubtreeByType(floatingButtonNode, 'ELLIPSE');
        const icon = findNodeInSubtreeByType(floatingButtonNode, 'VECTOR');

        //Change this way of generation icon
        const iconResource = `\nchild: const Icon(Icons.${icon.name}),`;
        const onPressed = '\nonPressed: (){},';
        const color = getFlutterColor(circle.fills[0]);
        const backgroundColor = `\nbackgroundColor: Color(${color}),`;

        const properties = backgroundColor + onPressed + iconResource;

        // getLocation of button: startFloat, startTop, endFloat, endTop
        const widthScreen = node.width;
        const heightScreen = node.height;

        const xParent = node.absoluteBoundingBox.x;
        const yParent = node.absoluteBoundingBox.y;

        const xButton = circle.absoluteBoundingBox.x;
        const yButton = circle.absoluteBoundingBox.y;

        // Position based on absolute positions for y and position of circle in row frame for x
        let position = '\nfloatingActionButtonLocation: FloatingActionButtonLocation.';

        if (xButton < xParent + widthScreen / 2 && yButton <= yParent + heightScreen / 2) {
            position += 'startTop,';
        } else if (xButton >= xParent + widthScreen / 2 && yButton <= yParent + heightScreen / 2) {
            position += 'endTop,';
        } else if (xButton < xParent + widthScreen / 2 && yButton > yParent + heightScreen / 2) {
            position += 'startFloat,';
        } else if (xButton >= xParent + widthScreen / 2 && yButton > yParent + heightScreen / 2) {
            position += 'endFloat,';
        }

        floatingActionButton = `\nfloatingActionButton: FloatingActionButton(${indentString(
            properties
        )}\n),${position}`;
    }

    return floatingActionButton;
};

const flutterFrame = (node: any): string => {
    // -------- SCREENS ----------------------------
    if (node.name.includes('SCREEN')) {
        //Convert readonly array to regular array
        const childrenOriginal = node.children.concat();
        //Sort all components in screen vertically
        childrenOriginal.sort((a, b) => (a.y > b.y ? 1 : -1));
        const floatingActionButton = flutterFloatingActionButton(node);

        const children = flutterWidgetGenerator(childrenOriginal);

        //Manage screens with image or color backgrounds
        if (node.backgrounds.length > 0) {
            const background: any = node.backgrounds[0];
            const padding = flutterPadding(node);
            const column = `Column(\n${indentString(`children: <Widget>[\n${indentString(children, 1)}\n]`)}\n)`;
            const container = `Container(\n${indentString(
                `width: ${widthScreen},\nheight: ${heightScreen},${padding}\nchild: ${column}`
            )}\n)`;
            const safeArea = `SafeArea(\n${indentString(`child: ${container}`)}\n)`;
            const childrenListView = `${indentString(safeArea)}`;

            const listView = `ListView(\n${indentString(`children: <Widget>[\n${childrenListView}\n]`)}\n)`;

            switch (background.type) {
                case 'IMAGE': {
                    const scaffold = `Scaffold(\n${indentString(
                        `backgroundColor: Colors.transparent,${floatingActionButton}\nbody: ${listView}`
                    )}\n)`;
                    return flutterContainer(node, scaffold);
                }
                default: {
                    const colorFigma = clone(background.color);
                    colorFigma['a'] = background.opacity;

                    const hexColor = figmaRGBToFlutterColor(colorFigma);
                    return `Scaffold(\n${indentString(
                        `backgroundColor: Color(${hexColor}),${floatingActionButton}\nbody: ${listView}`
                    )}\n);`;
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
        let children = flutterWidgetGenerator(node.children);

        const {width, height, layoutMode} = getLayoutType(node);

        //Get margin relations
        return getLayoutComponent(width, height, layoutMode, children, node);
    }
};

export const getLayoutType = (
    node: FrameNode | InstanceNode | ComponentNode
): {width: string; height: string; layoutMode: string} => {
    const translationDict = {
        1: 'STRETCH',
        0: 'INHERIT',
        STRETCH: 1,
        INHERIT: 0,
    };

    let width = '';
    let height = '';

    const layoutMode = node.layoutMode;
    let layoutGrow = node.layoutGrow;
    const primaryAxisSizingMode = node.primaryAxisSizingMode;
    let layoutAlign = node.layoutAlign;
    const counterAxisSizingMode = node.counterAxisSizingMode;

    let primaryAxis = '';
    let counterAxis = '';

    const parent = node.parent as FrameNode;
    const parentMode = parent.layoutMode;

    // Verify if properties need to be swaped because mismatch in layout mode
    // between parent and child
    // This will change layoutGrow value to layoutAlign equivalent and viceversa
    if (parentMode !== layoutMode) {
        if (layoutGrow === 1 || layoutAlign === 'STRETCH') {
            const temp = layoutGrow;
            layoutGrow = translationDict[layoutAlign];
            layoutAlign = translationDict[temp];
        }
    }

    if (layoutGrow === 1) {
        // Match parent in primary axis of PARENT (verify if it has to be changed)
        primaryAxis = 'MATCH_PARENT';
    } else {
        // This properties are applied to primary axis of current node
        if (primaryAxisSizingMode === 'FIXED') {
            primaryAxis = 'FIXED';
        } else {
            primaryAxis = 'WRAP_CONTENT';
        }
    }

    if (layoutAlign === 'STRETCH') {
        // Match parent in counter axis of PARENT (verify if it has to be changed)
        counterAxis = 'MATCH_PARENT';
    } else {
        if (counterAxisSizingMode === 'FIXED') {
            counterAxis = 'FIXED';
        } else {
            counterAxis = 'WRAP_CONTENT';
        }
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

// Expanded widgets are avoided because of render flex problems
// Currently supporting just Container widgets with measures
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

    // Make layout taking into account primary axis of parent node
    const parent = node.parent as FrameNode;
    const parentMode = parent.layoutMode;

    // Verify if properties need to be swaped because mismatch in layout mode
    // between parent and child
    // This will change layoutGrow value to layoutAlign equivalent and viceversa
    if (parentMode !== layoutMode) {
        if (layoutMode === 'VERTICAL') {
            layoutMode = 'HORIZONTAL';
        } else {
            layoutMode = 'VERTICAL';
        }
    }

    //LAYOUTS INDEPENDENT OF LAYOUTMODE
    if (widthMode === 'WRAP_CONTENT' && heightMode === 'WRAP_CONTENT') {
        return `Container(${indentString(`${padding}${decoration}\nchild: ${makeRowOrColumn(node, children)}`)}\n),`;
    } else if (widthMode === 'FIXED' && heightMode === 'FIXED') {
        return `Container(${indentString(
            `${padding}${decoration}\nwidth: ${getWidthRatioParent(
                node,
                parentScreen
            )},\nheight: ${getHeightRatioParent(node, parentScreen)},\nchild: ${makeRowOrColumn(node, children)}`
        )}\n),`;
    } else if (widthMode === 'WRAP_CONTENT' && heightMode === 'FIXED') {
        return `Container(${indentString(
            `${padding}${decoration}\nheight: ${getHeightRatioParent(node, parentScreen)},\nchild: ${makeRowOrColumn(
                node,
                children
            )}`
        )}\n),`;
    } else if (widthMode === 'FIXED' && heightMode === 'WRAP_CONTENT') {
        return `Container(${indentString(
            `${padding}${decoration}\nwidth: ${getWidthRatioParent(node, parentScreen)},\nchild: ${makeRowOrColumn(
                node,
                children
            )}`
        )}\n),`;
    }

    //VERTICAL LAYOUT
    if (layoutMode === 'VERTICAL') {
        if (widthMode === 'MATCH_PARENT' && heightMode === 'WRAP_CONTENT') {
            return `Container(${indentString(
                `${padding}${decoration}\nwidth: double.infinity,\nchild: ${makeRowOrColumn(node, children)}`
            )}\n),`;
        } else if (widthMode === 'WRAP_CONTENT' && heightMode === 'MATCH_PARENT') {
            const container = `Container(${indentString(
                `${padding}${decoration}\nchild: ${makeRowOrColumn(node, children)}`
            )}\n)`;
            return `Expanded(\n${indentString(`child: ${container}`)}\n),`;
        } else if (widthMode === 'MATCH_PARENT' && heightMode === 'MATCH_PARENT') {
            const container = `Container(${indentString(
                `${padding}${decoration}\nwidth: double.infinity,\nchild: ${makeRowOrColumn(node, children)}`
            )}\n)`;
            return `Expanded(\n${indentString(`child: ${container}`)}\n),`;
        } else if (widthMode === 'MATCH_PARENT' && heightMode === 'FIXED') {
            return `Container(${indentString(
                `${padding}${decoration}\nwidth: double.infinity,\nheight: ${getHeightRatioParent(
                    node,
                    parentScreen
                )},\nchild: ${makeRowOrColumn(node, children)}`
            )}\n),`;
        } else if (widthMode === 'FIXED' && heightMode === 'MATCH_PARENT') {
            const container = `Container(${indentString(
                `${padding}${decoration}\nwidth: ${getWidthRatioParent(node, parentScreen)},\nchild: ${makeRowOrColumn(
                    node,
                    children
                )}`
            )}\n)`;
            return `Expanded(\n${indentString(`child: ${container}`)}\n),`;
        }
    } else {
        //HORIZONTAL LAYOUT
        if (widthMode === 'WRAP_CONTENT' && heightMode === 'MATCH_PARENT') {
            return `Container(${indentString(
                `${padding}${decoration}\nheight: double.infinity,\nchild: ${makeRowOrColumn(node, children)}`
            )}\n),`;
        } else if (widthMode === 'MATCH_PARENT' && heightMode === 'WRAP_CONTENT') {
            const container = `Container(${indentString(
                `${padding}${decoration}\nchild: ${makeRowOrColumn(node, children)}`
            )}\n)`;
            return `Expanded(\n${indentString(`child: ${container}`)}\n),`;
        } else if (widthMode === 'MATCH_PARENT' && heightMode === 'MATCH_PARENT') {
            const container = `Container(${indentString(
                `${padding}${decoration}\nheight: double.infinity,\nchild: ${makeRowOrColumn(node, children)}`
            )}\n)`;
            return `Expanded(\n${indentString(`child: ${container}`)}\n),`;
        } else if (widthMode === 'MATCH_PARENT' && heightMode === 'FIXED') {
            const container = `Container(${indentString(
                `${padding}${decoration}\nheight: ${getHeightRatioParent(
                    node,
                    parentScreen
                )},\nchild: ${makeRowOrColumn(node, children)}`
            )}\n)`;
            return `Expanded(\n${indentString(`child: ${container}`)}\n),`;
        } else if (widthMode === 'FIXED' && heightMode === 'MATCH_PARENT') {
            return `Container(${indentString(
                `${padding}${decoration}\nheight: double.infinity, \nwidth: ${getWidthRatioParent(
                    node,
                    parentScreen
                )},\nchild: ${makeRowOrColumn(node, children)}`
            )}\n),`;
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

    //return `${rowOrColumn}(${indentString(properties, 1)}\n),`;
    const result = `${rowOrColumn}(${indentString(properties, 1)}\n),`;
    // Wrap children in listview if frame needs to be scrollable
    if (node.overflowDirection !== 'NONE') {
        // Only vertical and horizontal scroll supported
        const children = `children: [\n${indentString(result)}\n]`;
        if (node.overflowDirection === 'VERTICAL') {
            return `ListView(\n${indentString(`scrollDirection: Axis.vertical,\n${children}`)}\n),`;
        } else if (node.overflowDirection === 'HORIZONTAL') {
            return `ListView(\n${indentString(`scrollDirection: Axis.horizontal,\n${children}`)}\n),`;
        }
    }

    return result;
};

const flutterText = (node: TextNode): string => {
    const textComp = makeTextComponent(node);
    const fittedBox = `FittedBox(\n${indentString(`fit: BoxFit.scaleDown,\nchild: ${textComp}`)}\n),`;
    return `Flexible(\n${indentString(`child: ${fittedBox}`)}\n),`;
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
                return `\nSizedBox(width: ${widthScreen}*${ratio.toFixed(3)}),`;
            } else {
                // node.parent.layoutMode === "VERTICAL"
                const ratio = node.parent.itemSpacing / parentScreen.height;
                return `\nSizedBox(height: ${heightScreen}*${ratio.toFixed(3)}),`;
            }
        }
    }
    return '';
};
