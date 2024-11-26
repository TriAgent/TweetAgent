import { BehaviorSubject, Observer, Subscription } from "rxjs";

/**
 * Extended BehaviorSubject to provide additional features:
 * - Initialize with a default value (usually null or empty) and fetch real initialization data only
 * when the first subscriber subscribes. This allows fetching data lazily only when required.
 */
export class AdvancedBehaviorSubject<T> extends BehaviorSubject<T> {
  private fetchedOrFetching = false;

  constructor(initialValue: T, private initializer?: () => Promise<T | void> | T | void) {
    super(initialValue);
  }

  public hasInitializer(): boolean {
    return !!this.initializer;
  }

  subscribe(observerOrNext?: Partial<Observer<T>> | ((value: T) => void)): Subscription;
  subscribe(next?: (value: T) => void, error?: (error: any) => void, complete?: () => void): Subscription;
  subscribe(next?: unknown, error?: unknown, complete?: unknown): Subscription {
    // The first subscriber triggers the real data initialization
    if (!this.fetchedOrFetching) {
      this.fetchedOrFetching = true;
      this.callInitializer();
    }

    // Call the parent subscribe() method with the same arguments
    // eslint-disable-next-line prefer-rest-params
    return super.subscribe(...arguments);
  }

  next(value: T): void {
    super.next(value);
  }

  private callInitializer(): void {
    if (!this.initializer)
      return;

    // If provided, call the initializer, and update the subject with the init value.
    const result = this.initializer();
    if (result instanceof Promise) {
      result.then(initValue => {
        if (initValue) {
          this.next(initValue);
        }
      }).catch(e => {
        console.error(e);
      });
    }
    else if (result) {
      result && this.next(result);
    }
  }
}