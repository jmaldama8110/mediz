import React from 'react'
import ReactDOM from 'react-dom/client'
import { fakeAuthProvider } from './auth';

import './index.css'
import './components/Loader.css';
import './components/LogoAnimated.css';

import { Link, Navigate, Outlet, Route, RouterProvider, createBrowserRouter, createRoutesFromElements, useLocation, useNavigate } from "react-router-dom";
import ErrorPage from './error-page';
import Menu from './Menu';
import UsersHomes from './pages/Users/UsersHome';
import { PatientsHome } from './routers/Patients/PatientsHome';
import Patient from './routers/Patients/Patient';

import { loader as patientsLoader, action as patientsAction } from './routers/Patients/PatientsHome';
import { loader as patientLoader, action as patientFavoriteAction} from './routers/Patients/Patient';
import { action as patientDestroyAction} from './routers/Patients/PatientDestroy';
import PatientEdit,{action as patientEditAction} from './routers/Patients/PatientEdit';
import Index from './routers/Patients/Index';

const router = createBrowserRouter(
  createRoutesFromElements(
     <Route errorElement={<ErrorPage/>}>
          <Route element={<HomeLayout />} >
            <Route path="/" element={<HomeLandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={ <RequireAuth><Menu/></RequireAuth> } />
            <Route path="/users" element={ <RequireAuth><UsersHomes/></RequireAuth> } />
          </Route>

          <Route element={<PatientsHome/>} path="/patients" loader={patientsLoader} action={patientsAction}  >
            <Route errorElement={<ErrorPage />}>
              <Route index={true} element={<Index />}/>
              <Route element={<Patient/>} path='/patients/:patientId' loader={patientLoader} action={patientFavoriteAction} />
              <Route element={<PatientEdit/>} path='/patients/:patientId/edit' loader={patientLoader} action={patientEditAction} />
              <Route path='/patients/:patientId/destroy' action={patientDestroyAction} />
            </Route>
          </Route>
    </Route>
  )

)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router ={router} />
    </AuthProvider>
  </React.StrictMode>,
)


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
  return (
    <>
      <h1>Hola, bienvenido a la Clinica San Marco</h1>
      <span className="logo-animated"></span>
    </>
  );
}

