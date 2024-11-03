"use client";
import {
  ReactNode,
  createContext,
  useEffect,
  useState,
  useContext,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { useCookies } from "next-client-cookies";
import { validateToken } from "../app/actions/auth";

import Modal from "../components/common/modal";
import Button from "../components/common/button";

interface TAuthContext {
  token: string | null;
  username: string | null;
  updateToken: (token: string) => void;
  deleteToken: () => void;
}

export const AuthContext = createContext<TAuthContext>({
  token: null,
  updateToken: () => {},
  deleteToken: () => {},
  username: null,
});

interface Props {
  children: ReactNode;
}

export const AuthProvider = ({ children }: Props) => {
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isRedirectModalOpen, setIsRedirectModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const cookies = useCookies();

  const RedirectModal = () => {
    return (
      <Modal
        isOpen={isRedirectModalOpen}
        title=""
        isCloseable={false}
        onClose={() => setIsRedirectModalOpen(false)}
      >
        <div className="flex flex-col items-center">
          <h1 className="text-2xl font-semibold mb-4">{modalMessage}</h1>
          <Button
            text="Log In"
            onClick={() => {
              setIsRedirectModalOpen(false);
              router.push("/");
            }}
          />
        </div>
      </Modal>
    );
  };

  const updateToken = (token: string) => {
    const expireDate = new Date();
    expireDate.setTime(expireDate.getTime() + 1000 * 60 * 60 * 12);
    cookies.set("token", token, {
      sameSite: "strict",
      secure: true,
      expires: expireDate,
    });
    setToken(token);
  };

  const deleteToken = () => {
    cookies.remove("token");
    setToken(null);
  };

  const onAuthenticateTokenSuccess = () => {
    setIsRedirectModalOpen(false);

    if (pathname === "/") {
      router.push("/home");
    }
  };

  const onAuthenticateTokenFailure = () => {
    if (pathname !== "/") {
      if (token) {
        setModalMessage("Session expired. Please log in again.");
      } else {
        setModalMessage("Unauthorized. Please log in.");
      }
      setIsRedirectModalOpen(true);
      return;
    }
    deleteToken();
  };

  // Loads token from cookies on mount
  useEffect(() => {
    const token = cookies.get("token");
    if (token) {
      setToken(token);
    }
  }, [cookies]);

  // Checks if token is valid on page load
  useEffect(() => {
    const authenticateToken = async () => {
      let success = false;
      if (token) {
        const response = await validateToken(token);
        if (response) {
          success = true;
        }
      }
      return success;
    };
    authenticateToken().then((success) => {
      if (success) {
        onAuthenticateTokenSuccess();
      } else {
        onAuthenticateTokenFailure();
      }
    });
  }, [token, pathname]);

  // Updates username when token changes
  useEffect(() => {
    if (token) {
      // Decode the token to get the username
      try {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        const decodedUsername = decodedToken.username;
        setUsername(decodedUsername);
        cookies.set("username", decodedUsername);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    } else {
      setUsername(null);
      cookies.remove("username");
    }
  }, [cookies, token]);

  return (
    <AuthContext.Provider
      value={{
        token,
        username,
        updateToken,
        deleteToken,
      }}
    >
      {!isRedirectModalOpen && children}
      <RedirectModal />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
