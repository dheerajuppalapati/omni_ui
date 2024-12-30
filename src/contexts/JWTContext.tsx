import { createContext, ReactNode, useEffect, useReducer } from 'react';
// utils
import { isValidToken, setSession } from '../utils/jwt';
// @types
import { ActionMap, AuthState, AuthUser, JWTContextType } from '../@types/auth';

// ----------------------------------------------------------------------

enum Types {
  Initial = 'INITIALIZE',
  Login = 'LOGIN',
  Logout = 'LOGOUT',
  Register = 'REGISTER',
}

type JWTAuthPayload = {
  [Types.Initial]: {
    isAuthenticated: boolean;
    user: AuthUser;
  };
  [Types.Login]: {
    user: AuthUser;
  };
  [Types.Logout]: undefined;
  [Types.Register]: {
    user: AuthUser;
  };
};

export type JWTActions = ActionMap<JWTAuthPayload>[keyof ActionMap<JWTAuthPayload>];

const initialState: AuthState = {
  isAuthenticated: false,
  isInitialized: false,
  user: null,
};

const dummyUser: AuthUser = {
  id: '123',
  email: 'demo@minimals.cc', // Updated email
  firstName: 'John',
  lastName: 'Doe',
};

const dummyPassword = 'demo1234'; // Updated password
const dummyToken = 'dummy-token-1234567890'; // A simple string as dummy token

const JWTReducer = (state: AuthState, action: JWTActions) => {
  switch (action.type) {
    case 'INITIALIZE':
      return {
        isAuthenticated: action.payload.isAuthenticated,
        isInitialized: true,
        user: action.payload.user,
      };
    case 'LOGIN':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
      };
    case 'REGISTER':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
      };
    default:
      return state;
  }
};

const AuthContext = createContext<JWTContextType | null>(null);

// ----------------------------------------------------------------------

type AuthProviderProps = {
  children: ReactNode;
};

function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(JWTReducer, initialState);

  useEffect(() => {
    const initialize = async () => {
      try {
        const accessToken = window.localStorage.getItem('accessToken');

        if (accessToken && isValidToken(accessToken)) {
          setSession(accessToken);
          // Use the dummy user for initialization
          dispatch({
            type: Types.Initial,
            payload: {
              isAuthenticated: true,
              user: dummyUser,
            },
          });
        } else {
          dispatch({
            type: Types.Initial,
            payload: {
              isAuthenticated: false,
              user: null,
            },
          });
        }
      } catch (err) {
        console.error(err);
        dispatch({
          type: Types.Initial,
          payload: {
            isAuthenticated: false,
            user: null,
          },
        });
      }
    };

    initialize();
  }, []);

  const login = async (email: string, password: string) => {
    // Check the provided credentials against the dummy user
    if (dummyUser && email === dummyUser.email && password === dummyPassword) {
      setSession(dummyToken);
      window.localStorage.setItem('accessToken', dummyToken);
      dispatch({
        type: Types.Login,
        payload: {
          user: dummyUser,
        },
      });
    } else {
      throw new Error('Invalid email or password'); // Throw an error if credentials do not match
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    // Simulate registration with the specified email
    setSession(dummyToken);
    window.localStorage.setItem('accessToken', dummyToken);
    dispatch({
      type: Types.Register,
      payload: {
        user: {
          ...dummyUser,
          email, // Update email
          firstName, // Update first name
          lastName, // Update last name
        },
      },
    });
  };
  const logout = async () => {
    setSession(null);
    window.localStorage.removeItem('accessToken');
    dispatch({ type: Types.Logout });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        method: 'jwt',
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };
