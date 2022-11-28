import {flutterIcon} from './flutterIcon';
import {getLayoutType} from './flutterMain';
import {makeTextComponent} from './flutterTextBuilder';
import {
    findNodeInSubtreeByName,
    findNodeInSubtreeByType,
    indentString,
    makeContainerWithStyle,
    wrapInteractiveComponent,
} from './utils';

export const flutterDropdown = (node: InstanceNode | ComponentNode): string => {
    const textNode = findNodeInSubtreeByType(node, 'TEXT');
    const boxNode = findNodeInSubtreeByName(node, 'DropdownBox');

    const onChanged = `\nonChanged: (value){},`;
    const underline = '\nunderline: SizedBox(),';
    const isExpanded = `\nisExpanded: true,`;
    const textComp = makeTextComponent(textNode);

    const dropItem = `DropdownMenuItem(\n${indentString(`child: ${textComp}`)}\n)`;
    const items = `\nitems: [\n${indentString(dropItem)}\n],`;
    const iconComp = flutterIcon(node);

    let iconDrop = '';
    if (iconComp !== '') {
        iconDrop = `\nicon: ${iconComp}`;
    }

    let dropComp = `DropdownButton(${indentString(`${iconDrop}${items}${onChanged}${underline}${isExpanded}`)}\n),`;
    dropComp = makeContainerWithStyle(boxNode, dropComp);

    const {width, height, layoutMode} = getLayoutType(node);

    return wrapInteractiveComponent(width, height, layoutMode, dropComp, node);
};
