 
export interface Machine {
  id: number;
  name: string;
  releaseDate: string;
}

export interface Operation {
  id: number;
  machineId: number;
  opNumber: number;
  opTime: number;
  opAxes: string;
}