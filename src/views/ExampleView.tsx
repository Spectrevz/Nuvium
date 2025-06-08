// component example
import { Anchor, Button, Stack, Text, TextInput, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { invoke, isTauri } from '@tauri-apps/api/core';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import * as fs from '@tauri-apps/plugin-fs';
import { revealItemInDir } from '@tauri-apps/plugin-opener';
import * as shell from '@tauri-apps/plugin-shell';
import { Trans, useTranslation } from 'react-i18next';
import { join, notify } from '../common/utils';
import { createStorage } from '../tauri/storage';
import { APP_NAME, useMinWidth, useTauriContext } from '../tauri/TauriProvider';

function toggleFullscreen() {
	const appWindow = getCurrentWebviewWindow();
	appWindow.isFullscreen().then(x => appWindow.setFullscreen(!x));
}

export default function ExampleView() {
	const { t } = useTranslation();
	const { fileSep, documents, downloads, loading: tauriLoading } = useTauriContext();
	// do not use Tauri variables on the browser target
	const storeName = isTauri() ? join(fileSep, documents!, APP_NAME, 'example_view.dat') : 'example_view';
	// store-plugin will create necessary directories
	const { use: useKVP, loading, data } = createStorage(storeName);
	const [exampleData, setExampleData] = useKVP('exampleKey', '');

	useMinWidth(1000);
	// <> is an alias for <React.Fragment>
	return <Stack>
		
	</Stack>
}
