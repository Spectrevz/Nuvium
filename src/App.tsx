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
import { JSX, lazy, LazyExoticComponent, Suspense, useEffect, useRef, useState, useMemo } from 'react';
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
import { theme } from './common/MantineTheme'; // Importa o tema Mantine
import { useAppTheme } from './common/useAppTheme';
import { Window } from '@tauri-apps/api/window';

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

    const { colorScheme, toggleColorScheme } = useAppTheme();

    const [currentWindowLabel, setCurrentWindowLabel] = useState<string | null>(null);

    useEffect(() => {
        const getLabel = async () => {
            const currentWindow = Window.getCurrent();
            const label = await currentWindow.label;
            setCurrentWindowLabel(label);
            console.log('LOG: Janela atual label:', label);
        };
        if (isTauri()) {
            getLabel();
        } else {
            setCurrentWindowLabel('main');
        }
    }, []);


    const views: View[] = [
        {
            type: 'action',
            name: t('Settings'),
            id: 'open-settings-btn',
            className: `action-item action-btn ${classes.actionButton}`,
            action: async () => {
                console.log('LOG: Botão "OpenSettings" clicado.');

                try {
                    const settingsWindow = await WebviewWindow.getByLabel('settings-window');
                    console.log('LOG: Resultado de getByLabel:', settingsWindow);

                    if (settingsWindow) {
                        console.log('LOG: Janela de configurações já existe. Tentando focar.');
                        await settingsWindow.setFocus();
                    } else {
                        console.log('LOG: Janela de configurações NÃO existe. Tentando criar nova janela.');
                        
                        const newWindow = new WebviewWindow('settings-window', {
                            url: '/settings',
                            title: t('Settings'),
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
                    console.error('ERRO GERAL: Exceção síncrona ao tentar abrir/criar janela de configurações:', e);
                    notifications.show({
                        title: t('Error'),
                        message: `ERRO GERAL: ${JSON.stringify(e)}`,
                        color: 'red',
                        autoClose: 5000,
                    });
                }
            }
        },
        {
            type: 'action',
            name: t('Category'),
            id: 'category-btn',
            className: 'action-item action-btn',
            action: async () => {
                // Sua lógica existente aqui
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
        // A rota SettingsPage será carregada dentro da nova janela
        // O App.tsx na nova janela renderizará apenas o conteúdo da rota /settings, sem o AppShell.Navbar/Aside
        {
            type: 'link', // Mantemos SettingsPage como um link para o React Router
            component: SettingsPage,
            path: '/settings',
            name: t('Settings'), // Este 'Settings' é apenas um placeholder de nome para a view, não aparecerá como link na main window
            id: 'settings-view-internal-route', // ID diferente para clareza
            className: '', // Pode ser vazio ou ter classes específicas
        },
    ];

    useHotkeys([['ctrl+J', toggleColorScheme]]);

    const [mobileNavOpened, { toggle: toggleMobileNav }] = useDisclosure();

    const [desktopNavOpenedCookie, setDesktopNavOpenedCookie] = useCookie('desktop-nav-opened', 'true');
    const desktopNavOpened = desktopNavOpenedCookie === 'true';
    const toggleDesktopNav = () => setDesktopNavOpenedCookie(o => o === 'true' ? 'false' : 'true');

    const [scroller, setScroller] = useState<HTMLElement | null>(null);
    const [footersSeen, setFootersSeen, footersSeenLoading] = useLocalForage('footersSeen', {});

    const [navbarClearance, setNavbarClearance] = useState(0);
    const footerRef = useRef<HTMLElement | null>(null);

    // Definição de showFooter usando useMemo para garantir memoização e tipagem consistente
    const FOOTER_KEY = 'footer[0]'; // Mantido aqui para clareza
    const showFooter = useMemo(() => {
        return FOOTER_KEY && !footersSeenLoading && !(FOOTER_KEY in footersSeen);
    }, [FOOTER_KEY, footersSeenLoading, footersSeen]); // Dependências para useMemo

    useEffect(() => {
        // Ajusta a margem do simplebar apenas na janela principal
        const el = document.getElementsByClassName('simplebar-vertical')[0];
        // Adicionada uma verificação robusta para 'el' antes de acessar 'style'
        if (currentWindowLabel === 'main' && el instanceof HTMLElement) {
            el.style.marginTop = usingCustomTitleBar ? '100px' : '70px';
            el.style.marginBottom = showFooter ? '50px' : '0px';
        }
    }, [usingCustomTitleBar, showFooter, currentWindowLabel, FOOTER_KEY]); // FOOTER_KEY adicionado para completar as dependências

    // Condicionalmente renderiza a AppShell.Navbar e AppShell.Aside
    const shouldRenderNavbar = currentWindowLabel === 'main';
    const shouldRenderAside = currentWindowLabel === 'main';

    return (
        <MantineProvider
            theme={theme}
            defaultColorScheme={colorScheme}
        >
            {/* Renderiza TitleBar condicionalmente */}
            {usingCustomTitleBar && shouldRenderNavbar && <TitleBar />}
            <AppShell
                padding="md"
                // Renderiza Navbar condicionalmente
                navbar={shouldRenderNavbar ? {
                    width: 200,
                    breakpoint: 'sm',
                    collapsed: { mobile: !mobileNavOpened, desktop: !desktopNavOpened }
                } : undefined}
                // Renderiza Aside condicionalmente
                aside={shouldRenderAside ? {
                    width: 300,
                    breakpoint: 'md',
                    collapsed: { desktop: false, mobile: true }
                } : undefined}
                className={classes.appShell}
            >
                {/* O conteúdo principal da AppShell.Main sempre é renderizado */}
                <AppShell.Main>
                    {usingCustomTitleBar && shouldRenderNavbar && <Space h="xl" />}
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
                                {/* A rota principal do aplicativo principal deve redirecionar para uma rota de dashboard/home */}
                                {views[0] !== undefined && views[0].type === 'link' && currentWindowLabel === 'main' && (
                                    <Route path="/" element={<Navigate to={views[0].path} />} />
                                )}
                                {/* Renderiza apenas as rotas de link aqui */}
                                {views
                                    .filter(view => view.type === 'link')
                                    .map((view, index) => (
                                        <Route
                                            key={index}
                                            path={view.path}
                                            element={
                                                <Suspense fallback={<FallbackSuspense />}>
                                                    <view.component />
                                                </Suspense>
                                            }
                                        />
                                    ))}
                            </Routes>
                        </ErrorBoundary>

                        <Space h={50} />
                        <ScrollToTop scroller={scroller} bottom={20} />
                    </SimpleBar>
                </AppShell.Main>

                {/* Renderiza AppShell.Navbar condicionalmente */}
                {shouldRenderNavbar && (
                    <AppShell.Navbar
                        className={classes.titleBarAdjustedHeight}
                        h="100%"
                        w={{ sm: 200 }}
                        p="xs"
                        hidden={!mobileNavOpened}
                    >
                        <AppShell.Section grow>
                            {/* Renderiza apenas os links de navegação para a janela principal */}
                            {views
                                .filter(view => view.type === 'action' || view.type === 'link') // Inclui ambos para a navegação
                                .map((view, index) => {
                                    if (view.type === 'link' && view.path === '/settings') {
                                        return null; // Não renderiza o link Settings na Navbar
                                    }
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
                                                key={index} // Adicionado key para elementos mapeados
                                            >
                                                <Group><Text>{view.name}</Text></Group>
                                            </Button>
                                        );
                                    }
                                    return null;
                                })}
                        </AppShell.Section>
                        <AppShell.Section>
                            <Space h={navbarClearance} />
                        </AppShell.Section>
                    </AppShell.Navbar>
                )}
            </AppShell>
        </MantineProvider>
    );
}
