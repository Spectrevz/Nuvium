import { ActionIcon, AppShell, Burger, Button, Group, Space, Text, useComputedColorScheme, useMantineColorScheme } from '@mantine/core';
import { useDisclosure, useHotkeys } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { isTauri } from '@tauri-apps/api/core';
import * as tauriEvent from '@tauri-apps/api/event';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
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

// imported views need to be added to the `views` list variable

interface LinkView {
    type: 'link'; // Discriminante: indica que é um link de navegação
    component: (() => JSX.Element) | LazyExoticComponent<() => JSX.Element>;
    path: string;
    exact?: boolean;
    name: string;
    id: string;
    className: string; 
}

interface ActionButtonView {
    type: 'action'; // Discriminante: indica que é um botão de ação
    action: () => void; // Função a ser executada ao clicar no botão
    name: string;
    id: string;
    className: string; 
    // icon?: JSX.Element; Opcional: Você pode adicionar um ícone aqui se quiser ícones para botões de ação
}

// O tipo `View` agora é uma união de `LinkView` e `ActionButtonView`
type View = LinkView | ActionButtonView;
// ---

export default function App() { // Renomeado para 'App' para clareza
    const { t } = useTranslation();
    // check if using custom titlebar to adjust other components
    const { usingCustomTitleBar } = useTauriContext();

    // left sidebar ()
    const views: View[] = [
        {
            type: 'action', // <-- Novo item de ação na sidebar
            name: t('Category'),
            id: 'category-btn',
            className: 'action-item action-btn',
            action: async () => {

            }
        },
        {
            type: 'action', // Indica que este item é um botão de ação
            name: t('OpenFileSearcher'),
            id: 'file-search-btn',
            className: 'action-item action-btn',
            action: async () => { // A função assíncrona que será executada ao clicar no botão
                try {// Chama a função 'open' do plugin de diálogo para abrir o seletor de arquivos
                    const selected = await open({
                        multiple: true, // Define se o usuário pode selecionar múltiplos arquivos (true = pode selecionar vários arquivos)
                        title: t('Selectfiles'), // Título do diálogo, usando tradução
                        directory: false, // Define se o usuário pode selecionar diretórios (false = apenas arquivos)
                        filters: [ // Filtros opcionais para tipos de arquivo
                            {
                                name: 'Text Files',
                                extensions: ['txt', 'md']
                            },
                            {
                                name: 'Image Files',
                                extensions: ['png', 'jpeg', 'jpg', 'gif']
                            },
                            {
                                name: 'All Files',
                                extensions: ['*'] // Permite todos os tipos de arquivo
                            }
                        ]
                    });
                    // Verifica se um arquivo foi realmente selecionado (ou se o usuário cancelou)
                    if (selected) {
                        // 'selected' pode ser uma string (caminho do arquivo) ou um array de strings se multiple: true
                        const filePath = Array.isArray(selected) ? selected[0] : selected;
                        notifications.show({
                            title: t('Success'),
                            message: t('Fileselectedsuccess'), // Mensagem de sucesso
                            color: 'green',
                            autoClose: 3000,
                        });
                    } else {
                        notifications.show({
                            title: t('canceled'),
                            message: t('opercanceled'), // Mensagem se a seleção for cancelada
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

    ];

    const { toggleColorScheme } = useMantineColorScheme();
    const colorScheme = useComputedColorScheme();
    useHotkeys([['ctrl+J', toggleColorScheme]]);

    // opened is for mobile nav
    const [mobileNavOpened, { toggle: toggleMobileNav }] = useDisclosure();

    const [desktopNavOpenedCookie, setDesktopNavOpenedCookie] = useCookie('desktop-nav-opened', 'true');
    const desktopNavOpened = desktopNavOpenedCookie === 'true';
    const toggleDesktopNav = () => setDesktopNavOpenedCookie(o => o === 'true' ? 'false' : 'true');

    const [scroller, setScroller] = useState<HTMLElement | null>(null);
    // load preferences using localForage
    const [footersSeen, setFootersSeen, footersSeenLoading] = useLocalForage('footersSeen', {});

    const [navbarClearance, setNavbarClearance] = useState(0);
    const footerRef = useRef<HTMLElement | null>(null);
    useEffect(() => {
        if (footerRef.current) setNavbarClearance(footerRef.current.clientHeight);
    }, [footersSeen]);


    // Tauri event listeners (run on mount)
    if (isTauri()) {
        useEffect(() => {
            const promise = tauriEvent.listen('longRunningThread', ({ payload }: { payload: any }) => {
                tauriLogger.info(payload.message);
            });
            return () => { promise.then(unlisten => unlisten()) };
        }, []);
        // system tray events
        useEffect(() => {
            const promise = tauriEvent.listen('systemTray', ({ payload, ...eventObj }: { payload: { message: string } }) => {
                tauriLogger.info(payload.message);
                // for debugging purposes only
                notifications.show({
                    title: '[DEBUG] System Tray Event',
                    message: payload.message
                });
            });
            return () => { promise.then(unlisten => unlisten()) };
        }, []);

        // update checker
        useEffect(() => {
            (async () => {
                const update = await tauriUpdater.check();
                if (update) {
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
                                        // contentLength = event.data.contentLength;
                                        // tauriLogger.info(`started downloading ${event.data.contentLength} bytes`);
                                        break;
                                    case 'Progress':
                                        // downloaded += event.data.chunkLength;
                                        // tauriLogger.info(`downloaded ${downloaded} from ${contentLength}`);
                                        break;
                                    case 'Finished':
                                        // tauriLogger.info('download finished');
                                        break;
                                }
                            }).then(relaunch)}>{t('installAndRelaunch')}</Button>
                        </>,
                        autoClose: false
                    });
                }
            })()
        }, []);

        // Handle additional app launches (url, etc.)
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
        // TODO: useHotkeys and abstract this
        return views.map((view, index) => {
            if (view.type === 'link') { // Se for um link de navegação
                return (
                    <NavLink
                        to={view.path}
                        key={index}
                        end={view.exact}
                        onClick={() => toggleMobileNav()}
                    >
                        {/* TODO: Icons */}
                        <Group><Text>{view.name}</Text></Group>
                    </NavLink>
                );
            } else if (view.type === 'action') {
                const combinedClassNames = `${classes.actionButton || ''} ${view.className || ''}`.trim(); // Se for um botão de ação
                return (
                    <Button
                        id={view.id}
                        className={combinedClassNames} 
                        onClick={() => {
                            view.action(); // Executa a ação
                            toggleMobileNav(); // Fecha a sidebar móvel após a ação
                        }}
                        variant="subtle" // Estilo sutil para parecer um link
                        fullWidth // Ocupa a largura total
                        justify="flex-start" // Alinha o texto à esquerda
                    
                    >
                        {/* TODO: Icons for action buttons */}
                        <Group><Text>{view.name}</Text></Group>
                    </Button>
                );
            }
            return null; // Retorna null para tipos desconhecidos
        });
    }

    const FOOTER_KEY = 'footer[0]';
    const showFooter = FOOTER_KEY && !footersSeenLoading && !(FOOTER_KEY in footersSeen);
    // assume key is always available
    const footerText = t(FOOTER_KEY);

    // hack for global styling the vertical simplebar based on state
    useEffect(() => {
        const el = document.getElementsByClassName('simplebar-vertical')[0];
        if (el instanceof HTMLElement) {
            el.style.marginTop = usingCustomTitleBar ? '100px' : '70px';
            el.style.marginBottom = showFooter ? '50px' : '0px';
        }
    }, [usingCustomTitleBar, showFooter]);

    return (
        <>
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
                                {/* Redireciona para a primeira view se nenhuma rota for especificada */}
                                {views[0] !== undefined && views[0].type === 'link' && (
                                    <Route path="/" element={<Navigate to={views[0].path} />} />
                                )}
                                {/* Renderiza todas as views com base na lista 'views' */}
                                {views.map((view, index) => (
                                    view.type === 'link' && ( // Apenas links de navegação são renderizados como rotas
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
        </>
    );
}