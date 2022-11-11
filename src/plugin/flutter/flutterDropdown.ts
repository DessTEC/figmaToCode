import {flutterIcon} from './flutterIcon';
import {makeTextComponent} from './flutterTextBuilder';
import {findNodeInSubtreeByType, makeContainerWithStyle} from './utils';

export const flutterDropdown = (node: InstanceNode | ComponentNode): string => {
    const textNode = findNodeInSubtreeByType(node, 'TEXT');

    const onChanged = `\nonChanged: (value){},`;
    const textComp = makeTextComponent(textNode);
    const items = `\nitems: [DropdownMenuItem(child: \n${textComp}\n)\n],`;
    const iconComp = flutterIcon(node);

    let iconDrop = '';
    if (iconComp !== '') {
        iconDrop = `\nicon: ${iconComp}`;
    }

    const dropComp = `DropdownButton(${iconDrop}${items}${onChanged}\n),`;

    return makeContainerWithStyle(node, dropComp);
};
