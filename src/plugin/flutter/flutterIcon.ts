import {findNodeInSubtreeByType, getFlutterColor, getScreenParent, indentString} from './utils';

export const flutterIcon = (node: any): string => {
    const iconMaterial = findNodeInSubtreeByType(node, 'VECTOR');
    if (iconMaterial !== null && iconMaterial.visible) {
        let color = '';
        if (iconMaterial.fills !== null && iconMaterial.fills.length > 0) {
            color = `\ncolor: Color(${getFlutterColor(iconMaterial.fills[0])}),`;
        } else if (iconMaterial.strokes !== null && iconMaterial.strokes.length > 0) {
            color = `\ncolor: Color(${getFlutterColor(iconMaterial.strokes[0])}),`;
        } else {
            color = `\ncolor: Colors.transparent,`;
        }

        const parent = getScreenParent(node);

        // Icon material is a vector wrapped in a component, take the size of the component if it is an Icon component
        // because some icons are composed by multiple vectors of different sizes, if not, use the vector itself
        const sizeNode = iconMaterial.parent.name.includes('Icon') ? iconMaterial.parent : iconMaterial;

        // All icons should have square dimensions, but this is a precaution
        const size = sizeNode.width > sizeNode.height ? sizeNode.width : sizeNode.height;
        const icon = `Icon(\n${indentString(`Icons.${iconMaterial.name},${color}\nsize: ${size}`)}\n),`;

        // Icons in text field do not require fitted box
        if (node.name.includes('Input')) {
            return icon;
        }

        return `FittedBox(\n${indentString(`fit: BoxFit.contain, \nchild: ${icon}`)}\n),`;
    }

    return '';
};
