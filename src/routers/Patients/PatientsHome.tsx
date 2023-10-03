import { Link, Outlet, useLoaderData, Form, redirect, NavLink, useNavigation, useSubmit } from "react-router-dom";

import { db, remoteDB } from "../../db/couchdb";
import { iDocumentPutResponse } from "../../models/PouchDbModels";
import { PatientDocument } from "../../models/Patient";
import { matchSorter } from "match-sorter";
import { useEffect } from "react";



export async function loader( {request}:any){
  await db.replicate.from(remoteDB);
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  
  let patients: any[] = await PatientDocument.getAllDocsFromType('PATIENT')
  if (q) {
    patients = matchSorter(patients, q, { keys: ["name", "lastname"] });
  }

  return { patients,q }
}


export async function action(){

  try {
    
    const patient = new PatientDocument();

    const rec_no = Date.now().toString().slice(-6);

    const res: iDocumentPutResponse = 
      await db.put( {...patient, _id: Date.now().toString(), rec_no });
    patient.processNewDocument(res);
    await db.replicate.to(remoteDB);
    return redirect(`/patients/${patient._id}/edit`);
  }
  catch(e){
    return { undefined };
  }
}

export const PatientsHome = () => {

  const { patients,q }:any  = useLoaderData();
  const navigation = useNavigation();
  const submit = useSubmit();
  const searching =
  navigation.location && new URLSearchParams(navigation.location.search).has("q");

  const onNavLink = ( { isActive, isPending} :any) => (
      isActive ?
        "active"
      : isPending ? "pending" : ""
  )

  
  useEffect(() => {
    (document.getElementById('q') as HTMLInputElement).value = q
  }, [q]);

  function onSearchInputChange(event:React.FormEvent<HTMLInputElement>){
    const isFirstSearch = q == null;
    submit(event.currentTarget.form,{
      replace: !isFirstSearch
    });
  }

  return (

    <div className="full-content">
      <div className="sidebar">
      
        <h1>Pacientes</h1>
        
        <div>
        
          <Form id="search-form" role="search">
            <input
              id="q"
              aria-label="Search contacts"
              placeholder="Buscar"
              type="search"
              name="q"
              defaultValue={q}
              onChange={onSearchInputChange}
              className={searching ? "loading" : ""}
            />
            <div className="search-spinner" aria-hidden hidden={!searching} />
            <div className="sr-only" aria-live="polite"></div>
          </Form>

          <Form method="post">
            <button type="submit">Nuevo</button>
          </Form>
        </div>
        <Link to='/dashboard'>Volver</Link>
        <nav>
          {patients.length ? (
            <ul>
              {patients.map((pa:any) => (
                <li key={pa._id}>
                  <NavLink to={`/patients/${pa._id}`} className={onNavLink}>
                    {pa.name || pa.lastname ? (
                      <>
                        {pa.name} {pa.lastname}
                      </>
                    ) : (
                      <i>Nuevo Registro</i>
                    )}{" "}
                    {pa.highlight && <span>★</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          ) : (
            <p>
              <i>Sin registros</i>
            </p>
          )}
        </nav>
        
      </div>
      <div className={ navigation.state === "loading" ? "detail loading" : "detail"}>
        {/* {navigation.state === "loading" ? <span className="loader"></span> : <Outlet/> } */}
        <Outlet />
      </div>
      
    </div>
  );
};
