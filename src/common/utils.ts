import Cookies from 'js-cookie';
import localforage from 'localforage';
import { Dispatch, SetStateAction, useEffect, useLayoutEffect, useState } from 'react';
import packageJson from '../../package.json';
export { localforage };

export const VERSION = packageJson.version;

export const IS_DEVELOPMENT = import.meta.env.MODE === 'development';
export const IS_PRODUCTION = !IS_DEVELOPMENT;

/**
 * Hook para gerenciar um valor persistente em cookies do navegador usando js-cookie.
 * @param key A chave do cookie.
 * @param defaultValue O valor padrão a ser usado se o cookie não existir.
 * @param options Opções de cookie para js-cookie.
 * @returns Um array contendo o valor atual do cookie e uma função para atualizá-lo.
 */
export function useCookie<T>(key: string, defaultValue: T, options: Cookies.CookieAttributes = { expires: 365000, sameSite: 'lax', path: '/' }): [T, Dispatch<SetStateAction<T>>] {
    // cookie expires in a millenia
    // sameSite != 'strict' because the cookie is not read for sensitive actions
    // synchronous

    // Use useState para inicializar o valor do cookie
    const [state, setState] = useState<T>(() => {
        const cookieValue = Cookies.get(key); // Retorna string | undefined

        // Se o cookie existir, tente converter para o tipo T.
        // Como 'light' e 'dark' são strings, uma simples coerção ou cast é suficiente.
        if (cookieValue !== undefined) {
            return cookieValue as T; // O valor do cookie é uma string, e T será 'light' | 'dark' (que também são strings)
        }
        return defaultValue; // Se o cookie não existir, use o valor padrão
    });

    useEffect(() => {
        // Quando o estado muda, atualize o cookie.
        // O valor `state` já é do tipo `T`, então `String(state)` garante que js-cookie
        // receba uma string, o que é sempre seguro.
        Cookies.set(key, String(state), options);
    }, [key, state, options]); // Adicionado `key` e `options` para dependências para garantir reatividade correta

    return [state, setState];
}

export function trueTypeOf(obj: any) {
    return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase()
    /*
        []          -> array
        {}          -> object
        ''          -> string
        new Date()  -> date
        1           -> number
        function () {} -> function
        async function () {} -> asyncfunction
        /test/i     -> regexp
        true        -> boolean
        null        -> null
        trueTypeOf() -> undefined
    */
}

// https://reactjs.org/docs/hooks-custom.html
export function useLocalForage<T>(key: string, defaultValue: T): [T, Dispatch<SetStateAction<T>>, boolean] {
    // only supports primitives, arrays, and {} objects
    const [state, setState] = useState(defaultValue);
    const [loading, setLoading] = useState(true);

    // useLayoutEffect will be called before DOM paintings and before useEffect
    useLayoutEffect(() => {
        let allow = true;
        localforage.getItem(key)
            .then(value => {
                if (value === null) throw '';
                if (allow) setState(value as T);
            }).catch(() => localforage.setItem(key, defaultValue))
            .then(() => {
                if (allow) setLoading(false);
            });
        return () => { allow = false; }
    }, []);
    // useLayoutEffect does not like Promise return values.
    useEffect(() => {
        // do not allow setState to be called before data has even been loaded!
        // this prevents overwriting
        if (!loading) localforage.setItem(key, state);
    }, [state]);
    return [state, setState, loading];
}

// show browser / native notification
export function notify(title: string, body: string) {
    new Notification(title, { body: body || "", });
}

export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function downloadFile(filename: string, content: BlobPart, contentType = 'text/plain') {
    const element = document.createElement('a');
    const file = new Blob([content], { type: contentType });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
}


export function arraysEqual<T>(a: T[], b: T[]) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    // If you don't care about the order of the elements inside
    // the array, you should sort both arrays here.
    // Please note that calling sort on an array will modify that array.
    // you might want to clone your array first.

    for (var i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

/**
 * Joins path segments with a specified separator
 * @param separator The separator to use between segments (e.g., '/', '\', '.')
 * @param segments The path segments to join
 * @returns The joined path string
 */
export function join(separator: string, ...segments: string[]): string | null {
    if (!segments || segments.length === 0) return '';
    if (segments.find(x => !(typeof x === 'string'))) return null;
    return segments.join(separator);
}