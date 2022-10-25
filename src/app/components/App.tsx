import * as React from 'react';
import '../styles/ui.css';

// ---- UI MATERIAL IMPORTS

/* ----*/ import Tabs from '@mui/material/Tabs';
/* ----*/ import Tab from '@mui/material/Tab';
/* ----*/ import Typography from '@mui/material/Typography';
/* ----*/ import Box from '@mui/material/Box';

// ---- COMPONENT IMPORTS

import TagTab from './Tags';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

declare function require(path: string): any;
function TabPanel(props: TabPanelProps) {
    const {children, value, index, ...other} = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{p: 3}}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

const App = ({}) => {
    const [value, setValue] = React.useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <Box sx={{width: '100%'}}>
            <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                    <Tab label="Tags" {...a11yProps(0)} />
                    <Tab label="Components" {...a11yProps(1)} />
                    <Tab label="Colors" {...a11yProps(2)} />
                </Tabs>
            </Box>
            <TabPanel value={value} index={0}>
                <TagTab />
            </TabPanel>
            <TabPanel value={value} index={1}>
                <div className="code-block">
                    <code>this is some code. Today we will see how to make code blabla</code>
                </div>
            </TabPanel>
            <TabPanel value={value} index={2}>
                <Typography variant="p">Colors tab</Typography>
            </TabPanel>
        </Box>
    );
};

/*     const createModules = ({}) => {

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

        return(
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
        )
    }
 */
export default App;
