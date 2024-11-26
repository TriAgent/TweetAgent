import { useEffect, useState } from "react";
import { Observable } from "rxjs";

export const useObservable = <T>(observable: Observable<T>) => {
  const [value, setValue] = useState<T>(undefined);
  const [setError] = useState();

  useEffect(() => {
    if (!observable)
      return;

    const subscription = observable.subscribe({
      next: val => {
        setValue(val);
      },
      error: setError
    });

    return () => subscription.unsubscribe()
  }, [observable, setError]);

  return value;
}
