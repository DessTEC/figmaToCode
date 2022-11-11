import {findNodeInSubtreeByType, getFlutterColor} from './utils';

export const flutterIcon = (node: any): string => {
    const iconMaterial = findNodeInSubtreeByType(node, 'VECTOR');
    if (iconMaterial !== null && iconMaterial.visible) {
        let color = '';
        if (iconMaterial.fills !== null && iconMaterial.fills.length > 0) {
            color = `\ncolor: Color(${getFlutterColor(iconMaterial.fills[0])}),`;
        } else {
            color = `\ncolor: Colors.transparent,`;
        }

        return `Icon(\nIcons.${iconMaterial.name},${color}\n),`;
    }

    return '';
};
