import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";


import {
  getCurrentUser,
  loginUser,
  logoutAllUsers,
  logoutUser,
  refreshAccessTokenRequest,
  registerUser,
} from "../services/auth.service";


import {
  setAccessToken as storeSetAccessToken,
  clearAccessToken as storeClearAccessToken,
} from "../services/tokenStore";


import Loader from "../../shared/components/Loader";


const AuthContext = createContext(null);


export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);


  const refreshPromiseRef = useRef(null);


  const refreshAccessToken = useCallback(async () => {
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    refreshPromiseRef.current =
      refreshAccessTokenRequest()
        .then(async (data) => {
          const newAccessToken =
            data.accessToken;

          setAccessToken(newAccessToken);
          storeSetAccessToken(newAccessToken);

          const meData =
            await getCurrentUser(newAccessToken);

          setUser(meData.user);

          return newAccessToken;
        })
        .catch((error) => {
          console.error(
            "Refresh token failed:",
            error
          );

          setAccessToken(null);
          setUser(null);
          storeClearAccessToken();

          return null;
        })
        .finally(() => {
          refreshPromiseRef.current = null;
        });

    return refreshPromiseRef.current;
  }, []);


  useEffect(() => {
    let cancelled = false;

    async function initializeAuth() {
      await refreshAccessToken();

      if (!cancelled) {
        setIsInitialized(true);
      }
    }

    initializeAuth();

    return () => {
      cancelled = true;
    };
  }, [refreshAccessToken]);


  const login = useCallback(
    async (email, password) => {
      const data = await loginUser({
        email,
        password,
      });

      setAccessToken(data.accessToken);
      storeSetAccessToken(data.accessToken);
      setUser(data.user);

      return data;
    },
    []
  );


  const register = useCallback(
    async (username, email, password) => {
      const data = await registerUser({
        username,
        email,
        password,
      });

      /*
       * No access token exists here because the
       * user is created only after OTP verification.
       */

      return data;
    },
    []
  );


  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } finally {
      setAccessToken(null);
      storeClearAccessToken();
      setUser(null);
    }
  }, []);


  const logoutAll = useCallback(async () => {
    try {
      await logoutAllUsers();
    } finally {
      setAccessToken(null);
      storeClearAccessToken();
      setUser(null);
    }
  }, []);


  const value = {
    accessToken,
    user,
    isInitialized,
    login,
    register,
    logout,
    logoutAll,
    refreshAccessToken,
  };


  useEffect(() => {
    if (accessToken) {
      storeSetAccessToken(accessToken);
    } else {
      storeClearAccessToken();
    }
  }, [accessToken]);


  return (
    <AuthContext.Provider value={value}>
      {isInitialized ? (
        children
      ) : (
        <div className="page-loader">
          <Loader />
        </div>
      )}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}