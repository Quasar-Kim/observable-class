import Queue from './Queue.js'
import once from './once.js'

export class ObservableProp {
  val = undefined
  conditions = new Set()
  callbacks = new Map()

  set(val) {
    const changed = val !== this.val
    this.val = val

    if (changed) {
      this.testConditionsAll()
    }
  }

  get() {
    return this.val
  }

  registerCallback(condition, matchedCallback, unmatchedCallback) {
    // 있으면 있는 컨디션 이용
    if (!this.conditions.has(condition)) {
      this.conditions.add(condition)
      this.callbacks.set(condition, new Set())
    }

    // condition에 추가
    const callbackPairs = this.callbacks.get(condition)
    const callbackPair = [matchedCallback, unmatchedCallback]
    callbackPairs.add(callbackPair)

    // 취소용 함수 리턴
    return () => {
      callbackPairs.delete(callbackPair)

      // callbackPair를 가지지 않는 컨디션은 삭제
      if (callbackPairs.size > 0) return
      this.callbacks.delete(callbackPairs)
      this.conditions.delete(condition)
    };
  }

  testConditionsAll() {
    for (const condition of this.conditions.values()) {
      this.testCondition(condition)
    }
  }

  testCondition(condition) {
    const matched = condition(this.val)
    for (const [matchedCallback, unmatchedCallback] of this.callbacks.get(condition)) {
      if (matched) {
        matchedCallback(this.val)
      } else {
        unmatchedCallback(this.val)
      }
    }
  }
}

function waitToBeDefined(val) {
  return val !== undefined
}

function waitToBeChanged() {
  return true
}

export class WaitEntry {
  promiseCallbacks = new Queue();
  resolved = false;
  observableProp = undefined
  unmatchedCallback = () => {}
  once = true
  cancel = () => {}

  constructor({ observableProp, unmatchedCallback = () => {}, once = true }) {
    this.observableProp = observableProp;
    this.unmatchedCallback = unmatchedCallback
    this.once = once
  }

  // thenable 구현
  // reject 할일 없으므로 두번째 인수 안받음
  then(fulfill) {
    this.promiseCallbacks.push(fulfill);
    if (this.resolved) this.resolve();
  }

  resolve(newVal) {
    // once: false면 콜백 비우지 X
    // while (this.promiseCallbacks.size > 0) {
    //   const callback = this.promiseCallbacks.pop();
    //   callback(newVal);
    // }
    for (const callback of this.promiseCallbacks) {
      callback(newVal)
    }

    if (this.once) {
      this.promiseCallbacks.flush()
    }
  }

  // 사용 가능한 컨디션들
  toFulfill(condition) {
    this.cancel = this.observableProp.registerCallback(condition, newVal => {
        this.resolve(newVal);

        if (this.once) {
          this.cancel()
          // promise처럼 작동할때처럼 필요, once === false인 경우 항상 resolved === false
          this.resolved = true
        }
      }, () => {
        this.unmatchedCallback()
      });

    // then() 가능하게 하기 위해서
    return this
  }

  // TODO: toBe같은거 바로 exec 기능 추가?

  toBe(expectedVal) {
    return this.toFulfill((val) => val === expectedVal);
  }

  toBeDefined() {
    return this.toFulfill(waitToBeDefined);
  }

  toBeChanged() {
    return this.toFulfill(waitToBeChanged);
  }
}

export function wait(observableProp) {
  return new WaitEntry({ observableProp });
}

export function observe(observableProp) { 
  return {
    onChange(callback) {
      let canceled = false
      const waitEntry = new WaitEntry({ observableProp, once: false })

      const cancel = () => {
        canceled = true
      }

      const callCallback = newVal => {
        callback(newVal, cancel)

        if (canceled) {
          waitEntry.cancel()
        }
      }

      waitEntry.toBeChanged().then(callCallback)
    }
  }
}

export function updateOn(observableProp) {
  return {
    async *[Symbol.asyncIterator]() {
      const queue = new Queue()
      observe(observableProp).onChange(newVal => {
        queue.push(newVal)
      })

      while(true) {
        while(queue.size > 0) {
          yield queue.pop()
        }

        await once(queue, 'push')
      }
    }
  }
}

export default class ObservableClass {
  constructor() {
    this.setObservableProps();
  }

  setObservableProps() {
    // this.constructor refers to child class
    for (const prop of this.constructor.observableProps) {
      const observableProp = new ObservableProp();

      Object.defineProperty(this, prop, {
        get: () => observableProp,
        set: val => observableProp.set(val),
      });
    }
  }
}

