export type ActionPatientHistoryList = 
    {
     type: "POPULATE"
     data: iPatientHistoryElement[]
    } |
    {
    type: "ADD",
    item: iPatientHistoryElement
    } |
    {
    type: "REMOVE",
    idx: number;
    }

export interface iPatientHistoryElement {
    id: number;
    text1: string;
    text2: string;
    text3: string;
    active: boolean;
}

type State = iPatientHistoryElement[]

export function patientHistoryListReducer ( state: State, action: ActionPatientHistoryList) {
    switch( action.type ){
        case "POPULATE":
            return action.data;
        case "ADD":
            return [...state, action.item]
        case "REMOVE":
            return state.filter( (i:iPatientHistoryElement) => i.id != action.idx)
        default:
            return state;
    }

}