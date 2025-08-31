import {
	AppShell,
	Burger,
	Button,
	Group,
	Space,
	Text,
	MantineProvider,
	MultiSelect,
	MultiSelectProps,
	Box,
	Avatar,
} from "@mantine/core";
import { useDisclosure, useHotkeys } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { isTauri } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import {
	getCurrentWebviewWindow,
	WebviewWindow,
} from "@tauri-apps/api/webviewWindow";
import { Window } from "@tauri-apps/api/window";
import * as tauriLogger from "@tauri-apps/plugin-log";
import { relaunch } from "@tauri-apps/plugin-process";
import { open } from "@tauri-apps/plugin-dialog";
import * as tauriUpdater from "@tauri-apps/plugin-updater";
import {
	JSX,
	lazy,
	LazyExoticComponent,
	Suspense,
	useEffect,
	useRef,
	useState,
	useMemo,
} from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useTranslation } from "react-i18next";
import { Navigate, NavLink, Route, Routes } from "react-router-dom";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import classes from "./assets/styles/App.module.css";
import { useCookie, useLocalForage } from "./common/utils";
import { ScrollToTop } from "./components/ScrollToTop";
import { useTauriContext } from "./tauri/TauriProvider";
import { TitleBar } from "./tauri/TitleBar";
import FallbackAppRender from "./views/FallbackErrorBoundary";
import FallbackSuspense from "./views/FallbackSuspense";
import "./assets/styles/global.css";
import { theme } from "./common/MantineTheme";
import { useAppTheme } from "./common/useAppTheme";
import CategorySelector from "./components/buttons/categoryselector";
import Settingsbtn from "./components/buttons/settingsbtn";
import Cloudsearchbtn from "./components/buttons/cloudsearchbtn";
import Card from "./components/buttons/dragdrop";
import Archiveselec from "./components/buttons/archiveselec";

const SettingsPage = lazy(() => import("./views/Settings"));

interface LinkView {
	type: "link";
	component: (() => JSX.Element) | LazyExoticComponent<() => JSX.Element>;
	path: string;
	exact?: boolean;
	name: string;
	classname: string;
	id: string;
}

interface ActionButtonView {
	type: "action";
	action: () => void;
	name: string;
	id: string;
	className: string;
}
interface CustomComponentView {
	type: "custom";
	name: string;
	id: string;
	classname: string;
	render: () => JSX.Element;
}

type View = LinkView | ActionButtonView | CustomComponentView;

export default function App() {
	const { t, i18n } = useTranslation();
	const { usingCustomTitleBar } = useTauriContext();
	const { colorScheme, setColorScheme, toggleColorScheme } = useAppTheme();

	const [currentWindowLabel, setCurrentWindowLabel] = useState<string | null>(
		null
	);
	const [categoryValue, setCategoryValue] = useState<string[]>([]);

	useEffect(() => {
		const getLabel = async () => {
			const currentWindow = Window.getCurrent();
			const label = await currentWindow.label;
			setCurrentWindowLabel(label);
		};
		if (isTauri()) {
			getLabel();
		} else {
			setCurrentWindowLabel("main");
		}
	}, []);

	useEffect(() => {
		if (currentWindowLabel === "main") {
			console.log(
				"App.tsx: Setting up app_settings_changed listener in main window"
			);
			const unlisten = listen("app_settings_changed", (event) => {
				const { type, value } = event.payload as { type: string; value: any };
				console.log("App.tsx: Received app_settings_changed event:", {
					type,
					value,
				});

				if (type === "theme") {
					setColorScheme(value);
					console.log("App.tsx: Updated theme to:", value);
				} else if (type === "language") {
					i18n.changeLanguage(value);
					console.log("App.tsx: Updated language to:", value);
				}
			});

			return () => {
				console.log("App.tsx: Cleaning up app_settings_changed listener");
				unlisten.then((f) => f());
			};
		}
	}, [currentWindowLabel, setColorScheme, i18n]);

	const views: View[] = [
		{
			type: "action",
			name: t("Settings"),
			id: "open-settings-btn",
			className: `action-item action-btn ${classes.actionButton}`,
			action: async () => {
				console.log("App.tsx: OpenSettings button clicked");
				try {
					const settingsWindow = await WebviewWindow.getByLabel(
						"settings-window"
					);
					console.log("App.tsx: Result of getByLabel:", settingsWindow);

					if (settingsWindow) {
						console.log("App.tsx: Settings window already exists. Focusing.");
						await settingsWindow.setFocus();
					} else {
						console.log("App.tsx: Creating new settings window");
						const newWindow = new WebviewWindow("settings-window", {
							url: "/settings",
							title: t("Settings"),
							width: 700,
							height: 600,
							minWidth: 600,
							minHeight: 500,
							center: true,
							resizable: true,
							decorations: true,
						});
					}
				} catch (e) {
					console.error("App.tsx: Error opening/creating settings window:", e);
				}
			},
		},
		{
			type: "action",
			name: t("Search"),
			id: "Cloudsearchbtn",
			className: "action-item action-btn",
			action: async () => {
				// função que pesquisa na nuvem usando configuração do usuário
			},
		},
		{
			type: "custom",
			name: t("Category"),
			id: "category-btn",
			classname: "action-item action-btn",
			render: () => <CategorySelector />,
		},
		{
			type: "action",
			name: t("Selectfiles"),
			id: "archiveselec",
			className: "action-item action-btn",
			action: async () => {
				try {
					const selected = await open({
						multiple: true,
						title: t("Selectfiles"),
						directory: false,
						filters: [
							{ name: "Text Files", extensions: ["txt", "md"] },
							{
								name: "Image Files",
								extensions: ["png", "jpeg", "jpg", "gif"],
							},
							{ name: "All Files", extensions: ["*"] },
						],
					});
					if (selected) {
						const filePath = Array.isArray(selected) ? selected[0] : selected;
						notifications.show({
							title: t("Success"),
							message: t("Fileselectedsuccess"),
							color: "green",
							autoClose: 3000,
						});
					} else {
						notifications.show({
							title: t("canceled"),
							message: t("opercanceled"),
							color: "blue",
							autoClose: 2000,
						});
					}
				} catch (error) {
					notifications.show({
						title: t("Error"),
						message: t("errorselecting"),
						color: "red",
						autoClose: 5000,
					});
				}
			},
		},
		{
			type: "link",
			component: SettingsPage,
			path: "/settings",
			name: t("Settings"),
			id: "settings-view-internal-route",
			classname: "",
		},
		{
			type: "action",
			name: t("Drop"),
			id: "Card",
			className: "action-item action-btn",
			action: async () => {},
		},
	];

	useHotkeys([["ctrl+J", toggleColorScheme]]);

	const [mobileNavOpened, { toggle: toggleMobileNav }] = useDisclosure();
	const [desktopNavOpenedCookie, setDesktopNavOpenedCookie] = useCookie(
		"desktop-nav-opened",
		"true"
	);
	const desktopNavOpened = desktopNavOpenedCookie === "true";
	const toggleDesktopNav = () =>
		setDesktopNavOpenedCookie((o) => (o === "true" ? "false" : "true"));

	const [scroller, setScroller] = useState<HTMLElement | null>(null);
	const [footersSeen, setFootersSeen, footersSeenLoading] = useLocalForage(
		"footersSeen",
		{}
	);

	const [navbarClearance, setNavbarClearance] = useState(0);
	const footerRef = useRef<HTMLElement | null>(null);

	const FOOTER_KEY = "footer[0]";
	const showFooter = useMemo(() => {
		return FOOTER_KEY && !footersSeenLoading && !(FOOTER_KEY in footersSeen);
	}, [FOOTER_KEY, footersSeenLoading, footersSeen]);

	useEffect(() => {
		const el = document.getElementsByClassName("simplebar-vertical")[0];
		if (currentWindowLabel === "main" && el instanceof HTMLElement) {
			el.style.marginTop = usingCustomTitleBar ? "100px" : "70px";
			el.style.marginBottom = showFooter ? "50px" : "0px";
		}
	}, [usingCustomTitleBar, showFooter, currentWindowLabel, FOOTER_KEY]);

	const shouldRenderNavbar = currentWindowLabel === "main";
	const shouldRenderAside = currentWindowLabel === "main";

	return (
		<MantineProvider theme={theme} forceColorScheme={colorScheme}>
			{usingCustomTitleBar && shouldRenderNavbar && <TitleBar />}
			<AppShell
				padding="md"
				navbar={
					shouldRenderNavbar
						? {
								width: 200,
								breakpoint: "sm",
								collapsed: {
									mobile: !mobileNavOpened,
									desktop: !desktopNavOpened,
								},
						  }
						: undefined
				}
				aside={
					shouldRenderAside
						? {
								width: 300,
								breakpoint: "md",
								collapsed: { desktop: false, mobile: true },
						  }
						: undefined
				}
				className={classes.appShell}
			>
				<AppShell.Main>
					{usingCustomTitleBar && shouldRenderNavbar && <Space h="xl" />}
					<SimpleBar
						scrollableNodeProps={{ ref: setScroller }}
						autoHide={false}
						className={classes.simpleBar}
					>
						<ErrorBoundary
							FallbackComponent={FallbackAppRender}
							onError={(e) => tauriLogger.error(e.message)}
						>
							<Routes>
								{views[0] !== undefined &&
									views[0].type === "link" &&
									currentWindowLabel === "main" && (
										<Route path="/" element={<Navigate to={views[0].path} />} />
									)}
								{views
									.filter((view) => view.type === "link")
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

				{shouldRenderNavbar && (
					<AppShell.Navbar
						className={classes.titleBarAdjustedHeight}
						h="100%"
						w={{ sm: 200 }}
						p="xs"
						hidden={!mobileNavOpened}
					>
						<AppShell.Section>
							{views.map((view, index) => {
								if (view.type === "action") {
									const combinedClassNames = `${classes.actionButton || ""} ${
										view.className || ""
									}`;
									if (view.id === "open-settings-btn") {
										return (
											<Settingsbtn
												key={index}
												text={view.name}
												onClick={() => {
													view.action();
													toggleMobileNav();
												}}
											/>
										);
									}
								}
								return null;
							})}
						</AppShell.Section>
						<AppShell.Section mb="md">
							<Group justify="center" mt="md">
								<Avatar
									src="/path/to/user-profile.jpg" // Substitua pelo caminho real da imagem
									alt="User avatar"
									size="lg"
									radius="xl"
								/>
							</Group>
							<Text ta="center" size="sm" mt="xs">
								User
							</Text>
						</AppShell.Section>
						<AppShell.Section grow>
							{views
								.filter(
									(view) =>
										(view.type === "action" ||
											view.type === "link" ||
											view.type === "custom") &&
										view.id !== "open-settings-btn"
								)
								.map((view, index) => {
									if (view.type === "link" && view.path === "/settings") {
										return null;
									}
									if (view.type === "link") {
										const combinedClassNames = `${classes.navLink || ""} ${
											view.classname || ""
										}`.trim();
										return (
											<NavLink
												id={view.id}
												className={combinedClassNames}
												to={view.path}
												key={index}
												end={view.exact}
												onClick={() => toggleMobileNav()}
											>
												<Group>
													<Text>{view.name}</Text>
												</Group>
											</NavLink>
										);
									} else if (view.type === "action") {
										const combinedClassNames = `${classes.actionButton || ""} ${
											view.className || ""
										}`.trim();

										if (view.id === "open-settings-btn") {
											// Use SettingsButton for the "Settings" action
											return (
												<Settingsbtn
													key={index}
													text={view.name}
													onClick={() => {
														view.action();
														toggleMobileNav();
													}}
												/>
											);
										} //configura
										else if (view.id === "Cloudsearchbtn") {
											return (
												<Cloudsearchbtn
													key={index}
													text={view.name}
													onClick={() => {
														view.action();
														toggleMobileNav();
													}}
												/>
											);
										} else if (view.id === "Card") {
											return (
												<Card
													key={index}
													text={view.name}
													onClick={() => {
														view.action();
														toggleMobileNav();
													}}
												/>
											);
										} else if (view.id === "archiveselec") {
											return (
												<Archiveselec
													key={index}
													text={view.name}
													onClick={() => {
														view.action();
														toggleMobileNav();
													}}
												/>
											);
										} else {
											// Use Mantine Button for other actions
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
													key={index}
												>
													<Group>
														<Text>{view.name}</Text>
													</Group>
												</Button>
											);
										}
									} else if (view.type === "custom") {
										if (view.id === "category-btn") {
											return (
												<Box key={index} p="xs">
													{view.render()}
												</Box>
											);
										}
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
