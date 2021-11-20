# observable class
Wait for conditions to meet, not for an event.

basic usage
```javascript
import ObservableClass, { wait, observe, updateOn, waitAll } from 'observable-class'

class MyClass extends ObservableClass {
  static observableProps = ['color', 'connection']
  color = 'blue'
  connection = 'idle'
}

const something = new MyClass()
something.color // -> ObservableProp

// basic functionalities
something.color.get() // -> 'blue'
something.color.set('red')
something.color = 'red'
```

observing
```javascript
// wait
await wait(something.color).toBe('blue')

// continuous observing
// pattern 1 - callback
observe(something.color).onChange(newColor => console.log(newColor))

// pattern 2 - async generator
for await (const newColor of updateOn(something.color)) {
	console.log(`color has changed to ${newColor}`)
}
```

chaining
```javascript
// chaining
await WaitAll(wait => {
	wait(something.color).toBe('green')
	wait(something.connection).toBe('connected')
})
```

# test
use `serve` package to serve the directory on the browser. Launch test/mocha.html to test.