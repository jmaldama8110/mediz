import * as React from "react";
import {
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
  Navigate,
  Outlet,
} from "react-router-dom";
import { fakeAuthProvider } from "./auth";
import { PatientsHome } from "./pages/Patients/PatientsHome";
import Menu from "./Menu";
import Patient from "./routers/Patients/Patient";
import ErrorPage from "./error-page";

export default function App() {
  
  return (
    <AuthProvider>
      <Routes>
        
        <Route element={<HomeLayout />} errorElement={<ErrorPage/>}>
          <Route path="/" element={<HomeLandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={ <RequireAuth><Menu/></RequireAuth> } />
        </Route>

        <Route element={<PatientsHome/>} path="/patients"  >
          {/* <Route path="/patients"  element={ <RequireAuth><h1>Hola!</h1></RequireAuth> } /> */}
          <Route element={<Patient/>} path='/patients/:patientId' />
        </Route>
        
      </Routes>
    </AuthProvider>
  );
}

function HomeLayout() {
  return (
    <div>
      <AuthStatus />
      <Outlet />
    </div>
  );
}

interface AuthContextType {
  user: any;
  signin: (user: string, callback: VoidFunction) => void;
  signout: (callback: VoidFunction) => void;
}

let AuthContext = React.createContext<AuthContextType>(null!);

function AuthProvider({ children }: { children: React.ReactNode }) {
  let [user, setUser] = React.useState<any>(null);

  let signin = (newUser: string, callback: VoidFunction) => {
    return fakeAuthProvider.signin(() => {
      setUser(newUser);
      callback();
    });
  };

  let signout = (callback: VoidFunction) => {
    return fakeAuthProvider.signout(() => {
      setUser(null);
      callback();
    });
  };

  let value = { user, signin, signout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth() {
  return React.useContext(AuthContext);
}

function AuthStatus() {
  let auth = useAuth();
  let navigate = useNavigate();

  if (!auth.user) {
    return <p>Inicia tu sesion, <Link to="/login">aqui:</Link></p>;
  }

  return (
    <p>
      Bienvenido {auth.user}!{" "}
      <button
        onClick={() => {
          auth.signout(() => navigate("/"));
        }}
      >
        Cerrar Sesion
      </button>
    </p>
  );
}

function RequireAuth({ children }: { children: JSX.Element }) {
  let auth = useAuth();
  let location = useLocation();

  if (!auth.user) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function LoginPage() {
  let navigate = useNavigate();
  let location = useLocation();
  let auth = useAuth();

  let from = location.state?.from?.pathname || "/dashboard";

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    let formData = new FormData(event.currentTarget);
    let username = formData.get("username") as string;

    auth.signin(username, () => {
      // Send them back to the page they tried to visit when they were
      // redirected to the login page. Use { replace: true } so we don't create
      // another entry in the history stack for the login page.  This means that
      // when they get to the protected page and click the back button, they
      // won't end up back on the login page, which is also really nice for the
      // user experience.
      navigate(from, { replace: true });
    });
  }

  return (
    <div>
      <p>Ingresa tus credeciales para continuar</p>

      <form onSubmit={handleSubmit}>
        <label>
          Usuario: <input name="username" type="text" />
        </label>{" "}
        <button type="submit">Iniciar</button>
      </form>
    </div>
  );
}

function HomeLandingPage() {
  return <h1>Hola, bienvenido a la Clinica San Marco, Paraiso</h1>;
}

