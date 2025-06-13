// src/views/Settings.tsx
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Group,
  Stack,
  Text,
  Box,
  Title,
  Paper,
  Tabs,
} from '@mantine/core';
import { Window } from '@tauri-apps/api/window';
import { emit } from '@tauri-apps/api/event';
import { load } from '@tauri-apps/plugin-store';
import { useAppTheme } from '../common/useAppTheme';
import { resources, defaultLng } from '../translations/i18n';
import packageJson from '../../package.json';

type ColorSchemeOption = 'light' | 'dark';

export default function Settings() {
  const { t, i18n } = useTranslation();
  const { colorScheme } = useAppTheme(); // Only use colorScheme for initial load

  const [tempColorScheme, setTempColorScheme] = useState<ColorSchemeOption>(colorScheme);
  const [tempLanguage, setTempLanguage] = useState(i18n.resolvedLanguage || defaultLng);

  const languageOptions = Object.keys(resources).map((lng) => ({
    id: `lang-btn-${lng}`,
    value: lng,
    label: lng.toUpperCase(),
  }));

  useEffect(() => {
    async function loadSettings() {
      try {
        const store = await load('app-settings.dat');

        const savedTheme = await store.get<string>('theme');
        const savedLanguage = await store.get<string>('language');

        if (savedTheme === 'light' || savedTheme === 'dark') {
          setTempColorScheme(savedTheme);
        }

        if (savedLanguage && typeof savedLanguage === 'string') {
          setTempLanguage(savedLanguage);
          i18n.changeLanguage(savedLanguage);
        }
      } catch (e) {
        console.error('Settings.tsx: Erro ao carregar configurações:', e);
      }
    }

    loadSettings();
  }, [i18n]);

  const handleSave = async () => {
    try {
      const store = await load('app-settings.dat');
      await store.set('theme', tempColorScheme);
      await store.set('language', tempLanguage);
      await store.save();

      console.log('Settings.tsx: Emitting app_settings_changed for theme:', tempColorScheme);
      await emit('app_settings_changed', { type: 'theme', value: tempColorScheme });
      console.log('Settings.tsx: Emitting app_settings_changed for language:', tempLanguage);
      await emit('app_settings_changed', { type: 'language', value: tempLanguage });

      Window.getCurrent().close();
    } catch (e) {
      console.error('Settings.tsx: Erro ao salvar configurações:', e);
    }
  };

  const handleCancel = () => {
    Window.getCurrent().close();
  };

  return (
    <Box p="md" style={{ position: 'relative', minHeight: '100vh' }}>
      <Paper withBorder shadow="sm" p="lg" radius="md" style={{ paddingBottom: 80 }}>
        <Title order={1} mb="md">{t('Settings')}</Title>

        <Tabs defaultValue="theme">
          <Tabs.List>
            <Tabs.Tab value="theme">{t('Theme')}</Tabs.Tab>
            <Tabs.Tab value="languages">{t('Languages')}</Tabs.Tab>
            <Tabs.Tab value="about">{t('About')}</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="theme" p="md">
            <Stack gap="md">
              <Text size="xl" fw={700}>{t('Appearance')}</Text>
              <Text size="md">{t('Choose theme')}</Text>
              <Group gap="sm" mt="sm">
                <Button
                  variant={tempColorScheme === 'light' ? 'filled' : 'outline'}
                  color={tempColorScheme === 'light' ? 'blue' : 'gray'}
                  radius="xl"
                  onClick={() => {
                    setTempColorScheme('light'); // Only update temp state
                  }}
                >
                  {t('White Theme') || 'White'}
                </Button>
                <Button
                  variant={tempColorScheme === 'dark' ? 'filled' : 'outline'}
                  color={tempColorScheme === 'dark' ? 'blue' : 'gray'}
                  radius="xl"
                  onClick={() => {
                    setTempColorScheme('dark'); // Only update temp state
                  }}
                >
                  {t('Black Theme') || 'Black'}
                </Button>
              </Group>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="languages" p="md">
            <Stack gap="md">
              <Text size="xl" fw={700}>{t('Languages')}</Text>
              <Text size="md">{t('Select Language')}</Text>
              <Group gap="xs" mt="sm">
                {languageOptions.map(({ id, value, label }) => (
                  <Button
                    key={id}
                    id={id}
                    variant={tempLanguage === value ? 'filled' : 'outline'}
                    color={tempLanguage === value ? 'blue' : 'gray'}
                    radius="xl"
                    size="sm"
                    onClick={() => {
                      setTempLanguage(value);
                      i18n.changeLanguage(value); // Immediate language change for UI feedback
                    }}
                  >
                    {label}
                  </Button>
                ))}
              </Group>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="about" p="md">
            <Title order={3} mb="sm">{t('About Nuvium')}</Title>
            <Text>{t('AppDescription')}</Text>
            <Text mt="sm">{t('Version')}: {packageJson.version}</Text>
            <Text>{t('Developed by')}: Spectrevz</Text>
          </Tabs.Panel>
        </Tabs>
      </Paper>

      <Group
        justify="flex-end"
        gap="md"
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1000,
        }}
      >
        <Button variant="outline" color="gray" radius="xl" onClick={handleCancel}>
          {t('Cancel')}
        </Button>
        <Button variant="filled" color="blue" radius="xl" onClick={handleSave}>
          {t('Save')}
        </Button>
      </Group>
    </Box>
  );
}