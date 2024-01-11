
export type Response = {
    ok: boolean;
    status: number;
    statusText: string;
    headers: Headers;
    url: string;
    body: any;
    json: any;
    text: any;
    blob: any;
    formData: any;
    arrayBuffer: any;
    redirect: any;
    error: any;
}