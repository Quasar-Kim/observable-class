import { ObservableProp, waitAll } from '../ObservableClass.js'

describe('waitAll()', () => {
    it('should resolve when all nested wait expressions are resolved', async () => {
        const prop1 = new ObservableProp()
        const prop2 = new ObservableProp()

        setTimeout(() => {
            prop1.set('hello')
            prop2.set('there')
        })

        await waitAll(wait => {
            wait(prop1).toBe('hello')
            wait(prop2).toBe('there')
        })

        expect(prop1.get()).to.equal('hello')
        expect(prop2.get()).to.equal('there')
    })
})