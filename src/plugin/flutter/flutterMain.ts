import {indentString, figmaRGBToFlutterColor, clone} from '../utils';

export const flutterWidgetGenerator = (sceneNode: ReadonlyArray<SceneNode>): string => {
    let comp = '';

    const sceneLen = sceneNode.length;

    sceneNode.forEach((node, index) => {
        if (node.type === 'RECTANGLE' || node.type === 'ELLIPSE') {
            //comp += flutterContainer(node, "");
        } else if (node.type === 'GROUP') {
            //comp += flutterGroup(node);
        } else if (node.type === 'FRAME') {
            //comp += flutterFrame(node);
            if (node.name.includes('SCREEN')) {
                comp += flutterScreen(node);
            }
        } else if (node.type === 'TEXT') {
            //comp += flutterText(node);
        }

        //   if (index < sceneLen - 1) {
        //     // if the parent is an AutoLayout, and itemSpacing is set, add a SizedBox between items.
        //     // on else, comp += ""
        //     const spacing = addSpacingIfNeeded(node);
        //     if (spacing) {
        //       // comp += "\n";
        //       comp += spacing;
        //     }

        //     // don't add a newline at last element.
        //     comp += "\n";
        //   }
    });

    return comp;
};

const flutterScreen = (node: FrameNode): string => {
    //const properties = `\nbody:[${flutterWidgetGenerator(node.children)}],`;
    const properties = `Container()`;

    //Manage screens with image or color backgrounds
    if (node.backgrounds.length > 0) {
        const background: any = node.backgrounds[0];
        switch (background.type) {
            case 'IMAGE': {
                return `Scaffold(
                    body: Stack(
                        children: <Widget>[
                            Container(
                                decoration: BoxDecoration(
                                    image: DecorationImage(image: AssetImage("assets/logo.png"), fit: BoxFit.cover,),
                                ),
                            ),
                            ${properties}
                        ]
                    )
                    )`;
            }
            default: {
                const colorFigma = clone(background.color);
                colorFigma['a'] = background.opacity;

                const hexColor = figmaRGBToFlutterColor(colorFigma);
                return `Scaffold(
                    backgroundColor: Color(${hexColor}),
                    body: ${properties}
                    )`;
            }
        }
    }
};
