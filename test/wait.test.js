import { wait, ObservableProp, WaitEntry } from '../ObservableClass.js'

describe('wait()', () => {
    // thenable 기능
    it('should be thenable', done => {
        const prop = new ObservableProp()
        const waitEntry = wait(prop)
        waitEntry.then(() => done())
        waitEntry.resolve()
    })
    it('should resolve if already resolved', done => {
        const prop = new ObservableProp()
        const waitEntry = wait(prop)
        waitEntry.then(() => {
            // 이제 then() 하면 resolve() 할 필요 없이 바로 done()이 불려야 함
            waitEntry.then(() => done())
        })
        waitEntry.resolve()
    })

    // condition 기능
    it('should resolve when condition passed to toFulfill() meets', done => {
        const prop = new ObservableProp()
        wait(prop).toFulfill(val => typeof val === 'string').then(() => done())
        prop.set('hello')
    })
    it('should resolve when expectedVal passed to toBe() matches', done => {
        const prop = new ObservableProp()
        wait(prop).toBe('hello').then(() => done())
        prop.set('hello')
    })
    it('should resolve when value is defined if toBeDefined() was called', done => {
        const prop = new ObservableProp()
        wait(prop).toBeDefined().then(() => done())
        prop.set('hello')
    })
    it('should resolve when value changes if toBeChanged() was called', done => {
        const prop = new ObservableProp()
        wait(prop).toBeChanged().then(() => done())
        prop.set('hello')
    })
    it('should resolve immediately if condition passed to toFulfill() meets with value', async () => {
        const prop = new ObservableProp()
        prop.set(1)
        await wait(prop).toFulfill(val => typeof val === 'number')
    })
    it('should not resolve immediately if immediate option passed to toFulfill() is false', done => {
        const prop = new ObservableProp()
        prop.set(1)
        wait(prop).toFulfill(val => typeof val === 'number', false).then(newVal => {
            expect(newVal).to.equal(2)
            done()
        })

        // 만약 immediate = true였으면 아래 코드는 then 안의 코드를 실행하지 않음
        prop.set(2)
    })

    // 체이닝 구현용 기능
    it('should not unregister ObservableProp callback if once is set to false', () => {
        const prop = new ObservableProp()
        const callback = chai.spy()
        const waitEntry = wait(prop).toFulfill(val => val === 'red' || val === 'green')
        waitEntry.then(callback)
        waitEntry.once = false

        // first time
        prop.set('red')

        // second time
        prop.set('green')

        // third time(not executed)
        prop.set('blue')

        expect(callback).to.have.been.called.twice
    })
    it('should call passed unmatchedCallback if condition is not met', done => {
        const prop = new ObservableProp()
        const waitEntry = new WaitEntry({ observableProp: prop, unmatchedCallback: () => done() })
        waitEntry.toBe('red')
        prop.set('blue')
    })
})