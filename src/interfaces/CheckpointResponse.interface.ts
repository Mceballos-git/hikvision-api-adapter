export interface CheckpointResponse {
    items: Item[];
}

export interface Item {
    last_id: number;
    mensaje: string;
    emple:   number;
    id:      number;
}
