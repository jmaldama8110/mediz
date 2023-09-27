export type CollectionType = "PATIENT" | "USER";

export interface iDocumentPutResponse {
    ok: boolean;
    id: string;
    rev: string;
}
export interface iDocumentGetResponse {
    _id: string;
    _rev: string;
}

export interface iDocumentCreateIndexResponse {
    result: "created" | "exists";
}

export interface iDocumentFindResponse {
    docs: any []
}

export interface iBaseDocument {
    _id: string | undefined;
    _rev?: string | undefined;
    collection_name: CollectionType;
}

