import { Subject } from "rxjs";

/** Event emitted every time any kind of data is saved */
export const dataSaved$ = new Subject();

export const notifyDataSaved = () => {
  dataSaved$.next(undefined);
}