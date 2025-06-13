// src/theme/MantineTheme.ts
import { createTheme } from '@mantine/core';

// Este arquivo define o tema para os componentes Mantine.
// As cores primárias para o tema claro/escuro serão definidas no seu CSS global.
export const theme = createTheme({
    // Define uma cor primária padrão para os componentes Mantine.
    // 'gray' é uma cor neutra e funciona bem com um esquema de cores branco/preto via CSS.
    primaryColor: 'gray',

    // Você pode adicionar outras personalizações globais aqui, como:
    // spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
    // fontSizes: { xs: '0.75rem', sm: '0.875rem', md: '1rem', lg: '1.125rem', xl: '1.25rem' },
    // breakpoints: {
    //   xs: '30em', // 480px
    //   sm: '48em', // 768px
    //   md: '64em', // 1024px
    //   lg: '74em', // 1184px
    //   xl: '90em', // 1440px
    // },
    // etc.
});