import { ActionIcon, AppShell, Burger, Button, Group, Space, Text, useComputedColorScheme, useMantineColorScheme } from '@mantine/core';
import { useDisclosure, useHotkeys } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { isTauri } from '@tauri-apps/api/core';
import * as tauriEvent from '@tauri-apps/api/event';
import { getCurrentWebviewWindow, WebviewWindow } from '@tauri-apps/api/webviewWindow';
import * as tauriLogger from '@tauri-apps/plugin-log';
import { relaunch } from '@tauri-apps/plugin-process';
import { open } from '@tauri-apps/plugin-dialog'; // <-- Corrigido: Importando a função 'open' do plugin dialog
import * as tauriUpdater from '@tauri-apps/plugin-updater';
import { JSX, lazy, LazyExoticComponent, Suspense, useEffect, useRef, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useTranslation } from 'react-i18next';
import { BsMoonStarsFill } from 'react-icons/bs';
import { ImCross } from 'react-icons/im';
import { IoSunnySharp } from 'react-icons/io5';
import { Navigate, NavLink, Route, Routes } from 'react-router-dom';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import classes from './assets/styles/App.module.css';
import { useCookie, useLocalForage } from './common/utils';
import LanguageHeaders from './components/LanguageHeaders';
import { ScrollToTop } from './components/ScrollToTop';
import { useTauriContext } from './tauri/TauriProvider';
import { TitleBar } from './tauri/TitleBar';
import FallbackAppRender from './views/FallbackErrorBoundary';
import FallbackSuspense from './views/FallbackSuspense';
import { text } from 'stream/consumers';
import './assets/styles/global.css';
import { MantineProvider } from '@mantine/core';
import { theme } from './common/Mantinetheme'; // Importa o tema Mantine
import { useAppTheme } from './common/useAppTheme';

const SettingsPage = lazy(() => import('./views/Settings'));


interface LinkView {
    type: 'link';
    component: (() => JSX.Element) | LazyExoticComponent<() => JSX.Element>;
    path: string;
    exact?: boolean;
    name: string;
    id: string;
    className: string;
}

interface ActionButtonView {
    type: 'action';
    action: () => void;
    name: string;
    id: string;
    className: string;
}

type View = LinkView | ActionButtonView;

export default function App() {
    const { t } = useTranslation();
    const { usingCustomTitleBar } = useTauriContext();

    // NOVO: Use o hook customizado para gerenciar o tema
    const { colorScheme, toggleColorScheme } = useAppTheme(); // colorScheme agora vem do nosso hook

    const views: View[] = [
        {
            type: 'action',
            name: t('Settings'),
            id: 'open-settings-btn',
            className: `action-item action-btn ${classes.actionButton}`,
            action: async () => {
                try {
                    const settingsWindow = await WebviewWindow.getByLabel('settings-window');
                    if (settingsWindow) {
                        await settingsWindow.setFocus(); // Usa setFocus() no objeto WebviewWindow
                    } else {
                        // O construtor WebviewWindow retorna um objeto WebviewWindow, não uma Promise
                        const newWindow = new WebviewWindow('settings-window', {
                            url: '/settings', // Esta URL é relativa ao devUrl ou frontendDist
                            title: t('Settings'), // Título da nova janela
                            width: 700,
                            height: 600,
                            minWidth: 600,
                            minHeight: 500,
                            center: true,
                            resizable: true,
                            decorations: true
                            });
                        }
                } catch (e) {
                    console.error('ERROR: Exceção síncrona ao tentar abrir/criar janela de configurações:', e);
                }
            }
        },
        {
            type: 'action',
            name: t('Category'),
            id: 'category-btn',
            className: 'action-item action-btn',
            action: async () => {
                
            }
        },
        {
            type: 'action',
            name: t('OpenFileSearcher'),
            id: 'file-search-btn',
            className: 'action-item action-btn',
            action: async () => {
                try {
                    const selected = await open({
                        multiple: true,
                        title: t('Selectfiles'),
                        directory: false,
                        filters: [
                            { name: 'Text Files', extensions: ['txt', 'md'] },
                            { name: 'Image Files', extensions: ['png', 'jpeg', 'jpg', 'gif'] },
                            { name: 'All Files', extensions: ['*'] }
                        ]
                    });
                    if (selected) {
                        const filePath = Array.isArray(selected) ? selected[0] : selected;
                        notifications.show({
                            title: t('Success'),
                            message: t('Fileselectedsuccess'),
                            color: 'green',
                            autoClose: 3000,
                        });
                    } else {
                        notifications.show({
                            title: t('canceled'),
                            message: t('opercanceled'),
                            color: 'blue',
                            autoClose: 2000,
                        });
                    }
                } catch (error) {
                    notifications.show({
                        title: t('Error'),
                        message: t('errorselecting'),
                        color: 'red',
                        autoClose: 5000,
                    });
                }
            }
        },
        {
            type: 'link',
            component: SettingsPage,
            path: '/settings',
            name: t('Settings'),
            id: 'settings-view-none',
            className: '',
        },
    ];

    useHotkeys([['ctrl+J', toggleColorScheme]]); // Usa o toggleColorScheme do nosso hook customizado

    const [mobileNavOpened, { toggle: toggleMobileNav }] = useDisclosure();

    const [desktopNavOpenedCookie, setDesktopNavOpenedCookie] = useCookie('desktop-nav-opened', 'true');
    const desktopNavOpened = desktopNavOpenedCookie === 'true';
    const toggleDesktopNav = () => setDesktopNavOpenedCookie(o => o === 'true' ? 'false' : 'true');

    const [scroller, setScroller] = useState<HTMLElement | null>(null);
    const [footersSeen, setFootersSeen, footersSeenLoading] = useLocalForage('footersSeen', {});

    const [navbarClearance, setNavbarClearance] = useState(0);
    const footerRef = useRef<HTMLElement | null>(null);
    useEffect(() => {
        if (footerRef.current) setNavbarClearance(footerRef.current.clientHeight);
    }, [footersSeen]);

    if (isTauri()) {
        useEffect(() => {
            const promise = tauriEvent.listen('longRunningThread', ({ payload }: { payload: any }) => {
                tauriLogger.info(payload.message);
            });
            return () => { promise.then(unlisten => unlisten()) };
        }, []);
        useEffect(() => {
            const promise = tauriEvent.listen('systemTray', ({ payload, ...eventObj }: { payload: { message: string } }) => {
                tauriLogger.info(payload.message);
                notifications.show({
                    title: '[DEBUG] System Tray Event',
                    message: payload.message
                });
            });
            return () => { promise.then(unlisten => unlisten()) };
        }, []);

        useEffect(() => {
            (async () => {
                const update = await tauriUpdater.check();
                if (update) {
                    // Usa o colorScheme do nosso hook customizado para a cor da notificação
                    const color = colorScheme === 'dark' ? 'teal' : 'teal.8';
                    notifications.show({
                        id: 'UPDATE_NOTIF',
                        title: t('updateAvailable', { v: update.version }),
                        color,
                        message: <>
                            <Text>{update.body}</Text>
                            <Button color={color} style={{ width: '100%' }} onClick={() => update.downloadAndInstall(event => {
                                switch (event.event) {
                                    case 'Started':
                                        notifications.show({ title: t('installingUpdate', { v: update.version }), message: t('relaunchMsg'), autoClose: false });
                                        break;
                                    case 'Progress':
                                        break;
                                    case 'Finished':
                                        break;
                                }
                            }).then(relaunch)}>{t('installAndRelaunch')}</Button>
                        </>,
                        autoClose: false
                    });
                }
            })()
        }, []);

        useEffect(() => {
            const promise = tauriEvent.listen('newInstance', async ({ payload, ...eventObj }: { payload: { args: string[], cwd: string } }) => {
                const appWindow = getCurrentWebviewWindow();
                if (!(await appWindow.isVisible())) await appWindow.show();

                if (await appWindow.isMinimized()) {
                    await appWindow.unminimize();
                    await appWindow.setFocus();
                }

                let args = payload?.args;
                let cwd = payload?.cwd;
                if (args?.length > 1) {

                }
            });
            return () => { promise.then(unlisten => unlisten()) };
        }, []);
    }

    function NavLinks() {
        return views.map((view, index) => {
            if (view.type === 'link') {
                const combinedClassNames = `${classes.navLink || ''} ${view.className || ''}`.trim();
                return (
                    <NavLink
                        id={view.id}
                        className={combinedClassNames}
                        to={view.path}
                        key={index}
                        end={view.exact}
                        onClick={() => toggleMobileNav()}
                    >
                        <Group><Text>{view.name}</Text></Group>
                    </NavLink>
                );
            } else if (view.type === 'action') {
                const combinedClassNames = `${classes.actionButton || ''} ${view.className || ''}`.trim();
                return (
                    <Button
                        id={view.id}
                        className={combinedClassNames}
                        onClick={() => {
                            view.action();
                            toggleMobileNav();
                        }}
                        variant="subtle"
                        fullWidth
                        justify="flex-start"
                    >
                        <Group><Text>{view.name}</Text></Group>
                    </Button>
                );
            }
            return null;
        });
    }

    const FOOTER_KEY = 'footer[0]';
    const showFooter = FOOTER_KEY && !footersSeenLoading && !(FOOTER_KEY in footersSeen);
    const footerText = t(FOOTER_KEY);

    useEffect(() => {
        const el = document.getElementsByClassName('simplebar-vertical')[0];
        if (el instanceof HTMLElement) {
            el.style.marginTop = usingCustomTitleBar ? '100px' : '70px';
            el.style.marginBottom = showFooter ? '50px' : '0px';
        }
    }, [usingCustomTitleBar, showFooter]);

    return (
        <MantineProvider
            // Aplica o tema personalizado aqui (se você ainda estiver usando-o para componentes Mantine)
            theme={theme}
            // MantineProvider agora usa o colorScheme do nosso hook customizado como padrão
            defaultColorScheme={colorScheme}
            // Não precisamos mais do onColorSchemeChange aqui, pois o hook customizado já gerencia o cookie
        >
            {usingCustomTitleBar && <TitleBar />}
            <AppShell
                padding="md"
                navbar={{
                    width: 200,
                    breakpoint: 'sm',
                    collapsed: { mobile: !mobileNavOpened, desktop: !desktopNavOpened }
                }}
                aside={{
                    width: 300,
                    breakpoint: 'md',
                    collapsed: { desktop: false, mobile: true }
                }}
                className={classes.appShell}
            >
                <AppShell.Main>
                    {usingCustomTitleBar && <Space h="xl" />}
                    <SimpleBar
                        scrollableNodeProps={{ ref: setScroller }}
                        autoHide={false}
                        className={classes.simpleBar}
                    >
                        <ErrorBoundary
                            FallbackComponent={FallbackAppRender}
                            onError={e => tauriLogger.error(e.message)}
                        >
                            <Routes>
                                {views[0] !== undefined && views[0].type === 'link' && (
                                    <Route path="/" element={<Navigate to={views[0].path} />} />
                                )}
                                {views.map((view, index) => (
                                    view.type === 'link' && (
                                        <Route
                                            key={index}
                                            path={view.path}
                                            element={
                                                <Suspense fallback={<FallbackSuspense />}>
                                                    <view.component />
                                                </Suspense>
                                            }
                                        />
                                    )
                                ))}
                            </Routes>
                        </ErrorBoundary>

                        <Space h={50} />
                        <ScrollToTop scroller={scroller} bottom={20} />
                    </SimpleBar>
                </AppShell.Main>

                <AppShell.Navbar
                    className={classes.titleBarAdjustedHeight}
                    h="100%"
                    w={{ sm: 200 }}
                    p="xs"
                    hidden={!mobileNavOpened}
                >
                    <AppShell.Section grow>
                        <NavLinks />
                    </AppShell.Section>
                    <AppShell.Section>
                        <Space h={navbarClearance} />
                    </AppShell.Section>
                </AppShell.Navbar>
            </AppShell>
        </MantineProvider>
    );
}