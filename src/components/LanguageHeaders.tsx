import { Button, Group } from '@mantine/core';
import { useHotkeys } from '@mantine/hooks';
import { useTranslation } from 'react-i18next';
import { resources } from '../translations/i18n';
import '../assets/styles/settings.css';

export default function LanguageHeaders() {
  const { i18n } = useTranslation();
  const languages = Object.keys(resources);

  if (languages.length <= 1) return <></>;

  const lang = i18n.language;

  function cycleLang() {
    const currentLangIndex = languages.findIndex((l) => lang.startsWith(l));
    const nextLangIdx = (currentLangIndex + 1) % languages.length;
    i18n.changeLanguage(languages[nextLangIdx]);
  }

  useHotkeys([['mod+Shift+L', cycleLang]]);

  const headerButtons = languages.map((supportedLang) => {
    const selectedLang = lang.startsWith(supportedLang);

    return (
      <Button
        key={supportedLang}
        onClick={() => i18n.changeLanguage(supportedLang)}
        variant={selectedLang ? 'filled' : 'subtle'}
        color={selectedLang ? 'blue' : 'gray'}
        size="xs"
        radius="xl"
        styles={{
          root: {
            minWidth: 'auto',
            paddingLeft: '8px',
            paddingRight: '8px',
          },
          label: {
            fontWeight: selectedLang ? 700 : 500,
          },
        }}
      >
        {supportedLang.toUpperCase()}
      </Button>
    );
  });

  return (
    <Group gap="xs" wrap="nowrap">
      {headerButtons}
    </Group>
  );
}