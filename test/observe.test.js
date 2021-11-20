import { observe, ObservableProp } from '../ObservableClass.js'

describe('observe', () => {
    it('should call callback passed to onChange when value changes', async () => {
        const callback = chai.spy()
        const prop = new ObservableProp()
        observe(prop).onChange(callback)

        // first & second change
        prop.set('a')
        prop.set('b')
        
        expect(callback).to.have.been.called.with('b')
        expect(callback).to.have.been.called.twice
    })

    it('should cancel observing when cancel function passed as second arg is called', () => {
        const callback = chai.spy()
        const prop = new ObservableProp()
        observe(prop).onChange((newVal, cancel) => {
            callback()
            cancel()
        })

        // first change, onChange 실행됨
        prop.set('hello')

        // second change, onChange 실행 안됨
        prop.set('bye')

        expect(callback).to.have.been.called.once
    })
})