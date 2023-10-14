import React, { createContext, useReducer } from "react";
import { ActionPatientHistoryList, iPatientHistoryElement, patientHistoryListReducer } from "../reducer/PatientHistory";

type AppContextProviderProps = {
  children: React.ReactNode
}

interface SharedContext {
    inheritedAilments: iPatientHistoryElement[];
    dispatchInheritedAilments: React.Dispatch<ActionPatientHistoryList>;

    patologicPersonalAilments: iPatientHistoryElement[];
    dispatchPatologicPersonalAilments: React.Dispatch<ActionPatientHistoryList>;

    currentMedication: iPatientHistoryElement[];
    dispatchCurrentMedications: React.Dispatch<ActionPatientHistoryList>;

    

}

export const AppContext = createContext<SharedContext >({} as SharedContext);

export const AppContextProvider = ( props: AppContextProviderProps) =>{

  const [inheritedAilments, dispatchInheritedAilments] = useReducer(patientHistoryListReducer, []);
  const [patologicPersonalAilments, dispatchPatologicPersonalAilments] = useReducer(patientHistoryListReducer, []);
  const [currentMedication, dispatchCurrentMedications] = useReducer(patientHistoryListReducer, []);
  
  const sharedCtx: SharedContext = {
    inheritedAilments,
    dispatchInheritedAilments,

    patologicPersonalAilments,
    dispatchPatologicPersonalAilments,

    currentMedication,
    dispatchCurrentMedications

  }
  

  return (
    <AppContext.Provider value={ {...sharedCtx}  } >
        {props.children}
    </AppContext.Provider>
  )


}
