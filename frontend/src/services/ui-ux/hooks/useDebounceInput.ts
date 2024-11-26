import { useEffect, useState } from "react";
import { Subject, debounceTime, distinctUntilChanged } from "rxjs";

/**
 * Hook to pack user inputs while typing to not fetch apis too often for example.
 * How to use?
  const [searchSubject, search] = useDebounceInput(new URLSearchParams(query).get('s'));
  <InputBase
    inputRef={searchFilterRef}
    placeholder="..."
    defaultValue={search}
    onChange={e => searchSubject.next(e.target.value)}
    style={{ width: 250 }}
 */
export function useDebounceInput(initialValue?: string, onChange: ((value: string | undefined) => void) | null = null, debounceDelay = 500): [Subject<string>, string | undefined] {
  const [subject] = useState(new Subject<string>());
  const [input, setInput] = useState(initialValue);

  useEffect(() => {
    const sub = subject.pipe(debounceTime(debounceDelay), distinctUntilChanged()).subscribe(value => {
      setInput(value);
      onChange?.(value);
    });
    return () => { sub.unsubscribe(); }
  }, [subject, onChange, debounceDelay]);

  return [
    subject,
    input
  ]
}