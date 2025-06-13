// src/hooks/useAppTheme.ts
import { useEffect, useState } from 'react';
import { load } from '@tauri-apps/plugin-store';

type ColorScheme = 'light' | 'dark';

export function useAppTheme() {
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>('light');

  // Load the theme from the Tauri store on mount
  useEffect(() => {
    async function loadTheme() {
      try {
        const store = await load('app-settings.dat');
        const savedTheme = await store.get<string>('theme');
        if (savedTheme === 'light' || savedTheme === 'dark') {
          setColorSchemeState(savedTheme);
        }
      } catch (e) {
        console.error('Erro ao carregar tema do store:', e);
      }
    }
    loadTheme();
  }, []);

  // Apply the theme class to <body> when colorScheme changes
  useEffect(() => {
    document.body.classList.remove('theme-light', 'theme-dark');
    if (colorScheme === 'light' || colorScheme === 'dark') {
      document.body.classList.add(`theme-${colorScheme}`);
    }
  }, [colorScheme]);

  // Function to set the theme and save it to the store
  const setAppColorScheme = async (scheme: ColorScheme) => {
    if (scheme === 'light' || scheme === 'dark') {
      try {
        const store = await load('app-settings.dat');
        await store.set('theme', scheme);
        await store.save();
        setColorSchemeState(scheme);
      } catch (e) {
        console.error('Erro ao salvar tema no store:', e);
      }
    }
  };

  // Function to toggle the theme
  const toggleAppColorScheme = () => {
    setAppColorScheme(colorScheme === 'light' ? 'dark' : 'light');
  };

  return {
    colorScheme,
    setColorScheme: setAppColorScheme,
    toggleColorScheme: toggleAppColorScheme,
  };
}