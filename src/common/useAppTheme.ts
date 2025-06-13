// src/hooks/useAppTheme.ts
import { useEffect } from 'react';
import { useCookie } from '../common/utils';
// Define o tipo ColorScheme localmente, pois não é mais exportado pelo Mantine
type ColorScheme = 'light' | 'dark';

/**
 * Hook customizado para gerenciar o tema da aplicação (claro/escuro).
 * Ele persiste o tema em um cookie e aplica as classes CSS correspondentes ao corpo do documento.
 * @returns Um objeto contendo o esquema de cores atual e uma função para defini-lo.
 */
export function useAppTheme() {
    // Usa o useCookie com a tipagem ColorScheme do Mantine.
    // O valor padrão deve ser 'light' ou 'dark' para corresponder ao que nosso CSS gerencia.
    const [colorScheme, setColorSchemeCookie] = useCookie<ColorScheme>('mantine-color-scheme', 'light');

    // Efeito colateral para aplicar a classe de tema ao <body> do documento.
    // Ele é executado sempre que o colorScheme muda.
    useEffect(() => {
        document.body.classList.remove('theme-light', 'theme-dark');
        // Adiciona a classe de tema correspondente ao esquema de cores atual.
        // Verificamos se é 'light' ou 'dark' para evitar 'auto' (que não tem classe CSS correspondente em nosso setup).
        if (colorScheme === 'light' || colorScheme === 'dark') {
            document.body.classList.add(`theme-${colorScheme}`);
        }
    }, [colorScheme]); // Dependência: o efeito é re-executado quando colorScheme muda

    /**
     * Função para definir o esquema de cores da aplicação.
     * @param scheme 'light' para tema claro (branco), 'dark' para tema escuro (preto).
     */
    const setAppColorScheme = (scheme: ColorScheme) => {
        // Apenas permite 'light' ou 'dark' para o cookie, pois nosso CSS só lida com isso.
        if (scheme === 'light' || scheme === 'dark') {
            setColorSchemeCookie(scheme); // Atualiza o cookie, o que dispara o useEffect acima
        }
    };

    /**
     * Função para alternar o esquema de cores entre 'light' e 'dark'.
     */
    const toggleAppColorScheme = () => {
        setAppColorScheme(colorScheme === 'light' ? 'dark' : 'light');
    };

    // Retorna o esquema de cores atual e as funções para alterá-lo.
    return {
        colorScheme, // TypeScript agora reconhecerá isso como ColorScheme do Mantine
        setColorScheme: setAppColorScheme,
        toggleColorScheme: toggleAppColorScheme,
    };
}