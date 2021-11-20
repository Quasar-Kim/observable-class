# observable class
Wait for conditions to meet, not for an event.

```javascript
import ObservableClass, { wait, observe, updateOn } from 'observable-class'

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

// wait
await wait(something.color).toBe('blue')
```

```javascript
// continuous observing
// pattern 1 - callback
observe(something.color).onChange(newColor => console.log(newColor))

// pattern 2 - async generator
for await (const newColor of updateOn(something.color)) {
	console.log(`color has changed to ${newColor}`)
}
```

# test
use `serve` package to serve the directory on the browser. Launch test/mocha.html to test.