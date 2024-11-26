import { BehaviorSubject, Observer, Subscription, filter } from "rxjs";

/**
 * Stores a dynamically expendable list of similar behavior subjects,
 * for example a list of tokens.
 *
 * - Subjects' default value is undefined
 * - undefined value is never emitted to listeners to avoid the first value to potentially often be undefined.
 */
export class BehaviorSubjectMap<T> {
  private subjects = new Map<string, BehaviorSubject<T>>();

  /**
   * @param getInitializer Called when an entry is called for the first time.
   */
  constructor(private getInitializer?: (key: string) => void) { }

  private createIfMissing(key: string) {
    if (!this.subjects.has(key)) {
      this.subjects.set(key, new BehaviorSubject<T>(undefined));
      this.getInitializer?.(key);
    }
  }

  public get(key: string): BehaviorSubject<T> {
    this.createIfMissing(key);
    return this.subjects.get(key);
  }

  public getValues(): BehaviorSubject<T>[] {
    return Array.from(this.subjects.values());
  }

  public getAll(): [string, BehaviorSubject<T>][] {
    return Array.from(this.subjects.entries());
  }

  public subscribe(key: string, observer: Partial<Observer<T>> | ((value: T) => void)): Subscription {
    this.createIfMissing(key);
    return this.subjects.get(key).pipe(filter(v => !!v)).subscribe(observer);
  }
}