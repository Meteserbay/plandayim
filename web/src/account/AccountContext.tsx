import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import { getCurrentAccount, logout as logoutRequest } from "../api/account";
import type { Account } from "../types/account";

interface AccountContextValue {
    account: Account | null;
    isLoading: boolean;
    setAccount: (account: Account | null) => void;
    refresh: () => Promise<void>;
    logout: () => Promise<void>;
}

const AccountContext = createContext<AccountContextValue | null>(null);

export function AccountProvider({ children }: { children: ReactNode }) {
    const [account, setAccount] = useState<Account | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refresh = useCallback(async () => {
        try {
            setAccount(await getCurrentAccount());
        } catch (error) {
            console.error(error);
            setAccount(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await logoutRequest();
        } finally {
            setAccount(null);
        }
    }, []);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    const value = useMemo(
        () => ({ account, isLoading, setAccount, refresh, logout }),
        [account, isLoading, refresh, logout]
    );

    return (
        <AccountContext.Provider value={value}>
            {children}
        </AccountContext.Provider>
    );
}

// oxlint-disable-next-line react/only-export-components
export function useAccount(): AccountContextValue {
    const context = useContext(AccountContext);

    if (!context) {
        throw new Error("useAccount must be used inside AccountProvider.");
    }

    return context;
}

// Giriş sonrası dönülecek adres sadece site içi bir yol olabilir;
// "//kotu-site.com" gibi dış adreslere yönlendirmeyi engeller.
// oxlint-disable-next-line react/only-export-components
export function safeReturnPath(value: string | null, fallback = "/panel") {
    if (!value || !value.startsWith("/") || value.startsWith("//")) {
        return fallback;
    }

    return value;
}
