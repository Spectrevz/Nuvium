import {
    Box,
    Text,
    Title,
    Paper,
    Tabs,
    Group,
    // REMOVIDO: ActionIcon, useMantineColorScheme, useComputedColorScheme não são mais necessários aqui
    Button
} from '@mantine/core';
import { useTranslation } from 'react-i18next';
// REMOVIDO: BsMoonStarsFill e IoSunnySharp não são mais usados nesta abordagem de botões
import LanguageHeaders from '../components/LanguageHeaders';
import { useAppTheme } from '../common/useAppTheme'; // NOVO: Importa o hook customizado de tema

/**
 * Componente da página de configurações.
 * Este componente será carregado dentro da nova janela Tauri.
 */
export default function SettingsPage() {
    const { t } = useTranslation();
    // MODIFICADO: Agora você usa o seu hook useAppTheme
    const { colorScheme, setColorScheme } = useAppTheme();

    return (
        <Box p="md"> {/* Container principal com preenchimento */}
            <Paper withBorder shadow="sm" p="lg" radius="md"> {/* Um cartão para agrupar o conteúdo */}
                <Title order={1} mb="md">{t('Settings')}</Title> {/* Título da página de configurações */}

                {/* Componente Tabs para navegação entre as seções */}
                <Tabs defaultValue="theme"> {/* 'theme' é a aba padrão ao carregar */}
                    <Tabs.List>
                        <Tabs.Tab value="theme">{t('Theme')}</Tabs.Tab>
                        <Tabs.Tab value="languages">{t('Languages')}</Tabs.Tab>
                        <Tabs.Tab value="about">{t('About')}</Tabs.Tab>
                    </Tabs.List>

                    {/* Conteúdo da aba "Theme" */}
                    <Tabs.Panel value="theme" p="md">
                        <Title order={3} mb="sm">{t('Appearance')}</Title>
                        <Group>
                            <Text>{t('Choose theme')}:</Text> {/* MODIFICADO: Texto mais claro para a escolha de tema */}
                            <Button
                                onClick={() => setColorScheme('light')} // Chama setColorScheme do seu hook useAppTheme
                                variant={colorScheme === 'light' ? 'filled' : 'outline'} // Usa colorScheme do seu hook
                            >
                                {t('White Theme')}
                            </Button>
                            <Button
                                onClick={() => setColorScheme('dark')} // Chama setColorScheme do seu hook useAppTheme
                                variant={colorScheme === 'dark' ? 'filled' : 'outline'} // Usa colorScheme do seu hook
                            >
                                {t('Black Theme')}
                            </Button>
                        </Group>
                    </Tabs.Panel>

                    {/* Conteúdo da aba "Languages" */}
                    <Tabs.Panel value="languages" p="md">
                        <Title order={3} mb="sm">{t('Select Language')}</Title>
                        <LanguageHeaders /> {/* Reutiliza seu componente de seleção de idioma */}
                    </Tabs.Panel>

                    {/* Conteúdo da aba "About" */}
                    <Tabs.Panel value="about" p="md">
                        <Title order={3} mb="sm">{t('About Nuvium')}</Title> {/* MODIFICADO: 'About Nuvium' para 'About this App' para ser mais genérico */}
                        <Text>{t('AppDescription')}</Text>
                        <Text mt="sm">{t('Version')}: 0.0.1</Text>
                        <Text>{t('Developed by')}: Spectrevz</Text>
                    </Tabs.Panel>
                </Tabs>
            </Paper>
        </Box>
    );
}
