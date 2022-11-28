export const indentString = (str: string, indentLevel: number = 1): string => {
    // const options = {
    //   includeEmptyLines: false,
    // };

    // const regex = options.includeEmptyLines ? /^/gm : /^(?!\s*$)/gm;
    const regex = /^(?!\s*$)/gm;
    return str.replace(regex, ' '.repeat(indentLevel * 4));
};

export function clone(val: any) {
    if (val !== undefined) {
        return JSON.parse(JSON.stringify(val));
    }
}

// Color utils
const namesRGB = ['r', 'g', 'b'];

export function figmaRGBToWebRGB(color: any): any {
    const rgb = [];

    namesRGB.forEach((e, i) => {
        rgb[i] = Math.round(color[e] * 255);
    });

    if (color['a'] !== undefined) rgb[3] = Math.round(color['a'] * 100) / 100;
    return rgb;
}

export function figmaRGBToFlutterColor(color: any): string {
    let hex = '0x';

    const rgb = figmaRGBToWebRGB(color);
    if (rgb[3] !== undefined) {
        const a = Math.round(rgb[3] * 255).toString(16);
        hex += a;
    }

    hex += ((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).slice(1);

    return hex;
}

export const getFlutterColor = (fill: any): string => {
    const colorFigma = clone(fill.color);
    colorFigma['a'] = fill.opacity;

    return figmaRGBToFlutterColor(colorFigma);
};

export const numToAutoFixed = (num: number): string => {
    return num.toFixed(3).replace(/\.00$/, '');
};

export const commonLetterSpacing = (node: TextNode): number => {
    if (node.letterSpacing !== figma.mixed && Math.round(node.letterSpacing.value) !== 0) {
        if (node.letterSpacing.unit === 'PIXELS') {
            return node.letterSpacing.value;
        } else {
            if (node.fontSize !== figma.mixed) {
                // read [commonLineHeight] comment to understand what is going on here.
                return (node.fontSize * node.letterSpacing.value) / 100;
            }
        }
    }

    return 0;
};

export const findNodeInChildren = (instanceNode: any, nodeType: string): any => {
    // Returning node from forEach gives null
    let child = null;

    instanceNode.children.forEach((node) => {
        if (node.type === nodeType) {
            child = node;
        }
    });

    return child;
};

export const findNodeInSubtreeByName = (instanceNode: any, nodeName: string): any => {
    const coincidences = instanceNode.findAll((n) => n.name === nodeName);
    if (coincidences.length > 0) {
        return coincidences[0];
    } else {
        return null;
    }
};

export const findNodeInSubtreeByType = (instanceNode: any, nodeType: string): any => {
    const coincidences = instanceNode.findAll((n) => n.type === nodeType);
    if (coincidences.length > 0) {
        return coincidences[0];
    } else {
        return null;
    }
};

export const getTextStyle = (node: any): string => {
    // example: text-md
    let styleBuilder = '';

    const color = getFlutterColor(node.fills[0]);

    if (color) {
        styleBuilder += `\ncolor: Color(${color}),`;
    }

    if (node.fontSize !== figma.mixed) {
        styleBuilder += `\nfontSize: ${numToAutoFixed(node.fontSize)},`;
    }

    if (node.textDecoration === 'UNDERLINE') {
        styleBuilder += '\ndecoration: TextDecoration.underline,';
    }

    if (node.fontName !== figma.mixed) {
        const lowercaseStyle = node.fontName.style.toLowerCase();

        if (lowercaseStyle.match('italic')) {
            styleBuilder += '\nfontStyle: FontStyle.italic,';
        }

        // ignore the font-style when regular (default)
        if (!lowercaseStyle.match('regular')) {
            const value = node.fontName.style.replace('italic', '').replace(' ', '').toLowerCase();

            styleBuilder += `\nfontFamily: "${node.fontName.family}",`;
            styleBuilder += `\nfontWeight: FontWeight.w${node.fontWeight},`;
        }
    }

    // todo lineSpacing
    const letterSpacing = commonLetterSpacing(node);
    if (letterSpacing > 0) {
        styleBuilder += `\nletterSpacing: ${numToAutoFixed(letterSpacing)},`;
    }

    return styleBuilder;
};

export const flutterBorderSide = (node: any): string => {
    if (!node.strokes || node.strokes.length === 0) {
        return '';
    }

    // retrieve the stroke color, when existent (returns "" otherwise)

    const propStrokeColor = getFlutterColor(node.strokes[0]);

    // only add strokeWidth when there is a strokeColor (returns "" otherwise)
    const propStrokeWidth = `width: ${numToAutoFixed(node.strokeWeight)}, `;

    // generate the border, when it should exist
    return propStrokeColor && node.strokeWeight
        ? `\nborderSide: BorderSide(color: Color(${propStrokeColor}), ${propStrokeWidth}),`
        : '';
};

export const flutterSide = (node: any): string => {
    if (!node.strokes || node.strokes.length === 0) {
        return '';
    }

    // retrieve the stroke color, when existent (returns "" otherwise)

    const propStrokeColor = getFlutterColor(node.strokes[0]);

    // only add strokeWidth when there is a strokeColor (returns "" otherwise)
    const propStrokeWidth = `width: ${numToAutoFixed(node.strokeWeight)}, `;

    // generate the border, when it should exist
    return propStrokeColor && node.strokeWeight
        ? `\nside: BorderSide(color: Color(${propStrokeColor}), ${propStrokeWidth}),`
        : '';
};

export const flutterBorderRadius = (node: any): string => {
    if (node.cornerRadius === 0 || (node.cornerRadius === undefined && node.topLeftRadius === undefined)) {
        return '';
    }

    return node.cornerRadius !== figma.mixed
        ? `\nborderRadius: BorderRadius.all(Radius.circular(${numToAutoFixed(node.cornerRadius)})),`
        : `\nborderRadius: BorderRadius.only(topLeft: Radius.circular(${numToAutoFixed(
              node.topLeftRadius
          )}), topRight: Radius.circular(${numToAutoFixed(
              node.topRightRadius
          )}), bottomLeft: Radius.circular(${numToAutoFixed(
              node.bottomLeftRadius
          )}), bottomRight: Radius.circular(${numToAutoFixed(node.bottomRightRadius)}), ),`;
};

export const flutterBorder = (node: any): string => {
    if (!node.strokes || node.strokes.length === 0) {
        return '';
    }
    const propStrokeColor = getFlutterColor(node.strokes[0]);

    const borderLeft = `\nleft: BorderSide(\n${indentString(
        `color: Color(${propStrokeColor}),\nwidth: ${numToAutoFixed(node.strokeLeftWeight)}`
    )}\n),`;
    const borderRight = `\nright: BorderSide(\n${indentString(
        `color: Color(${propStrokeColor}),\nwidth: ${numToAutoFixed(node.strokeRightWeight)}`
    )}\n),`;
    const borderTop = `\ntop: BorderSide(\n${indentString(
        `color: Color(${propStrokeColor}),\nwidth: ${numToAutoFixed(node.strokeTopWeight)}`
    )}\n),`;
    const borderBottom = `\nbottom: BorderSide(\n${indentString(
        `color: Color(${propStrokeColor}),\nwidth: ${numToAutoFixed(node.strokeBottomWeight)}`
    )}\n),`;

    return `\nborder: Border(${indentString(`${borderLeft}${borderRight}${borderTop}${borderBottom}`)}\n),`;
};

export const flutterBoxShadow = (node: any): string => {
    let propBoxShadow = '';
    if (node.effects?.length > 0) {
        const dropShadow: Array<ShadowEffect> = node.effects.filter(
            (d): d is ShadowEffect => d.type === 'DROP_SHADOW' && d.visible !== false
        );

        if (dropShadow.length > 0) {
            let boxShadow = '';

            dropShadow.forEach((d: ShadowEffect) => {
                const propColor = figmaRGBToFlutterColor(d.color);
                const color = `\ncolor: Color(${propColor}),`;
                const radius = `\nblurRadius: ${numToAutoFixed(d.radius)},`;
                const offset = `\noffset: Offset(${numToAutoFixed(d.offset.x)}, ${numToAutoFixed(d.offset.y)}),`;

                const property = color + radius + offset;

                boxShadow += `\nBoxShadow(${indentString(property)}\n),`;
            });

            propBoxShadow = `\nboxShadow: [${indentString(boxShadow)}\n],`;
        }
    }
    return propBoxShadow;
};

export const flutterPadding = (node: any): string => {
    const paddingLeft = node.paddingLeft;
    const paddingRight = node.paddingRight;
    const paddingBottom = node.paddingBottom;
    const paddingTop = node.paddingTop;

    if (
        paddingLeft === undefined &&
        paddingRight === undefined &&
        paddingBottom === undefined &&
        paddingTop === undefined
    ) {
        return '\npadding: const EdgeInsets.all(0),';
    }

    if (paddingLeft === 0 && paddingRight === 0 && paddingBottom === 0 && paddingTop === 0) {
        return '\npadding: const EdgeInsets.all(0),';
    }

    return `\npadding: const EdgeInsets.fromLTRB(${paddingLeft}, ${paddingTop}, ${paddingRight}, ${paddingBottom}),`;
};

export const widthScreen = 'MediaQuery.of(context).size.width';
export const heightScreen = 'MediaQuery.of(context).size.height';

export const getWidthRatioParent = (childNode: SceneNode, parentNode: SceneNode): string => {
    const ratio = childNode.width / parentNode.width;
    return `${widthScreen}*${ratio.toFixed(3)}`;
};

export const getHeightRatioParent = (childNode: SceneNode, parentNode: SceneNode): string => {
    const ratio = childNode.height / parentNode.height;
    return `${heightScreen}*${ratio.toFixed(3)}`;
};

export const getVerticalSpacingScreen = (nodeYpos: number, nextYpos: number): string => {
    const spacing = (nextYpos - nodeYpos).toFixed(3);
    return `SizedBox(height: ${spacing}),`;
};

export const getScreenParent = (node: SceneNode): SceneNode => {
    let currentNode = node;
    while (currentNode.parent.type !== 'PAGE') {
        currentNode = currentNode.parent as SceneNode;
    }

    return currentNode;
};

//Node is the main frame of the component
//Interactive component is the actual flutter interactive component
export const wrapInteractiveComponent = (
    widthMode: string,
    heightMode: string,
    layoutMode: string,
    interactiveComponent: string,
    node: FrameNode | InstanceNode | ComponentNode
): string => {
    let comp = '';
    const parentScreen = getScreenParent(node);
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
        return `Container(${indentString(`${padding}\nchild: ${interactiveComponent}`)}\n),`;
    } else if (widthMode === 'FIXED' && heightMode === 'FIXED') {
        return `Container(${indentString(
            `${padding}\nwidth: ${getWidthRatioParent(node, parentScreen)},\nheight: ${getHeightRatioParent(
                node,
                parentScreen
            )},\nchild: ${interactiveComponent}`
        )}\n),`;
    } else if (widthMode === 'WRAP_CONTENT' && heightMode === 'FIXED') {
        return `Container(${indentString(
            `${padding}\nheight: ${getHeightRatioParent(node, parentScreen)},\nchild: ${interactiveComponent}`
        )}\n),`;
    } else if (widthMode === 'FIXED' && heightMode === 'WRAP_CONTENT') {
        return `Container(${indentString(
            `${padding}\nwidth: ${getWidthRatioParent(node, parentScreen)},\nchild: ${interactiveComponent}`
        )}\n),`;
    }

    //VERTICAL LAYOUT
    if (layoutMode === 'VERTICAL') {
        if (widthMode === 'MATCH_PARENT' && heightMode === 'WRAP_CONTENT') {
            return `Container(${indentString(
                `${padding}\nwidth: double.infinity,\nchild: ${interactiveComponent}`
            )}\n),`;
        } else if (widthMode === 'WRAP_CONTENT' && heightMode === 'MATCH_PARENT') {
            const container = `Container(${indentString(`${padding}\nchild: ${interactiveComponent}`)}\n),`;
            return `Expanded(\n${indentString(`child: ${container}`)}\n),`;
        } else if (widthMode === 'MATCH_PARENT' && heightMode === 'MATCH_PARENT') {
            const container = `Container(${indentString(
                `${padding}\nwidth: double.infinity,\nchild: ${interactiveComponent}`
            )}\n),`;
            return `Expanded(\n${indentString(`child: ${container}`)}\n),`;
        } else if (widthMode === 'MATCH_PARENT' && heightMode === 'FIXED') {
            return `Container(${indentString(
                `${padding}\nwidth: double.infinity,\nheight: ${getHeightRatioParent(
                    node,
                    parentScreen
                )},\nchild: ${interactiveComponent}`
            )}\n),`;
        } else if (widthMode === 'FIXED' && heightMode === 'MATCH_PARENT') {
            const container = `Container(${indentString(
                `${padding}\nwidth: ${getWidthRatioParent(node, parentScreen)},\nchild: ${interactiveComponent}`
            )}\n),`;
            return `Expanded(\n${indentString(`child: ${container}`)}\n),`;
        }
    } else {
        //HORIZONTAL LAYOUT
        if (widthMode === 'WRAP_CONTENT' && heightMode === 'MATCH_PARENT') {
            return `Container(${indentString(
                `${padding}\nheight: double.infinity,\nchild: ${interactiveComponent}`
            )}\n),`;
        } else if (widthMode === 'MATCH_PARENT' && heightMode === 'WRAP_CONTENT') {
            const container = `Container(${indentString(`${padding}\nchild: ${interactiveComponent}`)}\n),`;
            return `Expanded(\n${indentString(`child: ${container}`)}\n),`;
        } else if (widthMode === 'MATCH_PARENT' && heightMode === 'MATCH_PARENT') {
            const container = `Container(${indentString(
                `${padding}\nheight: double.infinity,\nchild: ${interactiveComponent}`
            )}\n),`;
            return `Expanded(\n${indentString(`child: ${container}`)}\n),`;
        } else if (widthMode === 'MATCH_PARENT' && heightMode === 'FIXED') {
            const container = `Container(${indentString(
                `${padding}\nheight: ${getHeightRatioParent(node, parentScreen)},\nchild: ${interactiveComponent}`
            )}\n),`;
            return `Expanded(\n${indentString(`child: ${container}`)}\n),`;
        } else if (widthMode === 'FIXED' && heightMode === 'MATCH_PARENT') {
            return `Container(${indentString(
                `${padding}\nheight: double.infinity, \nwidth: ${getWidthRatioParent(
                    node,
                    parentScreen
                )},\nchild: ${interactiveComponent}`
            )}\n),`;
        }
    }

    return comp;
};

export const alignmentWidget = (node: any, child: string): string => {
    let crossAlignType;
    switch (node.counterAxisAlignItems) {
        case 'MIN':
            crossAlignType = -1.0;
            break;
        case 'CENTER':
            crossAlignType = 0.0;
            break;
        case 'MAX':
            crossAlignType = 1.0;
            break;
    }

    let mainAlignType;
    switch (node.primaryAxisAlignItems) {
        case 'MIN':
            mainAlignType = -1.0;
            break;
        case 'CENTER':
            mainAlignType = 0.0;
            break;
        case 'MAX':
            mainAlignType = 1.0;
            break;
        case 'SPACE_BETWEEN':
            mainAlignType = 0.0;
            break;
    }

    const rowOrColumn = node.layoutMode === 'HORIZONTAL' ? 'Row' : 'Column';

    if (rowOrColumn === 'Row') {
        return `Align(\n${indentString(
            `alignment: Alignment(${mainAlignType}, ${crossAlignType}),\nchild: ${child}`
        )}\n),`;
    } else {
        return `Align(\n${indentString(
            `alignment: Alignment(${crossAlignType}, ${mainAlignType}),\nchild: ${child}`
        )}\n),`;
    }
};

export const makeContainerWithStyle = (node: any, child: string): string => {
    let backgroundColor = '';
    if (node.fills !== null && node.fills.length > 0) {
        backgroundColor = `\ncolor: Color(${getFlutterColor(node.fills[0])}),`;
    }

    const borderRadius = flutterBorderRadius(node);
    const border = flutterBorder(node);
    const shadow = flutterBoxShadow(node);
    const padding = flutterPadding(node);
    const propShape = node.type === 'ELLIPSE' ? '\nshape: BoxShape.circle,' : '';

    const propertiesContainer = padding;
    const propertiesDecoration = backgroundColor + borderRadius + border + propShape + shadow;

    if (child !== null && child != '') {
        const decoration = `BoxDecoration(${indentString(`${propertiesDecoration}`)}\n),`;
        return `Container(${indentString(`${propertiesContainer}\ndecoration: ${decoration}\nchild: ${child}`)}\n),`;
    } else {
        // When container does not have child, add a fixed size
        const parentScreen = getScreenParent(node);
        const width = getWidthRatioParent(node, parentScreen);
        const height = getHeightRatioParent(node, parentScreen);
        const decoration = `BoxDecoration(${indentString(`${propertiesDecoration}`)}\n),`;

        return `Container(\n${indentString(
            `width: ${width},\nheight: ${height},${propertiesContainer}\ndecoration: ${decoration}`
        )}\n),`;
    }
};
