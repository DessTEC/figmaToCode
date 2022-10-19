import * as React from 'react';
import '../styles/ui.css';

declare function require(path: string): any;

const App = ({}) => {
    const [code, setCode] = React.useState('');

    const onCreate = () => {
        parent.postMessage({pluginMessage: {type: 'convertFlutter'}}, '*');
    };

    const onCancel = () => {
        parent.postMessage({pluginMessage: {type: 'cancel'}}, '*');
    };

    React.useEffect(() => {
        // This is how we read messages sent from the plugin controller
        window.onmessage = (event) => {
            const {type, message} = event.data.pluginMessage;
            if (type === 'flutterCode') {
                setCode(message);
            }
        };
    }, []);

    return (
        <div>
            <img src={require('../assets/logo.svg')} />
            <h2>Figma to Code</h2>
            <button id="create" onClick={onCreate}>
                Create
            </button>
            <button onClick={onCancel}>Cancel</button>

            <p>Code: </p>
            <pre>
                <code>{code}</code>
            </pre>
        </div>
    );
};

export default App;
